import { ReservarWizard } from "@/components/reservar/ReservarWizard";

export const instant = false;

export default async function ReservarPage({ searchParams }: PageProps<"/reservar">) {
  const params = await searchParams;
  const servicioId = typeof params.servicio === "string" ? params.servicio : undefined;
  return <ReservarWizard servicioInicialId={servicioId} />;
}