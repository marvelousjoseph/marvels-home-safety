import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="relative h-48 w-48">
        <Image
          src="/marvels-home-safety-logo.png"
          alt="Marvels Home Safety"
          fill
          priority
          className="object-contain"
        />
      </div>
    </main>
  );
}
