
# PANDUAN FINAL SETUP BACKEND LARAVEL (UPDATED V2.5)

## Pembaruan Migrasi (PENTING!)
Ubah file migrasi Anda di `database/migrations/` (terutama tabel `patients` dan `activities`) untuk mendukung fitur baru:

```php
// 2. Activities (Ditambah Lat Lng)
Schema::create('activities', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->date('start_date');
    $table->date('end_date');
    $table->string('host');
    $table->string('location');
    $table->double('latitude')->nullable(); // UNTUK PETA
    $table->double('longitude')->nullable(); // UNTUK PETA
    $table->string('status'); 
    $table->timestamps();
});

// 7. Patients (Ditambah Field Medis Baru)
Schema::create('patients', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('mrn');
    $table->foreignUuid('activity_id')->constrained('activities')->onDelete('cascade');
    $table->string('name');
    $table->string('identity_no')->nullable()->index(); // Index untuk pencarian cepat
    $table->enum('gender', ['L', 'P']);
    $table->date('dob')->nullable();
    $table->integer('age')->default(0);
    $table->string('phone')->nullable();
    $table->text('address')->nullable();
    $table->date('visit_date');
    $table->string('category'); 

    // Field Baru V2.5
    $table->string('triage')->default('Green'); // Red, Yellow, Green
    $table->string('blood_type')->nullable(); // A, B, AB, O
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

    // Berobat
    $table->text('subjective')->nullable();
    $table->text('physical_exam')->nullable();
    $table->string('diagnosis_code')->nullable();
    $table->string('diagnosis_name')->nullable();
    $table->text('therapy')->nullable();
    $table->string('referral_status')->nullable();
    $table->text('referral_notes')->nullable();

    // MCU
    $table->json('mcu_data')->nullable();
    $table->text('mcu_conclusion')->nullable();
    $table->text('mcu_recommendation')->nullable();

    $table->string('last_modified_by')->nullable();
    $table->timestamps();
});
```

## Pembaruan ApiController.php
Pastikan mapping di `formatPatientIn` dan `formatPatientOut` menyertakan field baru:

```php
// In formatPatientIn:
'triage' => $req->triage,
'blood_type' => $req->bloodType,
'allergies' => $req->allergies,
'latitude' => $req->latitude,
'longitude' => $req->longitude,

// In formatPatientOut:
'triage' => $p->triage,
'bloodType' => $p->blood_type,
'allergies' => $p->allergies,
'latitude' => $p->latitude,
'longitude' => $p->longitude,
```

## Jalankan Ulang Migrasi
```bash
php artisan migrate:fresh
```
*Peringatan: Perintah ini akan menghapus data lama. Pastikan sudah backup jika ada data penting.*
