export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-cyan-400">
          Marvels Home Safety
        </h1>

        <div className="flex gap-6">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6">
        <h2 className="text-5xl font-bold mb-6">
          AI-Powered Home Security
        </h2>

        <p className="text-xl text-slate-300 max-w-2xl mb-10">
          Protect your home with intelligent face recognition,
          visitor monitoring and real-time alerts.
        </p>

        <button className="bg-cyan-500 px-8 py-4 rounded-xl hover:bg-cyan-600 transition">
          Get Started
        </button>
      </section>
    </main>
  );
}