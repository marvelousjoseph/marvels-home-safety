"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
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
        className="absolute inset-0 bg-cover bg-center sm:bg-[length:100%_100%]"
        style={{ backgroundImage: "url('/marvels-auth-login-scene.jpg')" }}
      />

      <div className="absolute inset-0 bg-[#010814]/45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(20,110,255,0.22),transparent_35%),linear-gradient(180deg,rgba(0,5,15,0.25),rgba(0,5,15,0.78))]" />

      {/* Atmospheric lighting */}
      <div className="absolute left-[-10%] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-[-10%] top-[25%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

      {/* Top logo */}
      <div className="relative z-10 flex justify-center px-6 pt-8 sm:pt-10">
        <Link href="/" aria-label="Marvels Home Safety">
          <div className="relative h-[175px] w-[430px] sm:h-[205px] sm:w-[500px]">
            <Image
              src="/marvels-auth-logo.png"
              alt="Marvels Home Safety"
              fill
              priority
              sizes="360px"
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Login panel */}
      <div className="relative z-10 flex justify-center px-5 pb-10 pt-2 sm:pt-4">
        <section className="relative w-full max-w-[430px]">
          {/* blue/orange edge */}
          <div className="absolute -inset-px rounded-[22px] bg-gradient-to-br from-blue-500 via-blue-500/30 to-orange-500/80 opacity-90" />

          <div className="relative rounded-[21px] border border-white/10 bg-[#020a15]/90 px-6 py-7 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
                Welcome Back
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[0.08em] sm:text-[34px]">
                SIGN IN
              </h1>

              <p className="mx-auto mt-3 max-w-[280px] text-sm leading-6 text-slate-400">
                Sign in to your account and stay connected to your home.
              </p>
            </div>

            <div className="my-6 h-px bg-gradient-to-r from-blue-500/70 via-white/10 to-orange-500/70" />

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="sr-only">Email Address</label>

                <div className="flex items-center border border-white/15 bg-black/30 px-3.5 transition focus-within:border-blue-400/70">
                  <span className="mr-3 text-lg text-blue-400">✉</span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="Email Address"
                    className="w-full bg-transparent px-0 py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="sr-only">Password</label>

                <div className="flex items-center border border-white/15 bg-black/30 px-3.5 transition focus-within:border-blue-400/70">
                  <span className="mr-3 text-lg text-blue-400">▣</span>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="Password"
                    className="w-full bg-transparent px-0 py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 px-5 py-3.5 text-sm font-bold tracking-[0.16em] shadow-lg shadow-blue-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "SIGNING IN..." : "SIGN IN    →"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-medium tracking-[0.2em] text-slate-500">
                OR
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-3 border border-white/10 bg-black/20 px-5 py-3 text-sm text-slate-300 opacity-80"
              title="Google sign-in will be connected later"
            >
              <span className="font-bold text-base">G</span>
              Sign in with Google
            </button>

            <p className="mt-7 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* Security process */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-5 px-5 pb-7 pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300 sm:gap-8">
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
