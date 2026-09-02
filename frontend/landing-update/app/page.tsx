import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    title: "DETECT",
    text: "Smart devices monitor your home 24/7 for what matters most.",
    tone: "blue",
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
        <path d="M32 6 51 13v15c0 14-8.4 24.2-19 30C21.4 52.2 13 42 13 28V13l19-7Z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="m22 31 7 7 14-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "ALERT",
    text: "Instant alerts keep you informed the moment something happens.",
    tone: "orange",
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
        <path d="M18 45h28l-4-7V26a10 10 0 0 0-20 0v12l-4 7Z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M27 52a6 6 0 0 0 10 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "VERIFY",
    text: "View live or recorded footage to see exactly what is happening.",
    tone: "blue",
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
        <rect x="8" y="17" width="34" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="m42 27 14-8v26l-14-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "RESPOND",
    text: "Take action quickly and keep your home and loved ones safe.",
    tone: "orange",
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
        <path d="M12 28 32 10l20 18v23H12V28Z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M25 51V35h14v16M32 22v9M27.5 26.5h9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const trustItems = [
  ["shield", "Encrypted & Secure"],
  ["users", "Trusted by Families"],
  ["cloud", "Private & Reliable"],
  ["clock", "24/7 Protection"],
];

function TrustIcon({ type }: { type: string }) {
  if (type === "shield") {
    return <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true"><path d="M16 3 27 7v8c0 8-4.8 12.7-11 15-6.2-2.3-11-7-11-15V7l11-4Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m12 16 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
  }
  if (type === "users") {
    return <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true"><circle cx="12" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="22" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M3 27c0-6 4-9 9-9s9 3 9 9M19 20c5 0 9 2.5 10 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  }
  if (type === "cloud") {
    return <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true"><path d="M9 25h14a7 7 0 0 0 1-13.9A9 9 0 0 0 7 13a6 6 0 0 0 2 12Z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
  }
  return <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 9v8l5 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#03060b] text-white">
      <header className="relative z-50 h-[118px] border-b border-white/[0.08] bg-[#03060b]">
        <nav className="mx-auto flex h-full max-w-[1450px] items-center justify-between px-6 lg:px-8">
          <Link href="/" aria-label="Marvels Home Safety" className="shrink-0">
            <Image
              src="/marvels-home-safety-logo.png"
              alt="Marvels Home Safety"
              width={360}
              height={96}
              priority
              className="h-auto w-[300px] object-contain sm:w-[330px]"
            />
          </Link>

          <div className="hidden h-full items-center gap-12 text-[17px] font-medium text-white/90 lg:flex">
            <Link href="/" className="relative flex h-full items-center">
              Home
              <span className="absolute bottom-[31px] left-0 right-0 mx-auto h-[3px] w-11 rounded-full bg-[#1598ff]" />
            </Link>
            <Link href="#features" className="transition hover:text-white">Features</Link>
            <Link href="#how-it-works" className="transition hover:text-white">How It Works</Link>
            <Link href="#contact" className="transition hover:text-white">Contact Us</Link>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/login" className="hidden rounded-lg border border-white/35 px-7 py-3 text-[17px] font-medium transition hover:bg-white/5 sm:inline-flex">
              Log In
            </Link>
            <Link href="/signup" className="rounded-lg bg-[#0878ee] px-8 py-3 text-[17px] font-medium shadow-[0_8px_28px_rgba(8,120,238,0.25)] transition hover:bg-[#1685f5]">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative h-[566px] overflow-hidden" aria-label="Marvels Home Safety hero">
        <Image
          src="/marvels-hero-visual.png"
          alt=""
          fill
          priority
          className="object-cover object-right"
          sizes="65vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#03060b_0%,#03060b_30%,rgba(3,6,11,.96)_40%,rgba(3,6,11,.40)_62%,rgba(3,6,11,.04)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_77%_38%,rgba(21,128,255,.13),transparent_30%)]" />

        <div className="relative mx-auto flex h-full max-w-[1450px] items-center px-6 lg:px-8">
          <div className="w-full max-w-[575px] pb-2">
            <h1 className="text-[47px] font-black leading-[1.02] tracking-[-0.025em] sm:text-[55px] lg:text-[58px]">
              <span className="block">PROTECT WHAT</span>
              <span className="block">MATTERS.</span>
              <span className="block">STAY CONNECTED.</span>
              <span className="block text-[#087ff5]">STAY SAFE.</span>
            </h1>

            <div className="mt-5 h-[4px] w-11 bg-[#ffac00]" />

            <p className="mt-5 max-w-[500px] text-[18px] leading-[1.6] text-slate-300">
              Marvels Home Safety brings your home security, smart devices,
              alerts and CCTV together so you can protect what matters most.
            </p>

            <div className="mt-8 flex flex-wrap gap-5">
              <Link href="/signup" className="inline-flex h-[62px] items-center justify-center gap-3 rounded-lg bg-[#087ff5] px-8 text-[18px] font-semibold shadow-[0_12px_35px_rgba(8,127,245,.28)] transition hover:bg-[#1689f7]">
                <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
                  <path d="M16 3 28 7v8c0 7.5-5 11.7-12 14-7-2.3-12-6.5-12-14V7l12-4Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="m10 16 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                GET STARTED
              </Link>
              <Link href="#how-it-works" className="inline-flex h-[62px] items-center justify-center gap-3 rounded-lg border border-[#ffad00] px-7 text-[18px] font-semibold text-white transition hover:bg-[#ffad00]/10">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[13px]">▶</span>
                HOW IT WORKS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/[0.08] bg-[#04101d]">
        <div className="mx-auto max-w-[1450px] px-6 pb-6 pt-6 lg:px-8">
          <h2 className="text-center text-[20px] font-bold tracking-[0.31em] text-white">
            A SMARTER WAY TO PROTECT YOUR HOME
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-9 bg-[#ffad00]" />

          <div className="mt-3 grid items-center gap-0 lg:grid-cols-[1fr_50px_1fr_50px_1fr_50px_1fr]">
            {steps.map((step, index) => (
              <div key={step.title} className="contents">
                <article className="min-h-[158px] rounded-xl border border-white/[0.12] bg-[#061523]/90 px-5 py-5">
                  <div className="flex items-center gap-5">
                    <div className={`flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full border ${step.tone === "blue" ? "border-[#0c9bff] text-[#159cff]" : "border-[#ffad00] text-[#ffad00]"}`}>
                      {step.icon}
                    </div>
                    <div>
                      <h3 className={`text-[21px] font-bold ${step.tone === "blue" ? "text-[#159cff]" : "text-[#ffad00]"}`}>{step.title}</h3>
                      <p className="mt-2 text-[14px] leading-6 text-slate-300">{step.text}</p>
                    </div>
                  </div>
                </article>
                {index < steps.length - 1 && (
                  <div className="hidden items-center justify-center lg:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#071729] text-white">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/[0.08] bg-[#020812]">
        <div className="mx-auto flex min-h-[78px] max-w-[1450px] items-center justify-between gap-4 px-6 lg:px-8">
          {trustItems.map(([icon, label], index) => (
            <div key={label} className="flex flex-1 items-center justify-center gap-3 text-slate-300">
              <TrustIcon type={icon} />
              <span className="text-[16px]">{label}</span>
              {index < trustItems.length - 1 && <span className="ml-auto hidden h-8 w-px bg-white/20 lg:block" />}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="sr-only">
        <h2>Contact Marvels Home Safety</h2>
      </section>
    </main>
  );
}
