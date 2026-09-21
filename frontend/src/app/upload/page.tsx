"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [session, setSession] = useState<any>(null);
  const [kategoriOptions, setKategoriOptions] = useState<string[]>([]);
  
  const [kategori, setKategori] = useState("");
  const [namaDokumen, setNamaDokumen] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "", link: "" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("cetro_session");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSession(parsed);
      
      if (parsed.departemen === "Keuangan") {
        setKategoriOptions(["Faktur", "Kwitansi", "Laporan Bulanan", "Pajak", "Lainnya"]);
        setKategori("Faktur");
      } else if (parsed.departemen === "Marketing") {
        setKategoriOptions(["Brosur", "Proposal", "Laporan Campaign", "Materi Sosmed", "Lainnya"]);
        setKategori("Brosur");
      } else if (parsed.departemen === "Operasional") {
        setKategoriOptions(["SOP", "Jadwal", "Laporan Gudang", "Absensi", "Lainnya"]);
        setKategori("SOP");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validation
      const sizeMb = selectedFile.size / (1024 * 1024);
      if (sizeMb > 25) {
        setMessage({ type: "error", text: "Ukuran file maksimal 25MB", link: "" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      const allowedExts = ['pdf', 'docx', 'xlsx', 'csv', 'jpg', 'png'];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExts.includes(ext)) {
        setMessage({ type: "error", text: "Ekstensi file tidak diizinkan", link: "" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setFile(selectedFile);
      setMessage({ type: "", text: "", link: "" });
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !session) return;
    
    setLoading(true);
    setMessage({ type: "", text: "", link: "" });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!apiUrl) throw new Error("API URL not set in .env");

      const base64 = await getBase64(file);
      
      const payload = {
        action: "upload",
        token: session.token,
        departemen: session.departemen,
        namaKaryawan: session.nama,
        kategori,
        namaDokumen,
        fileName: file.name,
        mimeType: file.type,
        fileBase64: base64,
        sizeDisplay: (file.size / 1024).toFixed(2) + " KB",
        sizeKb: (file.size / 1024).toFixed(2)
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Gagal mengunggah file");
      }

      setMessage({ type: "success", text: "File berhasil diunggah!", link: data.fileUrl });
      
      // Reset form
      setFile(null);
      setNamaDokumen("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Terjadi kesalahan koneksi", link: "" });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Dokumen</h2>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-md border ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <p>{message.text}</p>
          {message.link && (
            <a href={message.link} target="_blank" rel="noopener noreferrer" className="text-sm underline font-medium mt-1 inline-block">
              Lihat di Google Drive
            </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Dokumen</label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F3864]"
            required
          >
            {kategoriOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Dokumen</label>
          <input
            type="text"
            value={namaDokumen}
            onChange={(e) => setNamaDokumen(e.target.value)}
            placeholder="Contoh: Laporan Keuangan Q1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3864]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#1F3864] transition-colors bg-gray-50">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#1F3864] hover:text-[#152748] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1F3864]">
                  <span>Pilih file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} ref={fileInputRef} required />
                </label>
                <p className="pl-1">atau klik di sini</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOCX, XLSX, CSV, JPG, PNG up to 25MB</p>
            </div>
          </div>
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              File terpilih: <span className="font-medium text-gray-900">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-[#1F3864] text-white py-3 px-4 rounded-md hover:bg-[#152748] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F3864] disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? "Mengunggah..." : "Upload Dokumen"}
        </button>
      </form>
    </div>
  );
}
