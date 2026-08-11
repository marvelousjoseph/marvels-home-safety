import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
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
              A smart home security platform designed to connect your
              security devices, understand events, and help you respond
              when something needs your attention.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/login"
                className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold transition hover:bg-blue-500"
              >
                Get Started
              </a>

              <a
                href="/login"
                className="rounded-xl border border-slate-700 px-6 py-3 text-center font-semibold transition hover:bg-slate-900"
              >
                Sign In
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Secure access to your personal home security dashboard.
            </p>
          </div>

          {/* Product Preview */}
          <div className="mt-14 w-full max-w-md lg:mt-0">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-slate-500">
                    SECURITY CENTER
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Home Protection
                  </h2>
                </div>

                <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  ● ACTIVE
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Connected Devices
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Sensors and security equipment
                      </p>
                    </div>

                    <span className="text-emerald-400">●</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Security Events
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Activity detected around your home
                      </p>
                    </div>

                    <span className="text-blue-400">●</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Intelligent Alerts
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Important events brought to your attention
                      </p>
                    </div>

                    <span className="text-yellow-400">●</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-blue-600/10 p-4">
                <p className="text-sm font-semibold text-blue-400">
                  Protection starts here.
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Sign in to access your security dashboard and connected
                  home devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            THE PLATFORM
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Everything starts with visibility.
          </h2>

          <p className="mt-4 text-slate-400">
            Marvel&apos;s Home Safety brings your home security information
            together so you can understand what is happening and respond
            when necessary.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-2xl">🛡️</div>

            <h3 className="mt-5 text-xl font-semibold">
              Intelligent Protection
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Security events can be processed and turned into meaningful
              information about the state of your home.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-2xl">🚨</div>

            <h3 className="mt-5 text-xl font-semibold">
              Security Alerts
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Important events can become alerts so you can quickly see
              what requires your attention.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-2xl">📡</div>

            <h3 className="mt-5 text-xl font-semibold">
              Connected Devices
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Keep track of the security devices connected to your home
              and the events they generate.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              From detection to response.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              The platform is designed around a simple security workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Detect",
                text: "A connected security device detects activity.",
              },
              {
                number: "02",
                title: "Process",
                text: "The security platform processes the event.",
              },
              {
                number: "03",
                title: "Alert",
                text: "Important events can generate security alerts.",
              },
              {
                number: "04",
                title: "Respond",
                text: "You review the information and take action.",
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          GET STARTED
        </p>

        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
          Your home deserves intelligent protection.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Sign in to access your Marvel&apos;s Home Safety security
          dashboard.
        </p>

        <a
          href="/login"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
        >
          Access Your Security Center
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
