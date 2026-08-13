"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-red-900/60 bg-slate-900 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
          !
        </div>

        <p className="mt-6 text-sm font-semibold tracking-wider text-red-400">
          MARVEL&apos;S HOME SAFETY
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          We couldn&apos;t load this part of your security system.
          Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Try Again
        </button>
      </section>
    </main>
  );
}
