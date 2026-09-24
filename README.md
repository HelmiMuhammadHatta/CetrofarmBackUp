# Cetrofarm Backup Portal

Portal internal PT Cetro Tama Indonesia (Cetrofarm) untuk unggah dan backup dokumen ke Google Drive.

## Arsitektur
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS (Static Export).
- **Backend**: Google Apps Script (Web App) terhubung ke Google Drive dan Google Sheets.

## Persiapan Backend (Google Apps Script)

1. Buka [script.google.com](https://script.google.com/) dan buat project baru.
2. Salin seluruh isi file `backend/Code.gs` ke editor, simpan.
3. Jalankan fungsi `setup()` dari editor (pilih nama fungsi `setup` di dropdown atas, klik "Jalankan").
4. Cek **Project Settings** (ikon roda gigi) > **Script Properties**.
5. Anda akan melihat `ROOT_FOLDER_ID`, `SPREADSHEET_ID`, serta token dummy untuk `TOKEN_KEUANGAN`, `TOKEN_MARKETING`, dan `TOKEN_OPERASIONAL`.
6. **(Opsional tapi penting)** Ubah nilai token dummy tersebut menjadi token yang aman (misalnya string acak), dan berikan token tersebut HANYA ke Kepala Departemen masing-masing.

## Deployment Backend (Web App)

1. Di Apps Script, klik tombol **Terapkan (Deploy)** > **Deployment Baru (New deployment)**.
2. Pilih jenis **Aplikasi Web (Web app)**.
3. Konfigurasi:
   - **Jalankan sebagai (Execute as)**: Saya (Me).
   - **Siapa yang memiliki akses (Who has access)**: Siapa saja (Anyone / Anyone, even anonymous).
4. Klik **Terapkan (Deploy)**.
5. Salin URL Web App yang dihasilkan (berawalan `https://script.google.com/macros/s/...`).

## Persiapan Frontend

1. Buka folder `frontend`.
2. Buat file `.env` (atau salin dari `.env.example` jika ada) dan isikan:
   ```env
   NEXT_PUBLIC_APPS_SCRIPT_URL=URL_WEB_APP_ANDA_DI_SINI
   ```
3. Buka terminal di folder `frontend` dan jalankan:
   ```bash
   npm install
   npm run build
   ```
4. Setelah proses build selesai, folder `out/` akan otomatis terbuat. 
5. Folder `out/` ini berisi file statis HTML/CSS/JS yang siap di-hosting.

## Hosting ke Rumahweb (cPanel)

1. Buka cPanel Rumahweb Anda.
2. Masuk ke **File Manager** > folder `public_html` (atau folder subdomain Anda).
3. Hapus index bawaan cPanel jika ada.
4. Upload semua ISI dari folder `out/` Next.js (bukan folder `out`-nya, tapi isinya seperti `index.html`, folder `_next`, dll) ke dalam `public_html`.
5. Web app Cetro Backup Portal sudah siap diakses!

## Keamanan & Rotasi Token

Karena frontend di-host statis (tidak ada backend server-side Node.js), token keamanan tidak di-hardcode melainkan dimasukkan oleh user saat Login dan divalidasi langsung ke Google Apps Script. 
Sebagai admin IT Cetrofarm, Anda disarankan untuk merotasi (mengubah) token di Script Properties setiap 1-3 bulan untuk menjaga keamanan dari kebocoran token.

## Standard Operating Procedure (SOP)

Untuk panduan penggunaan portal oleh karyawan (termasuk cara login, upload, dan arsip dokumen), silakan lihat file [SOP Cetrofarm Backup Portal](./SOP_Cetrofarm_Backup_Portal.md).
