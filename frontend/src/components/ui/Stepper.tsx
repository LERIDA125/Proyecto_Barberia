interface StepperProps {
  pasos: string[];
  actual: number;
}

export function Stepper({ pasos, actual }: StepperProps) {
  return (
    <ol className="flex items-center" aria-label="Progreso de la reserva">
      {pasos.map((etiqueta, indice) => {
        const completado = indice < actual;
        const esActual = indice === actual;
        return (
          <li key={etiqueta} className="flex flex-1 items-center last:flex-none">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-semibold transition-colors ${
                  completado || esActual
                    ? "bg-foreground text-background"
                    : "border border-border bg-surface text-muted "}
                }`}
              >
                {completado ? "✓" : indice + 1}
              </span>
              <span
                className={`text-sm ${
                  completado
                    ? "text-muted line-through decoration-border "
                    : esActual
                      ? "font-semibold text-foreground "
                      : "text-muted "
                } hidden sm:inline`}
              >
                {etiqueta}
              </span>
              {indice < pasos.length - 1 && (
                <span
                  aria-hidden
                  className={`mx-2 h-px w-6 sm:w-12 ${
                    indice < actual ? "bg-foreground" : "bg-surface "}
                  }`}
                />
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}