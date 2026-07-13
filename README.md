# Automated Expense Tracker: Google Form to Sheets with Discord Alerts

[Read this documentation in English](README-en.md)

Repositori ini berisi sistem otomatisasi pencatatan keuangan berbasis Google Apps Script (GAS). Sistem ini mengelola data dari Google Form, membaginya ke dalam tab bulanan secara dinamis, menghitung saldo, mengarsipkan laporan PDF, dan mengirim notifikasi *real-time* ke Discord.

## 🚀 Fitur Utama

* **Dynamic Form Routing:** Memisahkan data formulir ke tab bulanan otomatis (contoh: `Juli2026`).
* **Automated Accounting Formulas:** Menyuntikkan rumus *array* untuk perhitungan saldo otomatis.
* **Privacy-Aware PDF Archiver:** Mengarsipkan data bulan lalu menjadi PDF setiap tanggal 1 dengan menyembunyikan kolom sensitif.
* **Discord Webhook Alerts:** Notifikasi instan untuk setiap transaksi dan arsip PDF.

---

## 🛠️ Panduan Instalasi

***(Silakan ikuti langkah-langkah di bawah ini secara berurutan)***

### 1. Pembuatan Google Form

Pastikan Google Form Anda memiliki urutan pertanyaan sebagai berikut:

1. **Email address** (Aktifkan fitur pengumpulan email di menu setelan).
2. **Keterangan**
3. **Status** (Opsi: `Masuk` dan `Keluar`)
4. **Bank Account**
5. **Nominal** (Input angka murni tanpa simbol).

### 2. Menghubungkan ke Google Sheets

* Tautkan formulir ke Google Sheets baru.
* Buka **Ekstensi > Apps Script**.
* Buat 3 file baru: `config.gs`, `autoRouteMonthlyForm.gs`, dan `archivePreviousMonthToPDF.gs`.
* Salin kode dari repositori ini ke dalam file-file tersebut.

### 3. Konfigurasi Sistem

Buka `config.gs` dan sesuaikan `WEBHOOK_URL`, preferensi font, serta nama folder target di Google Drive.

### 4. Pengaturan Pemicu (Triggers)

Untuk mengatur otomatisasi, gunakan menu **Triggers** (ikon jam) di editor Apps Script. Panduan detail (tipe pemicu, waktu, dll.) **sudah didokumentasikan di komentar bagian atas setiap file kode (`.js`)**. Silakan cek komentar pada `autoRouteMonthlyForm.js` dan `archivePreviousMonthToPDF.js` untuk panduan lengkapnya.

---

## 💡 Fleksibilitas Penggunaan (Use Case Versatility)

Logika *routing* dan otomatisasi dalam repositori ini **tidak terbatas hanya untuk catatan keuangan**. Anda dapat menggunakan *logic* yang sama untuk keperluan lain dengan memodifikasi variabel `config.js` dan struktur data di `autoRouteMonthlyForm.js`:

* **Log Absensi:** Gunakan untuk mengarahkan data kehadiran staf ke *sheet* bulanan masing-masing.
* **Manajemen Inventaris:** Gunakan untuk memisahkan data stok masuk/keluar barang.
* **Sistem Tiket Support:** Gunakan untuk merutekan tiket dukungan berdasarkan departemen.
* **Data Log Kunjungan:** Gunakan untuk mencatat data pengunjung tamu berdasarkan tanggal.

Selama Anda mengikuti struktur *routing* yang sama, repositori ini dapat menjadi *template* dasar untuk proyek otomatisasi data apa pun yang membutuhkan pemisahan berbasis waktu atau kategori.
