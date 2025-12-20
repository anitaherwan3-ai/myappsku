
# PANDUAN FINAL SETUP BACKEND LARAVEL (UPDATED V2.6)

## 1. Persiapan Awal
Pastikan Anda menggunakan Laravel 11. Jika file `config/cors.php` tidak ada, jalankan perintah berikut:
```bash
php artisan config:publish cors
```

## 2. Pembaruan Migrasi
Ubah file migrasi Anda di `database/migrations/` untuk mendukung fitur koordinat dan rekam medis lengkap:

```php
// Activities Table
Schema::create('activities', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->date('start_date');
    $table->date('end_date');
    $table->string('host');
    $table->string('location');
    $table->double('latitude')->nullable();
    $table->double('longitude')->nullable();
    $table->string('status'); 
    $table->timestamps();
});

// Patients Table
Schema::create('patients', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('mrn');
    $table->foreignUuid('activity_id')->constrained('activities')->onDelete('cascade');
    $table->string('name');
    $table->string('identity_no')->nullable()->index();
    $table->enum('gender', ['L', 'P']);
    $table->date('dob')->nullable();
    $table->integer('age')->default(0);
    $table->string('phone')->nullable();
    $table->text('address')->nullable();
    $table->date('visit_date');
    $table->string('category'); 

    // Medical Details
    $table->string('triage')->default('Green');
    $table->string('blood_type')->nullable();
    $table->text('allergies')->nullable(); 
    $table->double('latitude')->nullable();
    $table->double('longitude')->nullable();

    // Vitals
    $table->float('height')->nullable();
    $table->float('weight')->nullable();
    $table->float('bmi')->nullable();
    $table->string('bmi_status')->nullable();
    $table->string('bp')->nullable();
    $table->integer('pulse')->nullable();
    $table->text('history_illness')->nullable();

    // Berobat & MCU
    $table->text('subjective')->nullable();
    $table->text('physical_exam')->nullable();
    $table->string('diagnosis_code')->nullable();
    $table->string('diagnosis_name')->nullable();
    $table->text('therapy')->nullable();
    $table->string('referral_status')->nullable();
    $table->json('mcu_data')->nullable();
    $table->text('mcu_conclusion')->nullable();
    $table->text('mcu_recommendation')->nullable();

    $table->string('last_modified_by')->nullable();
    $table->timestamps();
});
```

## 3. Konfigurasi CORS (config/cors.php)
Setelah dipublikasikan, pastikan pengaturannya seperti ini agar Frontend React (Vite) bisa mengakses:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'], // Ganti dengan http://localhost:5173 saat production
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

## 4. Jalankan Migrasi
```bash
php artisan migrate:fresh
```

## 5. Menjalankan Server
```bash
php artisan serve
```
Backend akan berjalan di `http://127.0.0.1:8000`.
