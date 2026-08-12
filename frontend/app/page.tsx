import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
              ● Intelligent Home Security
            </div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
              MARVEL&apos;S HOME SAFETY
            </p>

            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Protect what matters most.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Marvel&apos;s Home Safety brings your security devices,
              alerts, and home activity together in one intelligent
              security platform.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/signup"
                className="rounded-xl bg-blue-600 px-7 py-3.5 text-center font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Get Started
              </a>

              <a
                href="/login"
                className="rounded-xl border border-slate-700 px-7 py-3.5 text-center font-semibold transition hover:border-slate-600 hover:bg-slate-900"
              >
                Sign In
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Create your account and start managing your home security.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
              <span>✓ Connected devices</span>
              <span>✓ Security alerts</span>
              <span>✓ Centralized monitoring</span>
            </div>
          </div>

          {/* Security Center Preview */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-blue-600/10 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Security Center
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Home Overview
                    </h2>
                  </div>

                  <div className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                    ● SAFE
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-500">
                      Active Alerts
                    </p>

                    <p className="mt-2 text-3xl font-bold">0</p>

                    <p className="mt-1 text-xs text-emerald-400">
                      No active threats
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-500">
                      Devices
                    </p>

                    <p className="mt-2 text-3xl font-bold">4</p>

                    <p className="mt-1 text-xs text-emerald-400">
                      All systems online
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Security Monitoring
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Your home is being monitored.
                      </p>
                    </div>

                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    "Front Door Sensor",
                    "Living Room Camera",
                    "Kitchen Smoke Detector",
                    "Bedroom Window Sensor",
                  ].map((device) => (
                    <div
                      key={device}
                      className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
                    >
                      <span className="text-sm text-slate-300">
                        {device}
                      </span>

                      <span className="text-xs font-medium text-emerald-400">
                        Online
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Product Introduction */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
          YOUR SECURITY CENTER
        </p>

        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
          Everything important, in one place.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
          Once you sign in, Marvel&apos;s Home Safety gives you a
          centralized view of your home, security status, alerts,
          connected devices, and security activity.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">🛡️</div>

            <h3 className="mt-4 text-lg font-semibold">
              Home Protection
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Monitor your home security from one central platform.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">🚨</div>

            <h3 className="mt-4 text-lg font-semibold">
              Security Alerts
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Stay informed when important security events occur.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">📡</div>

            <h3 className="mt-4 text-lg font-semibold">
              Connected Devices
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Keep track of the devices protecting your home.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <a
            href="/signup"
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            Create Your Account
          </a>

          <p className="mt-4 text-sm text-slate-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Marvel&apos;s Home Safety</p>

          <p>Intelligent home security, built for the future.</p>
        </div>
      </footer>
    </main>
  );
}
