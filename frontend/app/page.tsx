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
                href="#contact"
                className="rounded-xl border border-slate-700 px-7 py-3.5 text-center font-semibold transition hover:border-slate-600 hover:bg-slate-900"
              >
                Contact Us
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

      {/* Trust / Introduction */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="mt-1 text-sm text-slate-500">
                Security visibility
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold">1</p>
              <p className="mt-1 text-sm text-slate-500">
                Central security platform
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold">∞</p>
              <p className="mt-1 text-sm text-slate-500">
                Room to grow with your home
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 sm:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            WHY MARVEL&apos;S HOME SAFETY
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Everything you need to understand your home&apos;s security.
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            Instead of checking different systems separately, Marvel&apos;s
            Home Safety brings important security information together in
            one place.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🛡️",
              title: "Home Protection",
              text: "Keep your security information organized and accessible from one central platform.",
            },
            {
              icon: "🚨",
              title: "Smart Alerts",
              text: "See important security events and quickly identify what needs your attention.",
            },
            {
              icon: "📡",
              title: "Connected Devices",
              text: "Monitor the security devices connected to your home and their current status.",
            },
            {
              icon: "👁️",
              title: "Security Visibility",
              text: "Understand what is happening around your home through a simple security dashboard.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-700"
            >
              <div className="text-3xl">{feature.icon}</div>

              <h3 className="mt-6 text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-y border-slate-800 bg-slate-900/40"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              From detection to response.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-slate-400">
              Marvel&apos;s Home Safety is designed around a simple
              security workflow.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Detect",
                text: "Your connected security devices detect activity.",
              },
              {
                number: "02",
                title: "Understand",
                text: "Security events are organized into meaningful information.",
              },
              {
                number: "03",
                title: "Alert",
                text: "Important events are surfaced so you know what matters.",
              },
              {
                number: "04",
                title: "Respond",
                text: "Review the situation and decide what action is needed.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6"
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

      {/* Product Preview */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              YOUR SECURITY CENTER
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Everything important, in one place.
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Once you sign in, your security dashboard gives you a
              central view of your home&apos;s status, alerts, connected
              devices, and recent security activity.
            </p>

            <a
              href="/login"
              className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Explore Your Security Center
            </a>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  LIVE OVERVIEW
                </p>

                <p className="mt-2 text-xl font-bold">
                  Your home is secure
                </p>
              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                ● SAFE
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["Active Alerts", "0", "No active threats"],
                ["Connected Devices", "4", "4 online"],
                ["Critical Alerts", "0", "None detected"],
              ].map(([label, value, description]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div>
                    <p className="text-sm text-slate-400">{label}</p>

                    <p className="mt-1 text-xs text-slate-500">
                      {description}
                    </p>
                  </div>

                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="border-y border-slate-800 bg-slate-900/40"
      >
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            CONTACT US
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Have questions about your home security?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            We&apos;re building Marvel&apos;s Home Safety to make home
            security easier to understand, monitor, and manage.
          </p>

          <a
            href="mailto:contact@marvelshomesafety.com"
            className="mt-8 inline-block rounded-xl border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-800"
          >
            Contact Marvel&apos;s Home Safety
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
          GET STARTED
        </p>

        <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
          A smarter way to protect your home.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-slate-400">
          Connect your security system, understand what is happening,
          and stay informed when your home needs your attention.
        </p>

        <a
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
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
