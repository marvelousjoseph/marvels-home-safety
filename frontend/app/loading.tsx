export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/20">
          M
        </div>

        <div className="mt-6 h-2 w-32 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
        </div>

        <h1 className="mt-5 text-lg font-semibold">
          Loading Marvel&apos;s Home Safety
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Connecting to your security system...
        </p>
      </div>
    </main>
  );
}
