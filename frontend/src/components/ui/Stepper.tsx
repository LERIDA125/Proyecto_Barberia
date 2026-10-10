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
                    ? "bg-black text-white dark:bg-white dark:text-slate-900"
                    : "border border-gray-300 bg-gray-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}
                }`}
              >
                {completado ? "✓" : indice + 1}
              </span>
              <span
                className={`text-sm ${
                  completado
                    ? "text-slate-500 line-through decoration-slate-300 dark:text-slate-400 dark:decoration-slate-700"
                    : esActual
                      ? "font-semibold text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                } hidden sm:inline`}
              >
                {etiqueta}
              </span>
              {indice < pasos.length - 1 && (
                <span
                  aria-hidden
                  className={`mx-2 h-px w-6 sm:w-12 ${
                    indice < actual ? "bg-black dark:bg-white" : "bg-gray-100 dark:bg-slate-800"}
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