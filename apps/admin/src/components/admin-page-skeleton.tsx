export function AdminPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-slate-800" />
        <div className="h-4 w-64 max-w-full rounded bg-slate-800/80" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-xl bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-36 rounded-2xl bg-slate-800" />
        <div className="h-36 rounded-2xl bg-slate-800" />
      </div>
      <div className="h-48 rounded-2xl bg-slate-800" />
    </div>
  );
}
