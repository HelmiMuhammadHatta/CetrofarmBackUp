"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RiwayatPage() {
  const [session, setSession] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [capacity, setCapacity] = useState({ totalSizeKb: 0, totalSizeMb: "0" });

  useEffect(() => {
    const stored = sessionStorage.getItem("cetro_session");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSession(parsed);
      fetchRiwayat(parsed.departemen, parsed.token);
    }
  }, []);

  const fetchRiwayat = async (departemen: string, token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!apiUrl) throw new Error("API URL not set");

      const res = await fetch(`${apiUrl}?departemen=${departemen}&token=${token}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal mengambil riwayat");
      }

      setRiwayat(data.data || []);
      if (data.capacity) {
        setCapacity(data.capacity);
      }
    } catch (err: any) {
      setError(err.message || "Koneksi bermasalah");
    } finally {
      setLoading(false);
    }
  };

  const handleArsipkan = async (fileId: string) => {
    if (!confirm("Arsipkan dokumen ini? File akan dipindahkan ke folder _Arsip.")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!apiUrl) throw new Error("API URL not set");
      
      const payload = {
        action: "soft_delete",
        token: session.token,
        departemen: session.departemen,
        fileId: fileId
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || "Gagal");
      
      alert("File berhasil diarsipkan");
      fetchRiwayat(session.departemen, session.token);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const filteredData = riwayat.filter(item => 
    item["Nama File"]?.toLowerCase().includes(search.toLowerCase())
  );

  if (!session) return null;

  return (
    <div className="bg-cream rounded-lg shadow-sm border border-sage/50">
      <div className="p-6 border-b border-sage/30 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-forest-dark">Riwayat & Arsip</h2>
          <p className="text-sm text-ink/60 mt-1">Daftar dokumen yang diunggah departemen {session.departemen}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-ink">Total Penggunaan Storage</p>
          <p className="text-2xl font-bold text-forest">{capacity.totalSizeMb} MB</p>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari berdasarkan nama file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-sage bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-forest text-ink"
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-sage-light/20 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-ink/50 bg-cream-dark/20 rounded-lg border border-sage/50 border-dashed">
            Tidak ada riwayat dokumen ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sage/30">
              <thead className="bg-cream-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ink/80 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ink/80 uppercase tracking-wider">Karyawan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ink/80 uppercase tracking-wider">Nama File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ink/80 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-ink/80 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-cream divide-y divide-sage/30">
                {filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream-dark/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">{item["Timestamp"]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink/70">{item["Nama Karyawan"]}</td>
                    <td className="px-6 py-4 text-sm text-ink break-all">{item["Nama File"]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item["Status"] === 'Berhasil' ? 'bg-sage text-forest-dark' :
                        item["Status"] === 'Diarsipkan' ? 'bg-cream-dark text-ink' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item["Status"]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {item["Link Drive"] && (
                        <a href={item["Link Drive"]} target="_blank" rel="noopener noreferrer" className="text-clay hover:text-clay-light underline">
                          Buka
                        </a>
                      )}
                      {item["Status"] === "Berhasil" && item["File ID"] && (
                        <button onClick={() => handleArsipkan(item["File ID"])} className="text-red-600 hover:text-red-900">
                          Arsipkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
