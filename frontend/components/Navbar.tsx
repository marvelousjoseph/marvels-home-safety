import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold">
            M
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              Marvel&apos;s
            </p>

            <p className="text-xs text-slate-400">
              Home Safety
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">

          <Link
            href="/"
            className="transition hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className="transition hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/devices"
            className="transition hover:text-white"
          >
            Devices
          </Link>

          <Link
            href="/alerts"
            className="transition hover:text-white"
          >
            Alerts
          </Link>

          <Link
            href="/security"
            className="transition hover:text-white"
          >
            Security
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
          >
            Login
          </Link>

        </div>

        <div className="flex items-center md:hidden">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Dashboard
          </Link>
        </div>

      </div>
    </nav>
  );
}
