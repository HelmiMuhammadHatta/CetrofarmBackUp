"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [session, setSession] = useState<any>(null);
  const [kategoriOptions, setKategoriOptions] = useState<string[]>([]);
  
  const [kategori, setKategori] = useState("");
  const [namaDokumen, setNamaDokumen] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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

  const processSelectedFile = (selectedFile: File) => {
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
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
    <div className="max-w-2xl mx-auto bg-cream rounded-lg shadow-sm border border-sage p-6">
      <h2 className="text-2xl font-bold text-forest-dark mb-6">Upload Dokumen</h2>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-md border ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-sage-light/30 border-sage text-forest'}`}>
          <p>{message.text}</p>
          {message.link && (
            <a href={message.link} target="_blank" rel="noopener noreferrer" className="text-clay underline font-medium mt-1 inline-block">
              Lihat di Google Drive
            </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Kategori Dokumen</label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full px-3 py-2 border border-sage rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-forest"
            required
          >
            {kategoriOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Nama Dokumen</label>
          <input
            type="text"
            value={namaDokumen}
            onChange={(e) => setNamaDokumen(e.target.value)}
            placeholder="Contoh: Laporan Keuangan Q1"
            className="w-full px-3 py-2 border border-sage rounded-md focus:outline-none focus:ring-2 focus:ring-forest bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Pilih File</label>
          <label 
            htmlFor="file-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${
              isDragging ? "border-forest bg-sage-light/30" : "border-sage hover:border-forest bg-cream-dark/20"
            }`}
          >
            <div className="space-y-1 text-center pointer-events-none">
              <svg className="mx-auto h-12 w-12 text-sage-light" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-ink/80 justify-center">
                <span className="relative bg-transparent rounded-md font-medium text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-forest pointer-events-auto">
                  <span>Pilih file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} ref={fileInputRef} required={!file} />
                </span>
                <p className="pl-1">atau klik/drag di sini</p>
              </div>
              <p className="text-xs text-ink/60">PDF, DOCX, XLSX, CSV, JPG, PNG up to 25MB</p>
            </div>
          </label>
          {file && (
            <div className="mt-2 text-sm text-ink/80">
              File terpilih: <span className="font-medium text-ink">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-forest text-cream py-3 px-4 rounded-md hover:bg-forest-dark transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest disabled:bg-sage-light disabled:opacity-100 flex justify-center items-center"
        >
          {loading ? "Mengunggah..." : "Upload Dokumen"}
        </button>
      </form>
    </div>
  );
}
