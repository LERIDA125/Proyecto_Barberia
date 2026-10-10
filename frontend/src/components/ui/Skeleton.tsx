export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-none bg-gray-100 dark:bg-slate-800 ${className}`} />
  );
}

export function ServicioCardSkeleton() {
  return (
    <div className="rounded-none border border-gray-100 bg-white p-4 shadow-none dark:border-slate-800 dark:bg-slate-950">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-1/2" />
      <Skeleton className="mt-3 h-6 w-full" />
    </div>
  );
}