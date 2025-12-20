
# SKEMA MIGRASI LARAVEL (FULL PRODUCTION)

Salin kode-kode di bawah ini ke file migrasi di proyek Laravel Anda.

### 1. Tabel `activities`
```php
Schema::create('activities', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->date('start_date');
    $table->date('end_date');
    $table->string('host');
    $table->string('location');
    $table->string('status'); // To Do, On Progress, Done
    $table->double('latitude')->nullable();
    $table->double('longitude')->nullable();
    $table->timestamps();
});
```

### 2. Tabel `officers`
```php
Schema::create('officers', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->string('team_id');
    $table->enum('role', ['admin', 'petugas']);
    $table->timestamps();
});
```

### 3. Tabel `patients`
```php
Schema::create('patients', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('mrn')->unique();
    $table->foreignUuid('activity_id')->constrained('activities')->onDelete('cascade');
    $table->string('name');
    $table->string('identity_no')->index();
    $table->enum('gender', ['L', 'P']);
    $table->date('date_of_birth')->nullable();
    $table->integer('age');
    $table->string('phone');
    $table->text('address');
    $table->date('visit_date');
    $table->string('category'); // Berobat, MCU
    
    // Vitals
    $table->string('triage'); // Green, Yellow, Red
    $table->float('height')->nullable();
    $table->float('weight')->nullable();
    $table->string('blood_pressure')->nullable();
    $table->integer('pulse')->nullable();
    $table->integer('respiration')->nullable();
    $table->float('temperature')->nullable();
    $table->float('bmi')->nullable();
    $table->string('bmi_status')->nullable();
    
    // Berobat (SOAP)
    $table->text('subjective')->nullable();
    $table->text('physical_exam')->nullable();
    $table->string('diagnosis_code')->nullable();
    $table->string('diagnosis_name')->nullable();
    $table->text('therapy')->nullable();
    $table->string('referral_status')->nullable();
    
    // MCU (Detailed)
    $table->string('visus_od')->nullable();
    $table->string('visus_os')->nullable();
    $table->string('color_blind')->nullable();
    $table->text('mcu_conclusion')->nullable();
    $table->text('mcu_recommendation')->nullable();
    
    $table->string('last_modified_by')->nullable();
    $table->timestamps();
});
```

### 4. Tabel `news`
```php
Schema::create('news', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->date('date');
    $table->longText('content');
    $table->longText('image_url'); // Disarankan pakai LongText jika simpan Base64
    $table->timestamps();
});
```

### 5. Tabel `carousel_items`
```php
Schema::create('carousel_items', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->longText('image_url');
    $table->string('title');
    $table->string('subtitle');
    $table->timestamps();
});
```

### 6. Tabel `icd10`
```php
Schema::create('icd10', function (Blueprint $table) {
    $table->string('code')->primary();
    $table->string('name');
    $table->timestamps();
});
```

### 7. Tabel `officer_logs`
```php
Schema::create('officer_logs', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('officer_id')->constrained('officers')->onDelete('cascade');
    $table->date('date');
    $table->time('start_time');
    $table->time('end_time');
    $table->text('activity');
    $table->string('location');
    $table->timestamps();
});
```
