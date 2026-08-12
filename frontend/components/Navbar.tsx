import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold shadow-lg shadow-blue-600/20">
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

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>

        <div className="flex items-center md:hidden">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
