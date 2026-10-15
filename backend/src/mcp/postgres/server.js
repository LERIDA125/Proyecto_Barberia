#!/usr/bin/env node
/**
 * MCP Server local — PostgreSQL (diagnóstico, SOLO LECTURA)
 *
 * Expone dos herramientas de inspección del esquema para uso de agentes
 * durante el desarrollo. Este servidor es un proceso aislado: NO participa
 * de la ejecución de la aplicación y no es importado por controllers,
 * services, routes ni por el schema de Prisma.
 *
 * Transporte: stdio (estándar para servidores MCP locales).
 * Conexión a datos: variable de entorno DATABASE_URL (misma que la app).
 *
 * Uso: npm run mcp:postgres
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Client } = require('pg');
const { z } = require('zod');
require('dotenv').config();

const NOMBRE_SERVIDOR = 'postgres-local';

// Identificador SQL seguro (tabla/columna): letras, dígitos, _ y $, sin
// empezar por dígito. Defensa en profundidad además de query parametrizada.
const RE_IDENTIFICADOR = /^[A-Za-z_][A-Za-z0-9_$]*$/;

function texto(valor) {
  return { content: [{ type: 'text', text: valor }] };
}

function error(motivo) {
  return { content: [{ type: 'text', text: motivo }], isError: true };
}

function conectar() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en el entorno (.env).');
  }
  return new Client({ connectionString: process.env.DATABASE_URL });
}

const servidor = new McpServer({ name: NOMBRE_SERVIDOR, version: '1.0.0' });

/**
 * list_tables — lista las tablas del esquema public.
 * Consulta puramente declarativa contra information_schema (solo lectura).
 */
servidor.registerTool(
  'list_tables',
  {
    description: 'Lista las tablas del esquema public de PostgreSQL.',
    inputSchema: {},
  },
  async () => {
    const db = conectar();
    try {
      await db.connect();
      const { rows } = await db.query(
        `SELECT table_name
           FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
          ORDER BY table_name`
      );
      if (rows.length === 0) {
        return texto('El esquema public no contiene tablas.');
      }
      return texto(JSON.stringify(rows.map((r) => r.table_name), null, 2));
    } catch (e) {
      return error(`No se pudo consultar information_schema: ${e.message}`);
    } finally {
      await db.end().catch(() => {});
    }
  }
);

/**
 * describe_table — estructura (columnas, tipos, nulabilidad, defaults)
 * de una tabla del esquema public. Query parametrizada ($1) contra
 * information_schema; nunca toca los datos de la tabla.
 */
servidor.registerTool(
  'describe_table',
  {
    description:
      'Describe la estructura de una tabla del esquema public: columnas, tipos de datos, nulabilidad y valor por defecto.',
    inputSchema: { table: z.string().describe('Nombre exacto de la tabla') },
  },
  async ({ table }) => {
    if (!RE_IDENTIFICADOR.test(table)) {
      return error(`Nombre de tabla inválido: "${table}".`);
    }
    const db = conectar();
    try {
      await db.connect();
      const { rows } = await db.query(
        `SELECT column_name,
                data_type,
                is_nullable,
                column_default
           FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = $1
          ORDER BY ordinal_position`,
        [table]
      );
      if (rows.length === 0) {
        return error(`La tabla "${table}" no existe en el esquema public.`);
      }
      return texto(JSON.stringify(rows, null, 2));
    } catch (e) {
      return error(`No se pudo describir "${table}": ${e.message}`);
    } finally {
      await db.end().catch(() => {});
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await servidor.connect(transport);
  // stdio framing: nunca escribir en stdout fuera del protocolo.
  console.error(`[${NOMBRE_SERVIDOR}] servidor MCP listo (stdio)`);
}

main().catch((e) => {
  console.error(`[${NOMBRE_SERVIDOR}] error fatal:`, e);
  process.exit(1);
});
