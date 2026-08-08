export default function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a
          href="/dashboard"
          className="text-xl font-bold text-white"
        >
          Marvel&apos;s Home Safety
        </a>

        <div className="flex items-center gap-6 text-sm text-slate-300">
          <a href="/dashboard" className="hover:text-white">
            Dashboard
          </a>

          <a href="/security" className="hover:text-white">
            Security
          </a>

          <a href="/alerts" className="hover:text-white">
            Alerts
          </a>

          <a href="/devices" className="hover:text-white">
            Devices
          </a>
        </div>
      </div>
    </nav>
  );
}
