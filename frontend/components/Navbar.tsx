import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">

        {/* Brand */}
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

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 md:flex">

          <Link
            href="/"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/#features"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Features
          </Link>

          <Link
            href="/#how-it-works"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            How It Works
          </Link>

          <Link
            href="/#contact"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Contact
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Sign In
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            Get Started
          </Link>

        </div>

        {/* Mobile */}
        <div className="flex items-center md:hidden">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}
