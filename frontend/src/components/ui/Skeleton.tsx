export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-none bg-surface ${className}`} />
  );
}

export function ServicioCardSkeleton() {
  return (
    <div className="rounded-none border border-border bg-surface p-4 shadow-none ">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-1/2" />
      <Skeleton className="mt-3 h-6 w-full" />
    </div>
  );
}