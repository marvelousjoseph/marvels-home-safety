import Image from "next/image";

export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(22,131,255,0.14),transparent_32%),radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.06),transparent_25%)]" />

      <div className="absolute inset-0 marvels-grid opacity-40" />

      <section className="relative z-10 flex w-full max-w-md flex-col items-center px-6 text-center">
        <div className="relative flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
          <div className="absolute inset-2 rounded-full border border-blue-400/10 marvels-pulse" />

          <div className="absolute inset-5 rounded-full border border-orange-400/10" />

          <div className="absolute inset-8 rounded-full border border-blue-400/20 marvels-spin" />

          <div className="relative h-40 w-40 sm:h-48 sm:w-48">
            <Image
              src="/marvels-home-safety-logo.png"
              alt="Marvels Home Safety"
              fill
              priority
              sizes="192px"
              className="object-contain drop-shadow-[0_0_28px_rgba(22,131,255,0.22)]"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-bold tracking-[0.35em] text-blue-400">
            SECURITY SYSTEM
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Initializing your secure environment
          </p>
        </div>

        <div className="mt-7 w-48">
          <div className="h-1 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 via-blue-300 to-orange-400 marvels-pulse" />
          </div>

          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.25em] text-slate-600">
            Please wait
          </p>
        </div>
      </section>
    </main>
  );
}
