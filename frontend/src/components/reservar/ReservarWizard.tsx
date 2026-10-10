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
      <div className="min-h-screen bg-neutral-950 px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto mb-4 h-16 w-24 bg-neutral-900" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12">
        <div className="w-full max-w-xl rounded-none border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-white">Iniciá sesión para reservar</h1>
          <p className="mb-6 text-sm text-neutral-400">Necesitás una cuenta para elegir un horario y confirmar tu turno.</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-none bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-neutral-300">
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="rounded-none border border-neutral-800 px-6 py-3 text-sm font-bold uppercase tracking-widest text-neutral-100 transition hover:border-neutral-300 hover:bg-neutral-900">
              Crear cuenta con passkey
            </Link>
            <Link
              href="/servicios"
              className="mt-2 text-sm text-neutral-400 underline hover:text-white">
              Ver catálogo de servicios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-4xl rounded-none border border-neutral-800 bg-neutral-900 p-6 shadow-2xl sm:p-10">
      <h1 className="mb-2 text-3xl font-black uppercase tracking-tighter text-white">Reservar turno</h1>
      <p className="mb-8 text-sm text-neutral-400">Completá los pasos y confirmá tu turno en la barbería.</p>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="mb-8 rounded-none border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Tu reserva</h2>
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
          <div className="border-t border-neutral-800 pt-6">
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

            <div className="mt-8 border-t border-neutral-800 pt-6">
              {paso < PASOS.length - 1 ? (
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variante="ghost"
                    onClick={() => irAPaso(Math.max(paso - 1, 0))}
                    disabled={paso === 0 || reservando}
                  >
                    Atrás
                  </Button>
                  <Button onClick={() => irAPaso(paso + 1)} disabled={!puedeAvanzar}>
                    Continuar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => void confirmar()}
                    cargando={reservando}
                    disabled={!franja}
                    className="w-full py-5 text-base font-bold"
                  >
                    Confirmar reserva
                  </Button>
                  <Button
                    variante="ghost"
                    onClick={() => irAPaso(Math.max(paso - 1, 0))}
                    disabled={reservando}
                    className="w-full"
                  >
                    Atrás
                  </Button>
                </div>
              )}
            </div>
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
      <dt className="text-xs text-neutral-400">{etiqueta}</dt>
      <dd
        className={`text-sm ${
          valor
            ? "font-medium text-white"
            : "text-neutral-500 "
        }`}
      >
        {valor ?? "Sin elegir"}
      </dd>
    </div>
  );
}