"use client";

import { FormEvent, useState } from "react";
import { addCamera } from "./camera-actions";

export default function CameraForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("554");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [protocol, setProtocol] = useState("rtsp");
  const [streamPath, setStreamPath] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addCamera({
        name,
        location,
        ipAddress,
        port: Number(port),
        username,
        password,
        protocol,
        streamPath,
      });

      setSuccess("Camera added successfully.");

      setName("");
      setLocation("");
      setIpAddress("");
      setPort("554");
      setUsername("");
      setPassword("");
      setProtocol("rtsp");
      setStreamPath("");
    } catch (err) {
      console.error("Add camera error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not add camera."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <p className="text-sm font-semibold tracking-wider text-blue-400">
          CCTV SETUP
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Add Security Camera
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Connect a network security camera to Marvels Home Safety.
          Enter the connection details provided by your camera
          manufacturer.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        {/* Camera name */}
        <div>
          <label
            htmlFor="camera-name"
            className="text-sm font-medium text-slate-300"
          >
            Camera Name
          </label>

          <input
            id="camera-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Front Door Camera"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="camera-location"
            className="text-sm font-medium text-slate-300"
          >
            Location
          </label>

          <input
            id="camera-location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
            placeholder="Front Door"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Protocol */}
        <div>
          <label
            htmlFor="camera-protocol"
            className="text-sm font-medium text-slate-300"
          >
            Camera Protocol
          </label>

          <select
            id="camera-protocol"
            value={protocol}
            onChange={(event) => setProtocol(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          >
            <option value="rtsp">RTSP</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
          </select>

          <p className="mt-2 text-xs text-slate-500">
            RTSP is commonly used for IP security cameras.
          </p>
        </div>

        {/* IP + Port */}
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
          <div>
            <label
              htmlFor="camera-ip"
              className="text-sm font-medium text-slate-300"
            >
              Camera IP Address
            </label>

            <input
              id="camera-ip"
              type="text"
              value={ipAddress}
              onChange={(event) => setIpAddress(event.target.value)}
              required
              placeholder="192.168.1.50"
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-white outline-none transition focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Example: 192.168.1.50
            </p>
          </div>

          <div>
            <label
              htmlFor="camera-port"
              className="text-sm font-medium text-slate-300"
            >
              Port
            </label>

            <input
              id="camera-port"
              type="number"
              value={port}
              onChange={(event) => setPort(event.target.value)}
              required
              min="1"
              max="65535"
              placeholder="554"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-white outline-none transition focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              RTSP commonly uses 554.
            </p>
          </div>
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="camera-username"
            className="text-sm font-medium text-slate-300"
          >
            Camera Username
            <span className="ml-2 text-xs font-normal text-slate-500">
              Optional
            </span>
          </label>

          <input
            id="camera-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="camera-password"
            className="text-sm font-medium text-slate-300"
          >
            Camera Password
            <span className="ml-2 text-xs font-normal text-slate-500">
              Optional
            </span>
          </label>

          <input
            id="camera-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Camera password"
            autoComplete="new-password"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Stream path */}
        <div>
          <label
            htmlFor="camera-stream-path"
            className="text-sm font-medium text-slate-300"
          >
            Stream Path
            <span className="ml-2 text-xs font-normal text-slate-500">
              Optional
            </span>
          </label>

          <input
            id="camera-stream-path"
            type="text"
            value={streamPath}
            onChange={(event) => setStreamPath(event.target.value)}
            placeholder="/stream1"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-white outline-none transition focus:border-blue-500"
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Some cameras require a specific stream path. Check the
            camera manufacturer&apos;s documentation if you are unsure.
          </p>
        </div>

        {/* Information */}
        <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-4">
          <div className="flex gap-3">
            <span className="text-xl">📹</span>

            <div>
              <p className="font-medium text-blue-300">
                Camera connection
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-400">
                Adding the camera saves its connection details.
                Marvels Home Safety will then use those details
                when camera connectivity and recording services
                are implemented.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Adding Camera..." : "Add Camera"}
        </button>
      </form>
    </section>
  );
}
