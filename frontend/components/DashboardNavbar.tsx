"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    name: "Home",
    href: "/home",
    icon: "home",
  },
  {
    name: "Security",
    href: "/security",
    icon: "security",
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: "alerts",
  },
  {
    name: "Devices",
    href: "/devices",
    icon: "devices",
  },
  {
    name: "Activity",
    href: "/activity",
    icon: "activity",
  },
];

function NavIcon({
  type,
}: {
  type: string;
}) {
  const common = "h-[21px] w-[21px]";

  if (type === "dashboard") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={common}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (type === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={common}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    );
  }

  if (type === "security") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={common}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 3 20 6v5.5c0 5.2-3.4 8.2-8 9.5-4.6-1.3-8-4.3-8-9.5V6l8-3Z" />
        <path d="m8.7 12 2.2 2.2 4.5-4.7" />
      </svg>
    );
  }

  if (type === "alerts") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={common}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (type === "devices") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={common}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="4" y="5" width="16" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={common}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <header className="marvels-mobile-header md:hidden">
        <Link
          href="/dashboard"
          aria-label="Marvels Home Safety Dashboard"
          onClick={() => setMenuOpen(false)}
        >
          <div className="relative h-14 w-36">
            <Image
              src="/marvels-home-safety-logo.png"
              alt="Marvels Home Safety"
              fill
              priority
              sizes="144px"
              className="object-contain object-left"
            />
          </div>
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center border border-slate-700 bg-slate-900 text-slate-300"
        >
          {menuOpen ? (
            <span className="text-xl">×</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </header>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="marvels-mobile-menu md:hidden">
          <div className="space-y-1">
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
                  className={`marvels-sidebar-link ${
                    isActive
                      ? "marvels-sidebar-link-active"
                      : ""
                  }`}
                >
                  <NavIcon type={item.icon} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        data-marvels-app-sidebar
        className="marvels-sidebar hidden md:flex"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Brand */}
          <div className="border-b border-slate-800/80 px-5 py-5">
            <Link
              href="/dashboard"
              aria-label="Marvels Home Safety Dashboard"
              className="block"
            >
              <div className="relative mx-auto h-[125px] w-[190px]">
                <Image
                  src="/marvels-home-safety-logo.png"
                  alt="Marvels Home Safety"
                  fill
                  priority
                  sizes="190px"
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Main Menu
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`marvels-sidebar-link ${
                      isActive
                        ? "marvels-sidebar-link-active"
                        : ""
                    }`}
                  >
                    <NavIcon type={item.icon} />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="my-6 border-t border-slate-800/70" />

            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              System
            </p>

            <Link
              href="/recordings"
              className="marvels-sidebar-link"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-[21px] w-[21px]"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="13"
                  rx="2"
                />
                <path d="m10 10 5 2.5-5 2.5v-5Z" />
              </svg>

              <span>Recordings</span>
            </Link>
          </nav>

          {/* Account */}
          <div className="border-t border-slate-800/80 p-4">
            <div className="flex items-center gap-3 border border-slate-800/80 bg-slate-950/60 px-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-300">
                M
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  Home Owner
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-600">
                  Marvels Home Safety
                </p>
              </div>

              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
