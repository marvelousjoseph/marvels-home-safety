import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:flex lg:items-center lg:gap-16 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              MARVEL&apos;S HOME SAFETY
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Intelligent security for the place you call home.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Monitor your home, detect unusual activity, manage connected
              security devices, and respond to threats from one intelligent
              security platform.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/dashboard"
                className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold transition hover:bg-blue-500"
              >
                Open Security Dashboard
              </a>

              <a
                href="/devices"
                className="rounded-xl border border-slate-700 px-6 py-3 text-center font-semibold transition hover:bg-slate-900"
              >
                Explore Devices
              </a>
            </div>
          </div>

          <div className="mt-14 w-full max-w-md lg:mt-0">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">HOME STATUS</p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Your home is secure
                  </h2>
                </div>

                <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  ● SAFE
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Devices</p>
                  <p className="mt-2 text-2xl font-bold">Connected</p>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Alerts</p>
                  <p className="mt-2 text-2xl font-bold">Monitored</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Security engine</p>

                <p className="mt-2 font-semibold text-emerald-400">
                  ● Monitoring your home
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            BUILT FOR HOME SECURITY
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            One platform for your entire home.
          </h2>

          <p className="mt-4 text-slate-400">
            Marvel&apos;s Home Safety connects your security devices and
            turns their events into useful information and actionable alerts.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-2xl">🛡️</div>

            <h3 className="mt-5 text-xl font-semibold">
              Intelligent Protection
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Security events are processed by the platform and evaluated
              against your home&apos;s security state.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-2xl">🚨</div>

            <h3 className="mt-5 text-xl font-semibold">
              Real-Time Alerts
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Important security events can become alerts that require your
              attention.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-2xl">📡</div>

            <h3 className="mt-5 text-xl font-semibold">
              Connected Devices
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Monitor the devices connected to your home and track the events
              they generate.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              From event to action.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Detect",
                text: "A connected device detects activity.",
              },
              {
                number: "02",
                title: "Process",
                text: "Marvel&apos;s security engine processes the event.",
              },
              {
                number: "03",
                title: "Alert",
                text: "Important events can generate security alerts.",
              },
              {
                number: "04",
                title: "Respond",
                text: "You review the event and take action.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-6"
              >
                <p className="text-sm font-bold text-blue-400">
                  {step.number}
                </p>

                <h3 className="mt-4 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Your home. Your security. One platform.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Start monitoring your home through Marvel&apos;s Home Safety.
        </p>

        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
        >
          Enter Dashboard
        </a>
      </section>

      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Marvel&apos;s Home Safety</p>

          <p>Intelligent home security, built for the future.</p>
        </div>
      </footer>
    </main>
  );
}
