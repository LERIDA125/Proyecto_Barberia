# Feature: ampliacion-agenda

- Branch: `feature/clientes` (commit directo del usuario)
- Commit: `d3cb5a1` (2026-10-13, autor: Fernando Rucci)
- Delivery strategy: `exception-ok` — cambio directo sin slice PR

## Goal

Panel admin: mostrar la **agenda próxima (30 días)** en vez de solo el día actual, y mejorar la legibilidad de la fecha en las tarjetas del panel.

## Changes

- `backend/src/services/barberos.service.js` — `rangoFechas(desde, hasta)`: el default "hoy" se extiende 30 días (`fin.setUTCDate(fin.getUTCDate() + 30)`); el comportamiento con `desde`/`hasta` explícitos queda igual.
- `frontend/src/app/panel/page.tsx` — título "Agenda próxima (30 días)" y textos de empty state actualizados.
- `frontend/src/components/panel/TurnoPanelCard.tsx` — fecha legible (`martes 20 oct`, es-AR, tz `America/Argentina/Buenos_Aires`) junto a la hora, con columna más ancha en el grid.

## Status

- [x] Implementado y commiteado por el usuario: `d3cb5a1` sobre `feature/clientes` (working tree limpio, sincronizado con `origin/feature/clientes`).
- Registrado en `ESTADO.md` (13-oct) como **Panel Admin — Agenda 30 días** (cerrado).

## RDD

- Sin revisión nativa sobre este commit: quedó fuera del flujo ODD (commit del usuario) y el slice se cerró por aprobación humana explícita junto con `metricas-dashboard` (runtime `immutable_review_transport_unsupported`).