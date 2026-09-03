"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Home", href: "/home" },
  { name: "Security", href: "/security" },
  { name: "Alerts", href: "/alerts" },
  { name: "Devices", href: "/devices" },
  { name: "Activity", href: "/activity" },
  { name: "Recordings", href: "/recordings" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/70 bg-[#020617]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link
          href="/dashboard"
          className="group flex items-center"
          onClick={() => setMenuOpen(false)}
          aria-label="Marvels Home Safety Dashboard"
        >
          <div className="relative h-20 w-20 shrink-0 transition-transform duration-200 group-hover:scale-105 sm:h-[88px] sm:w-[88px]">
            <Image
              src="/marvels-home-safety-logo.png"
              alt="Marvels Home Safety"
              fill
              priority
              sizes="88px"
              className="object-contain"
            />
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-500/10 text-blue-300 shadow-[inset_0_0_20px_rgba(22,131,255,0.05)]"
                    : "text-slate-400 hover:bg-white/[0.035] hover:text-white"
                }`}
              >
                {item.name}

                {isActive && (
                  <span className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                )}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-white/[0.025] text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white md:hidden"
        >
          {menuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-800/70 bg-[#020617]/98 px-5 py-4 backdrop-blur-2xl md:hidden">
          <div className="mx-auto max-w-7xl space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500/10 text-blue-300"
                      : "text-slate-400 hover:bg-white/[0.035] hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
