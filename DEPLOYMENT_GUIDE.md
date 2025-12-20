# PANDUAN DEPLOYMENT KE SHARED HOSTING (cPanel)

Panduan ini menggunakan strategi:
- **Frontend React**: Diakses di domain utama (misal: `pccsumsel.com`)
- **Backend Laravel**: Diakses via sub-path (misal: `pccsumsel.com/api`)

---

## TAHAP 1: Persiapan Database
1. Buka **phpMyAdmin** di komputer lokal (XAMPP/Laragon).
2. Pilih database `pcc_db`.
3. Klik menu **Export** -> Klik tombol **Export** (Format SQL).
4. Buka **cPanel Hosting** -> **MySQL Databases**.
5. Buat Database baru (misal: `user_pccdb`) dan User Database baru.
6. **Add User to Database** dan centang **ALL PRIVILEGES**.
7. Buka **phpMyAdmin** di Hosting, pilih database baru tersebut, lalu **Import** file SQL dari komputer lokal.

---

## TAHAP 2: Upload Backend (Laravel)

### 1. Siapkan File Laravel (DI KOMPUTER LOKAL)
Karena di hosting tidak bisa menjalankan `composer`, kita siapkan semuanya di lokal.

1. Buka terminal di folder `pcc-backend` di komputer Anda.
2. Jalankan perintah ini untuk merapikan dependency agar siap produksi:
   ```bash
   composer install --optimize-autoloader --no-dev
   ```
   *(Perintah ini akan membuat folder `vendor` menjadi bersih dan ringan).*

3. Hapus folder `node_modules` (ini tidak dibutuhkan di backend).
4. **Zip/Compress seluruh isi folder** `pcc-backend` (termasuk folder `vendor` yang baru disiapkan) menjadi `backend.zip`.

### 2. Upload ke Hosting
1. Buka **File Manager** di cPanel.
2. Buat folder baru **di luar** `public_html` (sejajar dengan public_html), beri nama `pcc-core`.
   - Struktur: `/home/user/pcc-core/`
3. Upload `backend.zip` ke dalam folder `pcc-core`.
4. Extract file tersebut. 
   *(Sekarang folder `pcc-core` seharusnya sudah berisi `app`, `bootstrap`, `config`, `vendor`, `.env`, dll).*

### 3. Konfigurasi Public API
1. Masuk ke folder `/home/user/pcc-core/public/`.
2. Pindahkan **SEMUA** isi folder `public` tersebut ke dalam folder `/home/user/public_html/api/`.
   - Buat folder `api` di dalam `public_html` jika belum ada.
3. Edit file `index.php` yang baru saja dipindahkan ke `/public_html/api/index.php`:
   
   Cari baris:
   ```php
   if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
       require $maintenance;
   }
   require __DIR__.'/../vendor/autoload.php';
   $app = require_once __DIR__.'/../bootstrap/app.php';
   ```

   Ubah path-nya (naik 2 level folder untuk mencapai pcc-core) menjadi:
   ```php
   // Sesuaikan path ke folder pcc-core
   if (file_exists($maintenance = __DIR__.'/../../pcc-core/storage/framework/maintenance.php')) {
       require $maintenance;
   }
   require __DIR__.'/../../pcc-core/vendor/autoload.php';
   $app = require_once __DIR__.'/../../pcc-core/bootstrap/app.php';
   ```

### 4. Konfigurasi Environment (.env) & APP_KEY (CRITICAL!)
1. Edit file `/home/user/pcc-core/.env`.
2. **PENTING: Pastikan APP_KEY terisi!**
   - Buka file `.env` di komputer lokal Anda.
   - Copy baris `APP_KEY=base64:....`
   - Paste ke file `.env` di hosting.
   - **Jika APP_KEY kosong, Laravel akan Error 500.**
3. Sesuaikan konfigurasi Database:
   ```ini
   APP_NAME="PCC Sumsel"
   APP_ENV=production
   APP_DEBUG=false  <-- Ubah ke true sementara jika masih error 500
   APP_URL=https://domainanda.com/api

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=user_pccdb      <-- Nama DB di Hosting
   DB_USERNAME=user_dbuser     <-- User DB di Hosting
   DB_PASSWORD=password_anda   <-- Password User DB
   ```

### 5. Permission Folder (Wajib)
Di File Manager cPanel:
1. Klik kanan folder `pcc-core/storage`.
2. Pilih **Change Permissions**.
3. Set menjadi **775** (User: RWE, Group: RWE, World: RX).
4. Lakukan hal yang sama untuk `pcc-core/bootstrap/cache`.

---

## TAHAP 3: Upload Frontend (React)

### 1. Build Production
Di terminal VS Code (folder frontend):
```bash
npm run build
```
Ini akan menghasilkan folder `dist`.

### 2. Upload ke Hosting
1. Buka folder `dist` di komputer Anda.
2. Select All (Semua file & folder di dalam `dist`).
3. Zip menjadi `frontend.zip`.
4. Upload `frontend.zip` ke folder `/home/user/public_html/` di Hosting.
5. Extract file tersebut. (Pastikan file `index.html` berada tepat di dalam `public_html`).

### 3. Konfigurasi Routing (.htaccess)
Agar React Router berjalan lancar saat di-refresh, buat atau edit file `.htaccess` di dalam folder `public_html` dan isi dengan kode ini:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Jangan rewrite jika mengakses folder /api (Backend)
  RewriteRule ^api - [L]

  # Standar React Router Rewrite
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## TAHAP 4: Troubleshooting Error 500

Jika website masih menampilkan Error 500 saat login atau load data:

1. **Gunakan Script Diagnosa:**
   - Upload file `server/server_check.php` dari project lokal ke folder `public_html/api/` di hosting.
   - Buka di browser: `domainanda.com/api/server_check.php`.
   - Script ini akan memberi tahu jika PHP version salah, APP_KEY kosong, atau permission salah.

2. **Cek Log Laravel:**
   - Buka File Manager.
   - Buka file: `pcc-core/storage/logs/laravel.log`.
   - Scroll ke paling bawah untuk melihat detail errornya.

3. **Symlink Storage (Untuk Gambar):**
   - Buat file `link.php` di `public_html/api/` berisi:
     ```php
     <?php
     symlink('/home/user/pcc-core/storage/app/public', '/home/user/public_html/api/storage');
     echo "Link Created";
     ?>
     ```
   - Akses file tersebut sekali saja via browser.
