import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Smart Detection",
    text: "Monitor activity across connected sensors and security devices from one place.",
  },
  {
    number: "02",
    title: "Instant Alerts",
    text: "Important events are surfaced quickly so you know when your home needs attention.",
  },
  {
    number: "03",
    title: "Security Verification",
    text: "Connect events with available security information so you can understand what happened.",
  },
  {
    number: "04",
    title: "Fast Response",
    text: "Review the situation and take the appropriate action from your security center.",
  },
];

const devices = [
  { name: "Front Door", type: "Door Sensor", status: "Protected" },
  { name: "Living Room", type: "Camera", status: "Online" },
  { name: "Kitchen", type: "Smoke Detector", status: "Protected" },
  { name: "Bedroom", type: "Window Sensor", status: "Protected" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-white">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Marvels Home Safety"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-blue-950/20">
              {/* Replace this with the exact logo asset path if your logo is in /public */}
              <span className="text-lg font-black text-blue-400">M</span>
            </div>

            <div className="leading-none">
              <div className="text-sm font-black tracking-[0.18em] text-white">
                MARVELS
              </div>
              <div className="mt-1 text-[9px] font-semibold tracking-[0.22em] text-slate-400">
                HOME SAFETY
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link className="transition hover:text-white" href="/">
              Home
            </Link>
            <Link className="transition hover:text-white" href="#features">
              Features
            </Link>
            <Link className="transition hover:text-white" href="#how-it-works">
              How It Works
            </Link>
            <Link className="transition hover:text-white" href="#contact">
              Contact Us
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Log In
            </Link>

            <Link
              href="/signup"
              className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-500/20"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(249,115,22,0.08),transparent_24%)]" />

        <div className="absolute right-[-15%] top-[18%] h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[45%] h-[360px] w-[360px] rounded-full bg-orange-500/5 blur-[100px]" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 pb-20 pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-28">
          {/* Hero copy */}
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.07] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              Intelligent Home Security
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">
              MARVELS HOME SAFETY
            </p>

            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              PROTECT WHAT
              <br />
              MATTERS.
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-blue-500 to-orange-400 bg-clip-text text-transparent">
                STAY CONNECTED.
              </span>
              <br />
              STAY SAFE.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              A smarter way to understand, monitor, and respond to what is
              happening around your home—bringing security devices, alerts,
              cameras, and activity together.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold shadow-[0_15px_50px_rgba(37,99,235,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Get Started
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-bold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                See How It Works
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Connected devices
              </span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Real-time alerts
              </span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Centralized security
              </span>
            </div>
          </div>

          {/* Security interface */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -inset-10 rounded-[3rem] bg-blue-600/10 blur-[70px]" />

            <div className="relative rotate-0 rounded-[2rem] border border-white/10 bg-[#0a0e15]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-4 lg:rotate-[1deg]">
              {/* Window chrome */}
              <div className="rounded-[1.5rem] border border-white/[0.07] bg-[#080b11] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Security Center
                    </p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight">
                      Home Overview
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400">
                      SECURE
                    </span>
                  </div>
                </div>

                {/* Main status */}
                <div className="mt-5 rounded-2xl border border-blue-400/10 bg-gradient-to-br from-blue-500/[0.08] to-transparent p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">SYSTEM STATUS</p>
                      <p className="mt-2 text-lg font-bold">
                        Your home is protected
                      </p>
                    </div>

                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.05]">
                      <div className="absolute inset-2 rounded-full border border-emerald-400/10" />
                      <span className="text-xl text-emerald-400">✓</span>
                    </div>
                  </div>

                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" />
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500">
                    All connected systems responding normally
                  </p>
                </div>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">
                      Alerts
                    </p>
                    <p className="mt-2 text-2xl font-black">0</p>
                    <p className="mt-1 text-[9px] text-emerald-400">
                      No threats
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">
                      Devices
                    </p>
                    <p className="mt-2 text-2xl font-black">4</p>
                    <p className="mt-1 text-[9px] text-blue-400">
                      Connected
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">
                      Status
                    </p>
                    <p className="mt-2 text-2xl font-black">24/7</p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      Monitoring
                    </p>
                  </div>
                </div>

                {/* Devices */}
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-300">
                      Connected Security
                    </p>
                    <span className="text-[9px] text-slate-500">
                      4 systems
                    </span>
                  </div>

                  <div className="space-y-2">
                    {devices.map((device) => (
                      <div
                        key={device.name}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-xs text-blue-300">
                            {device.type === "Camera" ? "◉" : "◆"}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-300">
                              {device.name}
                            </p>
                            <p className="mt-0.5 text-[9px] text-slate-600">
                              {device.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[9px] font-semibold text-emerald-400">
                            {device.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="mt-5 flex items-center justify-between rounded-xl border border-orange-400/10 bg-orange-400/[0.035] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)]" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-300">
                        Security monitoring active
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-600">
                        Last system check completed moments ago
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-orange-400">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05070b] to-transparent" />
      </section>

      {/* Feature intro */}
      <section id="features" className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
                WHY MARVELS
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Security that works
                <br />
                together.
              </h2>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Instead of checking different systems separately, Marvels Home
              Safety brings important security information together so you can
              understand what is happening and respond with confidence.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.04]"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition group-hover:bg-blue-500/10" />

                <p className="relative text-[10px] font-bold tracking-[0.2em] text-blue-400">
                  {feature.number}
                </p>

                <h3 className="relative mt-8 text-lg font-bold">
                  {feature.title}
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-slate-500">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-white/[0.06] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Detect. Alert. Verify. Respond.
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">
              Marvels Home Safety turns activity from your connected security
              system into a clear workflow.
            </p>
          </div>

          <div className="relative mt-14 grid gap-5 md:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-gradient-to-r from-blue-500/30 via-blue-400/20 to-orange-400/30 md:block" />

            {[
              ["01", "Detect", "Devices detect activity around your home."],
              ["02", "Alert", "Important events are surfaced immediately."],
              ["03", "Verify", "Review available security information."],
              ["04", "Respond", "Take the action the situation requires."],
            ].map(([number, title, text]) => (
              <div key={number} className="relative">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#080b11] shadow-xl">
                  <span className="text-sm font-black text-blue-400">
                    {number}
                  </span>
                </div>

                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product philosophy */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(37,99,235,0.07),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              BUILT FOR YOUR HOME
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              One security picture.
              <br />
              Less uncertainty.
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Your security system should not leave you guessing. Marvels Home
              Safety is designed to connect events, devices, alerts, and
              available camera information into a single experience.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold transition hover:bg-blue-500"
            >
              Explore Your Security Center
            </Link>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-[#080b11] p-5 shadow-2xl">
            <div className="rounded-2xl border border-white/[0.06] bg-[#05070b] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    EVENT FLOW
                  </p>
                  <p className="mt-2 text-sm font-bold">Security activity</p>
                </div>

                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[9px] font-bold text-blue-400">
                  MONITORING
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  ["01", "Sensor activity detected", "Front Door"],
                  ["02", "Security event created", "System"],
                  ["03", "Camera verification", "Assigned camera"],
                  ["04", "Alert delivered", "Home members"],
                ].map(([number, title, location]) => (
                  <div
                    key={number}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4"
                  >
                    <span className="text-[10px] font-black text-blue-400">
                      {number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-300">
                        {title}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-600">
                        {location}
                      </p>
                    </div>

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="border-y border-white/[0.06] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            CONTACT US
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Building the future of home safety.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Have questions about Marvels Home Safety or want to learn more
            about the platform?
          </p>

          <a
            href="mailto:contact@marvelshomesafety.com"
            className="mt-8 inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-bold transition hover:border-blue-400/30 hover:bg-white/[0.06]"
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_45%)]" />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
            GET STARTED
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Protect what matters.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Create your account and bring your home security into one
            intelligent platform.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold shadow-[0_15px_50px_rgba(37,99,235,0.2)] transition hover:bg-blue-500"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/10 px-8 py-4 text-sm font-bold text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 Marvels Home Safety</p>
          <p>Intelligent home security, built for the future.</p>
        </div>
      </footer>
    </main>
  );
}
