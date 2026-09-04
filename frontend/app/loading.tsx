import Image from "next/image";

export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020817] text-white">
      {/* Cinematic night environment */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        {/* Distant house silhouettes */}
        <div className="absolute bottom-0 left-0 h-[46%] w-[30%] bg-gradient-to-t from-black/80 via-slate-950/70 to-transparent blur-[2px]" />
        <div className="absolute bottom-0 right-0 h-[52%] w-[34%] bg-gradient-to-t from-black/85 via-slate-950/70 to-transparent blur-[2px]" />

        {/* Blue security lighting */}
        <div className="absolute left-0 top-[35%] h-px w-[34%] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent shadow-[0_0_28px_rgba(37,99,235,0.65)]" />
        <div className="absolute right-0 top-[43%] h-px w-[30%] bg-gradient-to-l from-transparent via-orange-400/60 to-transparent shadow-[0_0_28px_rgba(249,115,22,0.5)]" />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(1,7,18,0.45)_58%,rgba(0,0,0,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,23,0.2),rgba(2,8,23,0.82))]" />
      </div>

      {/* Security HUD */}
      <div className="absolute left-1/2 top-[16%] h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-blue-500/10" />
      <div className="absolute left-1/2 top-[16%] h-[340px] w-[340px] -translate-x-1/2 rounded-full border border-blue-400/10" />
      <div className="absolute left-1/2 top-[16%] h-[260px] w-[260px] -translate-x-1/2 rounded-full border border-orange-400/10" />

      <div className="absolute left-1/2 top-[16%] h-2 w-2 -translate-x-1/2 rounded-full bg-blue-400 shadow-[0_0_22px_rgba(59,130,246,0.95)] animate-pulse" />

      {/* Main loading content */}
      <section className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center">
        {/* Logo */}
        <div className="relative h-[220px] w-[250px] sm:h-[280px] sm:w-[320px]">
          <Image
            src="/marvels-loading-logo.png"
            alt="Marvels Home Safety"
            fill
            priority
            sizes="320px"
            className="object-contain drop-shadow-[0_0_35px_rgba(37,99,235,0.28)]"
          />
        </div>

        {/* Brand */}
        <div className="-mt-3">
          <h1 className="text-2xl font-semibold uppercase tracking-[0.42em] text-slate-100 sm:text-4xl">
            Marvels
          </h1>

          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.5em] text-slate-300 sm:text-sm">
              Home Safety
            </span>
            <span className="h-px w-12 bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.8)]" />
          </div>
        </div>

        {/* Security sequence */}
        <div className="mt-8 flex items-center gap-4 text-[9px] font-medium uppercase tracking-[0.32em] text-slate-400 sm:gap-7 sm:text-[11px]">
          <span className="text-slate-200">Protect</span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse" />
          <span>Detect</span>
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)] animate-pulse" />
          <span>Alert</span>
          <span className="h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_12px_rgba(253,186,116,0.9)] animate-pulse" />
          <span>Respond</span>
        </div>

        {/* Loading bar */}
        <div className="mt-9 w-full max-w-md">
          <div className="h-2 overflow-hidden rounded-full border border-blue-400/40 bg-slate-950/80 p-[2px] shadow-[0_0_25px_rgba(37,99,235,0.18)]">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-orange-400 shadow-[0_0_18px_rgba(59,130,246,0.75)] animate-[loading_2.4s_ease-in-out_infinite]" />
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-slate-400">
            Loading Securely...
          </p>
        </div>

        {/* Bottom identity */}
        <div className="mt-12 flex items-center gap-4 text-[9px] uppercase tracking-[0.4em] text-slate-500">
          <span className="h-px w-10 bg-blue-500/50" />
          <span>Your Home</span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span>Our Priority</span>
          <span className="h-px w-10 bg-orange-500/50" />
        </div>
      </section>
    </main>
  );
}
