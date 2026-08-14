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
              Your home. Your security. One intelligent platform.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Marvel&apos;s Home Safety brings your security devices,
              cameras, alerts, and home activity together in one
              centralized security platform designed to help you
              understand what is happening around your home.
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
              One place to monitor your home security and respond to important events.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
              <span>✓ Connected devices</span>
              <span>✓ Intelligent alerts</span>
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
                      Connected Devices
                    </p>

                    <p className="mt-2 text-3xl font-bold">4+</p>

                    <p className="mt-1 text-xs text-emerald-400">
                      Monitoring active
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
                        Security events are being monitored.
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

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-b border-slate-800 bg-slate-950"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Security that brings the important pieces together.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Marvel&apos;s Home Safety is designed to connect the
              security devices around your home and turn their events
              into information you can actually understand and act on.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                01
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Connect
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Connect compatible sensors, cameras, and other
                security devices to your home security environment.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                02
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Understand
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Device events are organized into meaningful security
                activity so you can quickly understand what happened.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                03
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Respond
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Receive important alerts, review security activity,
                and take action from one centralized dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-b border-slate-800 bg-slate-900/30"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              BUILT FOR MODERN HOME SECURITY
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              More than a camera feed.
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Marvel&apos;s Home Safety is being built as a complete
              security management platform rather than another place
              to simply watch a camera.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="text-3xl">🛡️</div>

              <h3 className="mt-4 text-lg font-semibold">
                Home Protection
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Monitor the security state of your home from one
                central platform.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="text-3xl">🚨</div>

              <h3 className="mt-4 text-lg font-semibold">
                Intelligent Alerts
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Important events can be classified and surfaced as
                security alerts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="text-3xl">📹</div>

              <h3 className="mt-4 text-lg font-semibold">
                CCTV Integration
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Connect security events with responsible cameras so
                relevant footage can become part of an investigation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="text-3xl">📡</div>

              <h3 className="mt-4 text-lg font-semibold">
                Device Monitoring
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Keep track of connected security devices and their
                current operating status.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="text-3xl">🔥</div>

              <h3 className="mt-4 text-lg font-semibold">
                Safety Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Detect important events such as smoke, fire-related
                signals, openings, motion, and device tampering.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="text-3xl">📊</div>

              <h3 className="mt-4 text-lg font-semibold">
                Security Activity
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Review security events and activity from a centralized
                security environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Philosophy */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            SECURITY BY DESIGN
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Built with security as a foundation.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl leading-7 text-slate-400">
            From protected device communication and authenticated
            event ingestion to database security and dependency
            monitoring, Marvel&apos;s Home Safety is being developed
            with multiple layers of protection rather than relying on
            a single security measure.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-lg font-semibold">
                Protected Access
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Authentication and controlled access to security
                functions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-lg font-semibold">
                Secure Data Layer
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Database controls designed to prevent unauthorized
                access to home security information.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-lg font-semibold">
                Continuous Improvement
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Security testing and dependency auditing as the
                platform evolves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            LET&apos;S CONNECT
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Have questions about Marvel&apos;s Home Safety?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Whether you want to learn more about the platform,
            discuss CCTV integration, or explore how the system could
            work for your home, we would love to hear from you.
          </p>

          <div className="mt-8">
            <a
              href="mailto:contact@marvelshomesafety.com"
              className="inline-block rounded-xl bg-blue-600 px-8 py-4 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Contact Us
            </a>
          </div>
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
