"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SignupMode = "choose" | "create" | "join";

export default function SignupPage() {
  const router = useRouter();

  const [mode, setMode] = useState<SignupMode>("choose");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [homeName, setHomeName] = useState("My Home");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!homeName.trim()) {
      setError("Please enter a home name.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (!data.session || !data.user) {
      setMessage(
        "Account created. Please check your email to confirm your account before signing in."
      );
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { data: home, error: homeError } = await supabase
      .from("homes")
      .insert({
        name: homeName.trim(),
      })
      .select("id")
      .single();

    if (homeError || !home) {
      console.error("Home creation error:", homeError);

      setError(
        "Your account was created, but we could not create your home. Please try again."
      );

      setLoading(false);
      return;
    }

    const { error: membershipError } = await supabase
      .from("home_members")
      .insert({
        home_id: home.id,
        user_id: userId,
        role: "owner",
      });

    if (membershipError) {
      console.error("Home membership creation error:", membershipError);

      setError(
        "Your home was created, but we could not connect your account to it."
      );

      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#010814] text-white">
      {/* Cinematic security background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/marvels-loading-screen.jpg')" }}
      />

      <div className="absolute inset-0 bg-[#010814]/45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(20,110,255,0.22),transparent_35%),linear-gradient(180deg,rgba(0,5,15,0.2),rgba(0,5,15,0.82))]" />

      <div className="absolute left-[-10%] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-[-10%] top-[25%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

      {/* Logo */}
      <div className="relative z-10 flex justify-center px-6 pt-5 sm:pt-7">
        <Link href="/" aria-label="Marvels Home Safety">
          <div className="relative h-[105px] w-[285px] sm:h-[120px] sm:w-[320px]">
            <Image
              src="/marvels-home-safety-logo-transparent.png"
              alt="Marvels Home Safety"
              fill
              priority
              sizes="320px"
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      <div className="relative z-10 flex justify-center px-5 pb-8 pt-1">
        <section className="relative w-full max-w-[470px]">
          <div className="absolute -inset-px rounded-[22px] bg-gradient-to-br from-blue-500 via-blue-500/30 to-orange-500/80" />

          <div className="relative rounded-[21px] border border-white/10 bg-[#020a15]/90 px-6 py-7 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
                GET STARTED
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[0.08em]">
                SIGN UP
              </h1>

              <p className="mx-auto mt-3 max-w-[330px] text-sm leading-6 text-slate-400">
                Create your account or join an existing home to start
                protecting what matters most.
              </p>
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
                Choose an option
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {mode === "choose" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("create");
                      setError("");
                      setMessage("");
                    }}
                    className="group border border-blue-500/60 bg-blue-500/[0.04] px-5 py-7 text-center transition hover:bg-blue-500/[0.10]"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/50 bg-blue-500/10 text-2xl text-blue-300 shadow-[0_0_30px_rgba(37,99,235,0.18)]">
                      ♟
                    </div>

                    <h2 className="mt-5 text-sm font-semibold tracking-wide">
                      CREATE NEW ACCOUNT
                    </h2>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Create a new account and set up a new home.
                    </p>

                    <span className="mt-5 block text-xl text-blue-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("join");
                      setError("");
                      setMessage("");
                    }}
                    className="group border border-orange-500/50 bg-orange-500/[0.03] px-5 py-7 text-center transition hover:bg-orange-500/[0.08]"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/50 bg-orange-500/10 text-2xl text-orange-300 shadow-[0_0_30px_rgba(249,115,22,0.14)]">
                      ⌂
                    </div>

                    <h2 className="mt-5 text-sm font-semibold tracking-wide">
                      JOIN EXISTING HOME
                    </h2>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Join an existing home using an invitation code.
                    </p>

                    <span className="mt-5 block text-xl text-orange-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-300">
                      ◇ Secure
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      Your data is protected
                    </p>
                  </div>

                  <div className="border-l border-white/10 pl-3">
                    <p className="text-xs font-semibold text-blue-300">
                      ▣ Private
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      Only invited members
                    </p>
                  </div>

                  <div className="border-l border-white/10 pl-3">
                    <p className="text-xs font-semibold text-orange-300">
                      ⚡ Instant
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      Get started quickly
                    </p>
                  </div>
                </div>
              </>
            )}

            {mode === "create" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="Email Address"
                    className="w-full border border-white/15 bg-black/30 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Home Name
                  </label>

                  <input
                    type="text"
                    value={homeName}
                    onChange={(event) => setHomeName(event.target.value)}
                    required
                    placeholder="My Home"
                    className="w-full border border-white/15 bg-black/30 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="Create a password"
                    className="w-full border border-white/15 bg-black/30 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                    placeholder="Confirm your password"
                    className="w-full border border-white/15 bg-black/30 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/70"
                  />
                </div>

                {error && (
                  <div className="border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 px-5 py-3.5 text-sm font-bold tracking-[0.14em] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "SETTING UP..." : "CREATE ACCOUNT    →"}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ← Choose another option
                </button>
              </form>
            )}

            {mode === "join" && (
              <div>
                <div className="border border-orange-400/20 bg-orange-400/[0.04] p-5">
                  <p className="text-sm font-semibold text-white">
                    Secure invitation required
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Joining an existing home requires an invitation
                    issued by the home administrator.
                  </p>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    The administrator must verify and approve your
                    membership before you receive access. Family
                    members cannot generate or share invitation codes.
                  </p>
                </div>

                <div className="mt-4 border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    Invitation System
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The secure invitation backend will be connected
                    here once the invitation and approval tables are
                    implemented.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="mt-5 w-full border border-white/10 px-5 py-3 text-sm text-slate-300 hover:border-blue-400/40 hover:text-white"
                >
                  ← Choose another option
                </button>
              </div>
            )}

            <p className="mt-7 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </section>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-5 px-5 pb-6 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300 sm:gap-8">
        <span className="text-blue-300">♢ PROTECT</span>
        <span className="text-slate-600">•</span>
        <span className="text-blue-300">◎ DETECT</span>
        <span className="text-slate-600">•</span>
        <span className="text-blue-300">♧ ALERT</span>
        <span className="text-orange-400">•</span>
        <span className="text-blue-300">♢ RESPOND</span>
      </div>
    </main>
  );
}
