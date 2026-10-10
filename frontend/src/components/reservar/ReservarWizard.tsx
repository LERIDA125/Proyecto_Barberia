"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { StepServicio } from "./StepServicio";
import { StepBarbero } from "./StepBarbero";
import { StepFechaHora } from "./StepFechaHora";
import { StepConfirmacion } from "./StepConfirmacion";
import { useServicios } from "@/lib/hooks/useServicios";
import { useSesion } from "@/lib/hooks/useSesion";
import { useDisponibilidad } from "@/lib/hooks/useDisponibilidad";
import { getBarberos } from "@/lib/api/barberos";
import { crearTurno } from "@/lib/api/turnos";
import { ApiError } from "@/lib/api/client";
import { claveFechaLocal, formatearFechaCorta, formatearHora, generarDias } from "@/lib/utils/format";
import type { Barbero, FranjaHoraria } from "@/types/api";

const PASOS = ["Servicio", "Profesional", "Horario", "Confirmar"];

function mensajeDe(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

interface ReservarWizardProps {
  servicioInicialId?: string;
}

export function ReservarWizard({ servicioInicialId }: ReservarWizardProps) {
  const router = useRouter();
  const { usuario, loading: sesionCargando } = useSesion();
  const {
    servicios,
    loading: cargandoServicios,
    error: errorServicios,
    recargar: recargarServicios,
  } = useServicios(false);

  const [paso, setPaso] = useState(0);
  const [servicioIdManual, setServicioIdManual] = useState("");
  const [barberoId, setBarberoId] = useState("");
  const [fecha, setFecha] = useState(() => claveFechaLocal(new Date()));
  const [franja, setFranja] = useState<FranjaHoraria | null>(null);
  const [reservando, setReservando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [datosBarberos, setDatosBarberos] = useState<{
    lista: Barbero[];
    error: string | null;
    cargado: boolean;
  }>({ lista: [], error: null, cargado: false });
  const [refetchFranjas, setRefetchFranjas] = useState(0);

  const dias = useMemo(() => generarDias(new Date(), 14), []);

  const servicioInicialValido =
    servicioInicialId && servicios.some((s) => s.id === servicioInicialId)
      ? servicioInicialId
      : "";
  const servicioSeleccionado = servicioIdManual || servicioInicialValido;
  const servicio = servicios.find((s) => s.id === servicioSeleccionado);

  const activoFranjas = Boolean(usuario) && paso === 2;
  const { franjas, cargando: cargandoFranjas, error: errorFranjas } = useDisponibilidad(
    activoFranjas,
    barberoId || undefined,
    servicioSeleccionado || undefined,
    fecha,
    refetchFranjas,
  );

  const cargandoBarberos = Boolean(usuario) && !datosBarberos.cargado;
  const errorBarberos = datosBarberos.error;

  useEffect(() => {
    if (!usuario || datosBarberos.cargado) return;
    getBarberos()
      .then((data) => setDatosBarberos({ lista: data, error: null, cargado: true }))
      .catch((err) =>
        setDatosBarberos({
          lista: [],
          error: mensajeDe(err, "No se pudieron cargar los barberos"),
          cargado: true,
        }),
      );
  }, [usuario, datosBarberos.cargado]);

  const barbero = datosBarberos.lista.find((b) => b.id === barberoId);

  const puedeAvanzar =
    paso === 0
      ? Boolean(servicioSeleccionado)
      : paso === 1
        ? Boolean(barberoId)
        : paso === 2
          ? Boolean(franja)
          : true;

  function irAPaso(nuevo: number) {
    setAviso(null);
    setErrorAccion(null);
    setPaso(nuevo);
  }

  function seleccionarServicio(id: string) {
    setServicioIdManual(id);
    setFranja(null);
    setAviso(null);
  }

  function seleccionarBarbero(id: string) {
    setBarberoId(id);
    setFranja(null);
    setAviso(null);
  }

  function seleccionarFecha(clave: string) {
    setFecha(clave);
    setFranja(null);
    setAviso(null);
  }

  async function confirmar() {
    if (!servicioSeleccionado || !barberoId || !franja) return;
    setReservando(true);
    setErrorAccion(null);
    try {
      await crearTurno({
        barberoId,
        servicioId: servicioSeleccionado,
        fechaInicio: franja.inicio,
      });
      router.push("/mis-turnos");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAviso(err.message);
        setPaso(2);
        setRefetchFranjas((n) => n + 1);
      } else {
        setErrorAccion(mensajeDe(err, "No se pudo crear la reserva"));
      }
      setReservando(false);
    }
  }

  if (sesionCargando) {
    return (
      <div className="px-6 py-12 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="h-16 w-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="px-6 py-12 bg-white max-w-md mx-auto">
        <div className="rounded-none bg-gray-100 p-8 max-w-xl w-full">
          <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900 mb-2">Iniciá sesión para reservar</h1>
          <p className="text-sm text-slate-600 mb-6">Necesitás una cuenta para elegir un horario y confirmar tu turno.</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-none bg-black text-white hover:bg-gray-800 px-6 py-3 text-sm uppercase tracking-widest">
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="rounded-none border border-slate-300 px-6 py-3 text-sm uppercase tracking-widest text-slate-800 hover:bg-gray-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-gray-200">
              Crear cuenta con passkey
            </Link>
            <Link
              href="/servicios"
              className="mt-2 text-sm text-slate-500 underline dark:text-slate-400">
              Ver catálogo de servicios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 bg-white max-w-7xl mx-auto">
      <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900 mb-2">Reservar turno</h1>
      <p className="text-sm text-slate-600 mb-8">Completá los pasos y confirmá tu turno en la barbería.</p>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="p-4 bg-gray-100 rounded-none mb-8">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Tu reserva</h2>
            <dl className="mt-4 space-y-3">
              <ResumenFila etiqueta="Servicio" valor={servicio?.nombre} />
              <ResumenFila etiqueta="Profesional" valor={barbero?.nombre ?? undefined} />
              <ResumenFila
                etiqueta="Fecha"
                valor={franja ? formatearFechaCorta(`${fecha}T12:00:00`) : undefined}
              />
              <ResumenFila etiqueta="Hora" valor={franja ? formatearHora(franja.inicio) : undefined} />
            </dl>
          </div>
        </aside>

        <div>
          <div className="border-t border-gray-100 pt-6">
            <Stepper pasos={PASOS} actual={paso} />

            <div className="mt-6">
              {aviso && (
                <div className="mb-4">
                  <StatusMessage tipo="error" mensaje={aviso} />
                </div>
              )}

              {paso === 0 && (
                <StepServicio
                  servicios={servicios}
                  seleccionadoId={servicioSeleccionado}
                  cargando={cargandoServicios}
                  error={errorServicios}
                  onSeleccionar={seleccionarServicio}
                  onReintentar={() => void recargarServicios()}
                />
              )}
              {paso === 1 && (
                <StepBarbero
                  barberos={datosBarberos.lista}
                  seleccionadoId={barberoId}
                  cargando={cargandoBarberos}
                  error={errorBarberos}
                  onSeleccionar={seleccionarBarbero}
                  onReintentar={() => {
                    setDatosBarberos((d) => ({ ...d, cargado: false, error: null }));
                  }}
                />
              )}
              {paso === 2 && (
                <StepFechaHora
                  dias={dias}
                  fecha={fecha}
                  franjas={franjas}
                  franjaSeleccionada={franja}
                  cargando={cargandoFranjas}
                  error={errorFranjas}
                  servicio={servicio}
                  barbero={barbero}
                  onSeleccionarFecha={seleccionarFecha}
                  onSeleccionarFranja={(f) => {
                    setFranja(f);
                    setAviso(null);
                  }}
                  onReintentar={() => setRefetchFranjas((n) => n + 1)}
                />
              )}
              {paso === 3 && (
                <StepConfirmacion
                  servicio={servicio}
                  barbero={barbero}
                  fecha={fecha}
                  franja={franja ?? undefined}
                  error={errorAccion}
                />
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3 pt-5">
              <Button
                variante="ghost"
                onClick={() => irAPaso(Math.max(paso - 1, 0))}
                disabled={paso === 0 || reservando}
              >
                Atrás
              </Button>
              {paso < PASOS.length - 1 ? (
                <Button onClick={() => irAPaso(paso + 1)} disabled={!puedeAvanzar}>
                  Continuar
                </Button>
              ) : (
                <Button onClick={() => void confirmar()} cargando={reservando} disabled={!franja}>
                  Confirmar reserva
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumenFila({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 dark:text-slate-400">{etiqueta}</dt>
      <dd
        className={`text-sm ${
          valor
            ? "font-medium text-slate-900 dark:text-slate-100"
            : "text-slate-400 dark:text-slate-600"
        }`}
      >
        {valor ?? "Sin elegir"}
      </dd>
    </div>
  );
}