/*
 * Streamed in place of a dashboard page while its data is fetched.
 *
 * Every dashboard route is `force-dynamic` and awaits Supabase, so before this
 * existed a sidebar click left the previous page frozen with nothing to say the
 * click had registered — and the 280ms page-enter animation then played *after*
 * the wait, adding to it instead of covering it. With a loading file the route
 * commits immediately, the entrance plays on this skeleton, and the real
 * content swaps in underneath it.
 *
 * Not paired with `unstable_instant`: that needs cacheComponents and a static
 * shell, and these routes read auth cookies on every request.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-slate-200/80 ${className}`} />;
}

export function DashboardSkeleton({
  /** Stat tiles above the list, matching the overview pages. */
  tiles = 0,
  rows = 4,
}: {
  tiles?: number;
  rows?: number;
}) {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading…</span>

      <Bar className="h-4 w-32" />
      <Bar className="mt-3 h-9 w-72 max-w-full" />

      {tiles > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: tiles }, (_, index) => (
            <div
              key={index}
              className="rounded-[0.9rem] border border-slate-200 bg-white p-5"
            >
              <Bar className="h-3 w-24" />
              <Bar className="mt-3 h-7 w-12" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 divide-y divide-slate-100 rounded-[0.9rem] border border-slate-200 bg-white">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <Bar className="h-4 w-48 max-w-full" />
              <Bar className="mt-2 h-3 w-32 max-w-full" />
            </div>
            <Bar className="h-9 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
