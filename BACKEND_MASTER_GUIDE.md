
# PANDUAN MASTER BACKEND LARAVEL (SATU HALAMAN)

Ikuti langkah-langkah ini secara berurutan. Jangan ada yang dilewati.

---

### Langkah 1: Persiapan Folder
Buka Terminal / CMD, jalankan ini untuk membuat project baru:
```bash
composer create-project laravel/laravel pcc-backend
cd pcc-backend
php artisan install:api
php artisan config:publish cors
```

---

### Langkah 2: Database (XAMPP)
1. Buka **phpMyAdmin**.
2. Buat database baru: `pcc_sumsel_db`.
3. Buka file `.env` di folder Laravel, cari baris ini dan ubah:
   ```env
   DB_DATABASE=pcc_sumsel_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

---

### Langkah 3: Membuat Tabel (Migrations)
Jalankan: `php artisan make:migration create_pcc_tables`
Buka file di `database/migrations/xxxx_create_pcc_tables.php`, ganti fungsinya:

```php
public function up() {
    // Tabel Kegiatan
    Schema::create('activities', function ($table) {
        $table->uuid('id')->primary();
        $table->string('name');
        $table->date('start_date');
        $table->string('location');
        $table->string('status'); 
        $table->timestamps();
    });

    // Tabel Pasien
    Schema::create('patients', function ($table) {
        $table->uuid('id')->primary();
        $table->string('mrn');
        $table->foreignUuid('activity_id')->constrained('activities');
        $table->string('name');
        $table->string('triage');
        $table->timestamps();
    });
}
```
Lalu jalankan: `php artisan migrate`

---

### Langkah 4: Pengaturan Model (UUID)
Kita harus memberitahu Laravel bahwa ID kita bukan angka (1,2,3) tapi kode unik (UUID).
Buka `app/Models/Patient.php` (lakukan hal yang sama untuk `Activity.php`):

```php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Patient extends Model {
    protected $guarded = []; // Buka proteksi input
    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot() {
        parent::boot();
        static::creating(fn($m) => $m->id = (string) Str::uuid());
    }
}
```

---

### Langkah 5: Membuat Jalur Akses (API Routes)
Buka file `routes/api.php`:

```php
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ActivityController;

Route::apiResource('patients', PatientController::class);
Route::apiResource('activities', ActivityController::class);
```

---

### Langkah 6: Logika Simpan Data (Controller)
Jalankan: `php artisan make:controller Api/PatientController --api`
Buka `app/Http/Controllers/Api/PatientController.php`:

```php
public function store(Request $request) {
    // Laravel menerima data dari React (Axios)
    $pasien = \App\Models\Patient::create($request->all());
    return response()->json($pasien, 201);
}

public function index() {
    return \App\Models\Patient::all();
}
```

---

### Langkah 7: Pengaturan Keamanan (CORS)
Buka `config/cors.php`, cari `allowed_origins` dan pastikan isinya:
```php
'allowed_origins' => ['*'],
```

---

### Langkah 8: Selesai & Jalankan!
Jalankan perintah ini di terminal Laravel:
```bash
php artisan serve
```
Backend Anda sekarang aktif di `http://127.0.0.1:8000`. 
Sekarang buka aplikasi React Anda, dan data akan mulai tersimpan ke database XAMPP.
