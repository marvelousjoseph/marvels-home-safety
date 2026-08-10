import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

async function getDevices() {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading devices:", error);
    return [];
  }

  return data ?? [];
}

export default async function DevicesPage() {
  const devices = await getDevices();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium text-blue-400">
          MARVEL&apos;S HOME SAFETY
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Devices
        </h1>

        <p className="mt-2 text-slate-400">
          Monitor the devices protecting your home.
        </p>

        {devices.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-semibold">
              No devices found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              No devices are currently available in your Supabase database.
            </p>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {devices.map((device) => (
              <div
                key={device.id ?? device.name}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {device.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {device.type}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      device.status?.toLowerCase() === "online"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {device.status}
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-800 pt-4">
                  <p className="text-xs text-slate-500">
                    LOCATION
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {device.location}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
