"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function prepareRecovery() {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setError(
            "This password recovery link is invalid or has expired."
          );
          return;
        }

        setReady(true);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
      }
    }

    prepareRecovery();
  }, []);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#010814] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/marvels-auth-login-scene.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-[#010814]/55" />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-5 py-10">
        <Link href="/" aria-label="Marvels Home Safety">
          <div className="relative h-[150px] w-[380px]">
            <Image
              src="/marvels-auth-logo.png"
              alt="Marvels Home Safety"
              fill
              priority
              sizes="380px"
              className="object-contain"
            />
          </div>
        </Link>

        <section className="relative mt-4 w-full max-w-[430px]">
          <div className="absolute -inset-px rounded-[22px] bg-gradient-to-br from-blue-500 via-blue-500/30 to-orange-500/80" />

          <div className="relative rounded-[21px] border border-white/10 bg-[#020a15]/95 px-6 py-8 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:px-7">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
                Account Recovery
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[0.06em]">
                RESET PASSWORD
              </h1>

              <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-slate-400">
                Create a new password for your Marvels Home Safety account.
              </p>
            </div>

            <div className="my-6 h-px bg-gradient-to-r from-blue-500/70 via-white/10 to-orange-500/70" />

            {!ready ? (
              <div className="border border-white/10 bg-black/20 px-4 py-4 text-center text-sm text-slate-400">
                {error
                  ? error
                  : "Preparing secure password recovery..."}
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  placeholder="New Password"
                  className="w-full border border-white/15 bg-black/30 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/70"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                  minLength={6}
                  placeholder="Confirm New Password"
                  className="w-full border border-white/15 bg-black/30 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/70"
                />

                {error && (
                  <div className="border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="border border-green-500/30 bg-green-500/10 px-3 py-3 text-sm text-green-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 px-5 py-3.5 text-sm font-bold tracking-[0.16em] shadow-lg shadow-blue-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "UPDATING..."
                    : "UPDATE PASSWORD    →"}
                </button>
              </form>
            )}

            <p className="mt-7 text-center text-sm text-slate-400">
              Remember your password?{" "}
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
    </main>
  );
}