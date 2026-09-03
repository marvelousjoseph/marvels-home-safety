"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Home", href: "/home", icon: "home" },
  { name: "Security", href: "/security", icon: "security" },
  { name: "Alerts", href: "/alerts", icon: "alerts" },
  { name: "Devices", href: "/devices", icon: "devices" },
  { name: "Activity", href: "/activity", icon: "activity" },
];

function NavIcon({ type }: { type: string }) {
  const common = "h-[19px] w-[19px]";

  if (type === "dashboard") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={common}
        stroke="currentColor"
        strokeWidth="1.7"
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
        strokeWidth="1.7"
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
        strokeWidth="1.7"
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
        strokeWidth="1.7"
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
        strokeWidth="1.7"
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
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[18px] w-[18px]"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" />
      <path d="M13 8l4 4-4 4" />
      <path d="M17 12H9" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function getDisplayName(
  user: { user_metadata?: Record<string, unknown>; email?: string | null } | null
) {
  const metadata = user?.user_metadata ?? {};

  const possibleName =
    metadata.full_name ??
    metadata.name ??
    metadata.display_name ??
    metadata.username;

  if (typeof possibleName === "string" && possibleName.trim()) {
    return possibleName.trim();
  }

  return "Home Owner";
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Home Owner");
  const [userRole, setUserRole] = useState("Home Owner");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) return;

      const displayName = getDisplayName(user);

      setUserName(displayName);

      const { data: membership } = await supabase
        .from("home_members")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (membership?.role) {
        setUserRole(
          String(membership.role)
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        );
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUserName("Home Owner");
        setUserRole("Home Owner");
        return;
      }

      const displayName = getDisplayName(session.user);

      setUserName(displayName);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    setMenuOpen(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile header */}
      <header className="marvels-mobile-header md:hidden">
        <Link
          href="/dashboard"
          aria-label="Marvels Home Safety Dashboard"
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex w-[150px] flex-col items-center justify-center">
            <div className="relative h-9 w-10">
              <Image
                src="/marvels-home-safety-m-logo.png"
                alt="Marvels Home Safety"
                fill
                priority
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              Marvels Home Safety
            </span>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          <MenuIcon open={menuOpen} />
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
                    isActive ? "marvels-sidebar-link-active" : ""
                  }`}
                >
                  <NavIcon type={item.icon} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/[0.08] text-xs font-semibold text-blue-300">
                {getInitials(userName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-200">
                  {userName}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-600">
                  {userRole}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Log out"
                title="Log out"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-500 transition hover:bg-slate-900 hover:text-slate-200 disabled:cursor-wait disabled:opacity-50"
              >
                <LogoutIcon />
              </button>
            </div>
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
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-[76px] w-[76px]">
                  <Image
                    src="/marvels-home-safety-m-logo.png"
                    alt="Marvels Home Safety"
                    fill
                    priority
                    sizes="76px"
                    className="object-contain"
                  />
                </div>

                <span className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                  Marvels Home Safety
                </span>
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
                      isActive ? "marvels-sidebar-link-active" : ""
                    }`}
                  >
                    <NavIcon type={item.icon} />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Account */}
          <div className="border-t border-slate-800/80 px-4 py-3">
            <div className="flex items-center gap-3 px-1 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/[0.08] text-xs font-semibold text-blue-300">
                {getInitials(userName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-200">
                  {userName}
                </p>

                <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                  {userRole}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Log out"
                title="Log out"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-500 transition hover:bg-slate-900 hover:text-slate-100 disabled:cursor-wait disabled:opacity-50"
              >
                <LogoutIcon />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
