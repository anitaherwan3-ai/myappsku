# Dokumentasi Struktur Database PCC Sumsel

## Ringkasan Relasi (ERD)

1.  **One-to-Many (Activities -> Patients)**
    *   Satu `Activity` (Kegiatan) memiliki banyak `Patients` (Pasien).
    *   Setiap `Patient` wajib terikat pada satu `Activity`.
    *   *Constraint*: Jika Activity dihapus, data Patients terkait akan ikut terhapus (`ON DELETE CASCADE`).

2.  **Many-to-One (Patients -> ICD10)**
    *   Satu `Patient` (Kategori Berobat) memiliki satu `Diagnosis Utama` dari tabel `ICD10`.
    *   Tabel `ICD10` berfungsi sebagai kamus data master.

## Penjelasan Tabel

### 1. `officers`
Menyimpan data otentikasi petugas.
*   **email**: Kunci utama untuk login.
*   **role**: Membedakan hak akses. 'admin' bisa mengelola segalanya, 'petugas' hanya bisa input medis.

### 2. `patients`
Tabel transaksi utama. Sengaja didesain **Denormalisasi** (menggabungkan data umum, klinis, dan MCU dalam satu tabel lebar) untuk memudahkan query pelaporan dan performa baca (read heavy), karena satu pasien biasanya hanya satu record per kunjungan kegiatan.
*   Kolom `category` menentukan kolom mana yang relevan untuk diisi (Berobat vs MCU).

### 3. `activities`
Pengelompokan data pasien. Laporan biasanya dicetak per kegiatan.

### 4. `icd10`
Master data statis untuk standarisasi diagnosa WHO.

---

## Catatan Implementasi Backend

Jika menggunakan Node.js (Express/NestJS) dengan ORM (Prisma/TypeORM/Sequelize):

1.  Gunakan `UUID` (v4) untuk semua Primary Key (`id`) agar aman saat migrasi data atau sinkronisasi antar server.
2.  Password di tabel `officers` **WAJIB** di-hash menggunakan library seperti `bcrypt` sebelum disimpan.
3.  Untuk penyimpanan gambar (`news.image_url`, `carousel.image_url`), disarankan menyimpan file fisik di Object Storage (S3/MinIO) atau folder server, dan hanya menyimpan **URL/Path** di database. (Jangan simpan Base64 berat di database produksi).
