# Standard Operating Procedure (SOP)
**Penggunaan Cetrofarm Internal Backup Portal**

---

## 1. Tujuan
SOP ini disusun sebagai panduan standar bagi karyawan PT Cetro Tama Indonesia (Cetrofarm) dalam menggunakan sistem **Internal Backup Portal**. Sistem ini dirancang untuk mempermudah, mengamankan, dan merapikan pengarsipan dokumen digital perusahaan langsung ke dalam Google Drive terpusat.

## 2. Ruang Lingkup
Panduan ini berlaku untuk seluruh karyawan dari departemen:
* **Keuangan** (Finance)
* **Marketing**
* **Operasional**

## 3. Ketentuan Umum
Sebelum menggunakan portal, harap perhatikan hal-hal berikut:
1. **Batas Ukuran File**: Maksimal **25 MB** per dokumen.
2. **Format File yang Diizinkan**: Dokumen (PDF, DOCX, XLSX, CSV) dan Gambar (JPG, PNG).
3. **Kerahasiaan Token**: Setiap departemen memiliki **Token Akses** khusus (sejenis kata sandi). Token ini tidak boleh dibagikan kepada departemen lain atau pihak luar.

---

## 4. Work Instruction (Instruksi Kerja)

### A. Cara Login ke Portal
1. Buka browser web (Google Chrome / Microsoft Edge / Safari).
2. Kunjungi alamat URL resmi portal (misal: *https://frontend-helmishaws-projects.vercel.app*).
3. Pada halaman Login:
   * Pilih **Departemen** Anda pada menu *dropdown* (Keuangan / Marketing / Operasional).
   * Masukkan **Nama Karyawan** (Gunakan nama lengkap/nama panggilan yang jelas).
   * Masukkan **Token Akses** sesuai dengan departemen Anda.
4. Klik tombol **Masuk**. Jika berhasil, Anda akan dialihkan ke halaman Upload.

> [!WARNING]
> Jika muncul pesan "Token tidak valid", pastikan Anda memilih departemen yang benar dan tidak ada salah ketik (huruf besar/kecil berpengaruh) pada Token Akses.

### B. Cara Mengunggah (Upload) Dokumen
1. Setelah login, pilih menu **Upload Dokumen** di menu sisi kiri (Sidebar).
2. Pilih **Kategori Dokumen** (Kategori akan menyesuaikan secara otomatis dengan departemen Anda, misalnya: Faktur, Brosur, SOP, dll).
3. Masukkan **Nama Dokumen**. 
   * *Tips: Gunakan penamaan yang jelas dan standar, contoh: `Laporan_Keuangan_Q1_2026`*.
4. **Pilih File** yang akan diunggah dengan dua cara:
   * **Klik** pada kotak bergaris putus-putus untuk memilih file dari folder komputer Anda, ATAU
   * **Tarik dan Lepas (Drag & Drop)** file dari folder komputer Anda langsung ke dalam kotak tersebut.
5. Pastikan nama file dan ukurannya sudah muncul di layar (menandakan file berhasil dipilih).
6. Klik tombol **Upload Dokumen**.
7. Tunggu hingga muncul notifikasi hijau berbunyi: **"File berhasil diunggah!"** dan klik link *Lihat di Google Drive* jika ingin memastikan file sudah tersimpan.

> [!CAUTION]
> Jangan menutup halaman browser saat proses *Mengunggah...* sedang berjalan, terutama jika ukuran file cukup besar dan koneksi internet lambat.

### C. Cara Melihat Riwayat & Mengarsipkan Dokumen
1. Pilih menu **Riwayat & Arsip** di menu sisi kiri (Sidebar).
2. Anda akan melihat daftar semua dokumen yang pernah diunggah oleh departemen Anda.
3. Anda dapat mencari dokumen spesifik menggunakan kotak **Cari berdasarkan nama file...**.
4. Di kolom **Aksi**:
   * Klik **Buka** untuk melihat file asli di Google Drive.
   * Klik **Arsipkan** jika dokumen tersebut sudah tidak aktif/usang.
5. Jika di-arsipkan, status file akan berubah menjadi "Diarsipkan" dan file di Google Drive akan secara otomatis dipindahkan ke dalam folder khusus `_Arsip` (File tidak dihapus permanen, hanya dipindahkan agar rapi).

---

## 5. Troubleshooting (Pemecahan Masalah)
* **Error "Ukuran file maksimal 25MB"**: Kompres PDF atau perkecil resolusi gambar Anda sebelum mengunggah.
* **Error "Ekstensi file tidak diizinkan"**: Pastikan file bukan berupa program (`.exe`) atau file arsip (`.zip`/`.rar`). Ubah dokumen menjadi PDF jika memungkinkan.
* **File lama (pending) gagal terkirim**: Cek koneksi internet Anda, *refresh* halaman, lalu ulangi proses upload dokumen.
