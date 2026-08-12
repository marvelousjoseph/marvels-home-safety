"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

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

    /*
     * STEP 1
     * Create the Supabase authentication account.
     */
    const { data, error: signupError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    /*
     * If email confirmation is enabled in Supabase,
     * there will be no session yet.
     */
    if (!data.session || !data.user) {
      setMessage(
        "Account created. Please check your email to confirm your account before signing in."
      );

      setLoading(false);
      return;
    }

    const userId = data.user.id;

    /*
     * STEP 2
     * Create the user's home.
     */
    const { data: home, error: homeError } =
      await supabase
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

    /*
     * STEP 3
     * Connect the user to the home.
     */
    const { error: membershipError } =
      await supabase
        .from("home_members")
        .insert({
          home_id: home.id,
          user_id: userId,
          role: "owner",
        });

    if (membershipError) {
      console.error(
        "Home membership creation error:",
        membershipError
      );

      setError(
        "Your home was created, but we could not connect your account to it."
      );

      setLoading(false);
      return;
    }

    /*
     * STEP 4
     * Everything succeeded.
     */
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <p className="text-sm font-medium text-blue-400">
            MARVEL&apos;S HOME SAFETY
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Set up your home security center.
          </p>

          <form
            onSubmit={handleSignup}
            className="mt-8 space-y-5"
          >

            {/* Email */}
            <div>
              <label className="text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Home name */}
            <div>
              <label className="text-sm text-slate-300">
                Home Name
              </label>

              <input
                type="text"
                value={homeName}
                onChange={(event) =>
                  setHomeName(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="My Home"
              />

              <p className="mt-2 text-xs text-slate-500">
                You can change this later.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="Create a password"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm text-slate-300">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="Confirm your password"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success/message */}
            {message && (
              <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-400">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Setting up your home..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign in
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}
