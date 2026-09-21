"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [departemen, setDepartemen] = useState("Keuangan");
  const [nama, setNama] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!apiUrl) {
        throw new Error("API URL is not configured. Silakan cek .env");
      }

      // We test the token by fetching history with a dummy request
      // If it fails with "Token tidak valid", we reject login.
      const res = await fetch(`${apiUrl}?departemen=${departemen}&token=${token}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Token tidak valid");
      }

      // Success
      sessionStorage.setItem("cetro_session", JSON.stringify({ departemen, nama, token }));
      router.push("/upload");
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-cream rounded-lg shadow-md p-8 border border-sage/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-forest-dark">Cetrofarm</h1>
          <p className="text-forest mt-2">Internal Backup Portal</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Departemen</label>
            <select
              value={departemen}
              onChange={(e) => setDepartemen(e.target.value)}
              className="w-full px-3 py-2 border border-sage rounded-md focus:outline-none focus:ring-2 focus:ring-forest bg-white"
              required
            >
              <option value="Keuangan">Keuangan</option>
              <option value="Marketing">Marketing</option>
              <option value="Operasional">Operasional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Karyawan</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full px-3 py-2 border border-sage rounded-md focus:outline-none focus:ring-2 focus:ring-forest bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Token Akses</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Masukkan token departemen"
              className="w-full px-3 py-2 border border-sage rounded-md focus:outline-none focus:ring-2 focus:ring-forest bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-2 px-4 rounded-md hover:bg-forest-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest disabled:bg-sage-light disabled:opacity-100 mt-4"
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
