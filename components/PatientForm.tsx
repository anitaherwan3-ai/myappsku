import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { Patient, PatientCategory } from '../types';
import { 
  Calculator, User, Calendar, MapPin, Activity, Stethoscope, 
  Thermometer, HeartPulse, Scale, Ruler, Pill, FileText, 
  Eye, Ear, Smile, AlertCircle, FileBarChart, Zap, UserCheck, 
  Search, Brain, Shield, Save, X
} from 'lucide-react';

interface Props {
  initialData?: Patient;
  onSave: () => void;
  onCancel: () => void;
  isStandalone?: boolean;
}

const PatientForm: React.FC<Props> = ({ initialData, onSave, onCancel, isStandalone = false }) => {
  const { activities, user, addPatient, updatePatient, icd10List, patients } = useApp();
  
  // Search State for Diagnosis
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableActivities = activities.filter(a => {
    if (user?.role === 'admin') return true;
    return a.status === 'On Progress';
  });

  // Generate Unique MRN
  const generateMRN = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RM-${yyyy}${mm}${dd}-${random}`;
  };

  const [formData, setFormData] = useState<Partial<Patient>>(initialData || {
    category: 'Berobat',
    visitDate: new Date().toISOString().split('T')[0],
    height: 0,
    weight: 0,
    mcuRecommendation: '',
    mcuConclusion: '',
    gender: 'L',
    mrn: generateMRN(),
    age: 0,
  });

  // Initialize search text if editing
  useEffect(() => {
    if (initialData?.diagnosisCode) {
        setDiagnosisSearch(`${initialData.diagnosisCode} - ${initialData.diagnosisName}`);
    }
  }, [initialData]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDiagnosisSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  // Check for existing patient logic
  useEffect(() => {
     if (!initialData && formData.name && formData.identityNo) {
         const existing = patients.find(p => 
             p.identityNo === formData.identityNo || 
             (p.name.toLowerCase() === formData.name?.toLowerCase())
         );
         
         if (existing) {
             setFormData(prev => ({ 
               ...prev, 
               mrn: existing.mrn,
               dateOfBirth: existing.dateOfBirth,
               age: existing.age 
             }));
         }
     }
  }, [formData.name, formData.identityNo, patients, initialData]);

  // BMI Calculation
  useEffect(() => {
    if (formData.height && formData.weight && formData.height > 0) {
      const hM = formData.height / 100;
      const bmiVal = parseFloat((formData.weight / (hM * hM)).toFixed(2));
      
      let status = '';
      if (bmiVal < 18.5) status = 'Underweight';
      else if (bmiVal < 24.9) status = 'Normal';
      else if (bmiVal < 29.9) status = 'Overweight';
      else status = 'Obese';

      setFormData(prev => ({ ...prev, bmi: bmiVal, bmiStatus: status }));
    }
  }, [formData.height, formData.weight]);

  // Auto Calculate Age from DOB
  useEffect(() => {
    if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        const calculatedAge = Math.abs(age_dt.getUTCFullYear() - 1970);
        setFormData(prev => ({ ...prev, age: calculatedAge }));
        if(calculatedAge < 0) {
            setErrors(prev => ({...prev, dateOfBirth: 'Tanggal lahir tidak valid'}));
        } else {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.dateOfBirth;
                return newErrors;
            });
        }
    }
  }, [formData.dateOfBirth]);

  const validateField = (name: keyof Patient, value: any) => {
    let errorMsg = '';
    switch (name) {
        case 'name':
            if (!value) errorMsg = 'Nama wajib diisi';
            else if (value.length < 3) errorMsg = 'Nama terlalu pendek';
            break;
        case 'identityNo':
            if (!value) errorMsg = 'No. Identitas wajib diisi';
            break;
        case 'phone':
            // Allow digits and dashes
            if (value && !/^[\d-]+$/.test(value)) errorMsg = 'Format nomor telepon tidak valid';
            break;
        case 'activityId':
            if (!value) errorMsg = 'Kegiatan wajib dipilih';
            break;
        case 'height':
        case 'weight':
        case 'age':
            if (value < 0) errorMsg = 'Nilai tidak boleh negatif';
            break;
    }

    setErrors(prev => {
        const newErrs = { ...prev };
        if (errorMsg) newErrs[name as string] = errorMsg;
        else delete newErrs[name as string];
        return newErrs;
    });
  };

  const handleChange = (field: keyof Patient, value: any) => {
    let newValue = value;

    // Phone Formatting Logic
    if (field === 'phone') {
        // Remove non-digits
        const cleaned = value.replace(/\D/g, '');
        // Apply formatting 0812-3456-7890
        const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,10})$/);
        if (match) {
           newValue = [match[1], match[2], match[3]].filter(x => x).join('-');
        }
    }

    setFormData(prev => ({ ...prev, [field]: newValue }));
    validateField(field, newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activityId) {
      alert("Harus memilih kegiatan!");
      return;
    }
    
    // Final Validation
    if (Object.keys(errors).length > 0) {
        alert("Mohon perbaiki kesalahan pada formulir sebelum menyimpan.");
        return;
    }

    const patientData = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      mrn: formData.mrn || generateMRN(),
      lastModifiedBy: user ? user.name : 'System',
      lastModifiedAt: new Date().toLocaleString('id-ID'),
    } as Patient;

    if (initialData) {
      updatePatient(patientData);
    } else {
      addPatient(patientData);
      if(isStandalone) {
          alert(`Data Pasien ${patientData.name} berhasil disimpan! MRN: ${patientData.mrn}`);
          setFormData({
            category: 'Berobat',
            visitDate: new Date().toISOString().split('T')[0],
            height: 0,
            weight: 0,
            mcuRecommendation: '',
            mcuConclusion: '',
            gender: 'L',
            mrn: generateMRN(),
            age: 0,
            dateOfBirth: '',
            diagnosisCode: '',
            diagnosisName: '',
          });
          setDiagnosisSearch('');
          setErrors({});
          return;
      }
    }
    onSave();
  };

  // Filter ICD10 based on search
  const filteredDiagnoses = icd10List.filter(icd => 
    icd.code.toLowerCase().includes(diagnosisSearch.toLowerCase()) || 
    icd.name.toLowerCase().includes(diagnosisSearch.toLowerCase())
  ).slice(0, 10); // Limit to 10 suggestions

  const selectDiagnosis = (code: string, name: string) => {
    setFormData(prev => ({ ...prev, diagnosisCode: code, diagnosisName: name }));
    setDiagnosisSearch(`${code} - ${name}`);
    setShowDiagnosisSuggestions(false);
  };

  const sectionClass = "bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden";
  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";
  const inputClass = (hasError: boolean) => `w-full border ${hasError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} p-2.5 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm placeholder-gray-400`;
  const headerClass = "font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3 text-lg";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl overflow-hidden max-w-6xl mx-auto border border-gray-200 font-sans mb-10">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white flex justify-between items-center shadow-md">
         <h2 className="text-2xl font-bold flex items-center gap-3">
           <User className="bg-white/20 p-1.5 rounded-full w-10 h-10" />
           {initialData ? 'Edit Data Pasien' : 'Pendaftaran Pasien Baru'}
         </h2>
         <div className="text-right text-sm opacity-90 font-mono bg-white/10 px-3 py-1 rounded border border-white/20 shadow-inner">
            {formData.mrn}
         </div>
      </div>

      <div className="p-8 space-y-8 bg-slate-50">
        
        {/* Section 1: Identitas & Kegiatan */}
        <div className={sectionClass}>
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <h3 className={headerClass}>
                <User className="text-primary" /> Identitas & Kegiatan
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div>
                        <label className={labelClass}><Activity size={14} className="inline mr-1"/> Kegiatan *</label>
                        <select 
                            required
                            className={inputClass(!!errors.activityId)}
                            value={formData.activityId || ''}
                            onChange={e => handleChange('activityId', e.target.value)}
                        >
                            <option value="">-- Pilih Kegiatan --</option>
                            {availableActivities.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
                            ))}
                        </select>
                        {errors.activityId && <p className="text-red-500 text-xs mt-1">{errors.activityId}</p>}
                    </div>

                    <div>
                        <label className={labelClass}><Calendar size={14} className="inline mr-1"/> Tanggal Berobat</label>
                        <div className="relative">
                            <input 
                                type="date"
                                required
                                className={`${inputClass(!!errors.visitDate)} appearance-none`}
                                value={formData.visitDate}
                                onChange={e => handleChange('visitDate', e.target.value)}
                                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}><AlertCircle size={14} className="inline mr-1"/> Kategori</label>
                        <div className="flex bg-gray-200 p-1.5 rounded-lg shadow-inner">
                            <button type="button" onClick={() => handleChange('category', 'Berobat')} className={`flex-1 py-2.5 rounded-md text-sm font-bold transition duration-200 ${formData.category === 'Berobat' ? 'bg-white shadow-md text-primary ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>Berobat</button>
                            <button type="button" onClick={() => handleChange('category', 'MCU')} className={`flex-1 py-2.5 rounded-md text-sm font-bold transition duration-200 ${formData.category === 'MCU' ? 'bg-white shadow-md text-accent ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>MCU</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label className={labelClass}>Nama Lengkap</label>
                        <input type="text" required placeholder="Contoh: Ahmad Abdullah" className={inputClass(!!errors.name)} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label className={labelClass}>No. Identitas (KTP/ID)</label>
                        <input type="text" required placeholder="NIK / No ID" className={inputClass(!!errors.identityNo)} value={formData.identityNo || ''} onChange={e => handleChange('identityNo', e.target.value)} />
                        {errors.identityNo && <p className="text-red-500 text-xs mt-1">{errors.identityNo}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Jenis Kelamin</label>
                        <select className={inputClass(false)} value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    
                    {/* DOB & Age Row */}
                    <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-1">
                        <div>
                            <label className={labelClass}>Tanggal Lahir</label>
                            <input type="date" className={inputClass(!!errors.dateOfBirth)} value={formData.dateOfBirth || ''} onChange={e => handleChange('dateOfBirth', e.target.value)} />
                            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Umur (Th)</label>
                            <input type="number" readOnly={!!formData.dateOfBirth} required placeholder="0" className={inputClass(!!errors.age)} value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value))} />
                             {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>No. Telepon</label>
                        <input type="tel" required placeholder="08xx-xxxx-xxxx" className={inputClass(!!errors.phone)} value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>Alamat Lengkap</label>
                        <input type="text" required placeholder="Jl. ..." className={inputClass(false)} value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>

        {/* Section 2: Vitals */}
        <div className={sectionClass}>
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className={`${headerClass} text-blue-800 border-blue-100`}>
              <Activity className="text-blue-600" /> Tanda-Tanda Vital & Riwayat
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
                <div className="space-y-1">
                   <label className={labelClass}><Ruler size={12} className="inline"/> TB (cm)</label>
                   <input type="number" placeholder="0" className={inputClass(!!errors.height)} value={formData.height || ''} onChange={e => handleChange('height', parseFloat(e.target.value))} />
                </div>
                <div className="space-y-1">
                   <label className={labelClass}><Scale size={12} className="inline"/> BB (kg)</label>
                   <input type="number" placeholder="0" className={inputClass(!!errors.weight)} value={formData.weight || ''} onChange={e => handleChange('weight', parseFloat(e.target.value))} />
                </div>
                <div className="space-y-1">
                   <label className={labelClass}><Calculator size={12} className="inline"/> BMI</label>
                   <input type="number" readOnly className={`${inputClass(false)} bg-gray-100 border-transparent text-gray-500`} value={formData.bmi || ''} />
                </div>
                <div className="space-y-1 lg:col-span-2">
                   <label className={labelClass}>Status BMI</label>
                   <div className={`w-full p-2.5 rounded-lg text-center text-sm font-bold shadow-sm border ${formData.bmiStatus === 'Normal' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                      {formData.bmiStatus || '-'}
                   </div>
                </div>
                <div className="space-y-1">
                   <label className={labelClass}><HeartPulse size={12} className="inline"/> TD</label>
                   <input type="text" placeholder="120/80" className={inputClass(false)} value={formData.bloodPressure || ''} onChange={e => handleChange('bloodPressure', e.target.value)} />
                </div>
                <div className="space-y-1">
                   <label className={labelClass}><Thermometer size={12} className="inline"/> Nadi</label>
                   <input type="number" placeholder="80" className={inputClass(false)} value={formData.pulse || ''} onChange={e => handleChange('pulse', parseInt(e.target.value))} />
                </div>
            </div>
             <div className="mt-4">
                <label className={labelClass}>Riwayat Penyakit Terdahulu / Alergi</label>
                <input type="text" placeholder="Contoh: Hipertensi, Alergi Antibiotik..." className={inputClass(false)} value={formData.historyOfIllness || ''} onChange={e => handleChange('historyOfIllness', e.target.value)} />
              </div>
        </div>

        {/* Section 3: Conditional */}
        {formData.category === 'Berobat' ? (
          <div className={sectionClass}>
             <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
             <h3 className={`${headerClass} text-green-800 border-green-100`}>
               <Stethoscope className="text-green-600" /> Pemeriksaan Klinis (Berobat)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Anamnesis (Keluhan Subjektif)</label>
                  <textarea rows={5} placeholder="Apa yang dirasakan pasien..." className={inputClass(false)} value={formData.subjective || ''} onChange={e => handleChange('subjective', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Pemeriksaan Fisik (Objektif)</label>
                  <textarea rows={5} placeholder="Hasil pemeriksaan fisik..." className={inputClass(false)} value={formData.physicalExam || ''} onChange={e => handleChange('physicalExam', e.target.value)} />
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-6 rounded-lg border border-green-200 mt-6 shadow-sm relative z-20">
                <div className="md:col-span-2 relative" ref={searchRef}>
                   <label className={labelClass}><FileText size={16} className="inline mr-1"/> Diagnosis (ICD-10)</label>
                   <div className="relative">
                       <input 
                         type="text" 
                         className={`${inputClass(false)} pl-10`}
                         placeholder="Ketik kode atau nama penyakit..."
                         value={diagnosisSearch}
                         onChange={(e) => {
                             setDiagnosisSearch(e.target.value);
                             setShowDiagnosisSuggestions(true);
                         }}
                         onFocus={() => setShowDiagnosisSuggestions(true)}
                       />
                       <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                       {formData.diagnosisCode && (
                           <button 
                             type="button"
                             onClick={() => {
                                 setDiagnosisSearch('');
                                 setFormData(prev => ({...prev, diagnosisCode: '', diagnosisName: ''}));
                             }}
                             className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                           >
                               <X size={18} />
                           </button>
                       )}
                   </div>
                   
                   {/* Suggestions Dropdown */}
                   {showDiagnosisSuggestions && diagnosisSearch && (
                       <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                           {filteredDiagnoses.length > 0 ? (
                               filteredDiagnoses.map((icd) => (
                                   <li 
                                     key={icd.code}
                                     onClick={() => selectDiagnosis(icd.code, icd.name)}
                                     className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0"
                                   >
                                       <div className="font-bold text-gray-800 text-sm flex justify-between">
                                            <span>{icd.name}</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 rounded text-xs ml-2">{icd.code}</span>
                                       </div>
                                   </li>
                               ))
                           ) : (
                               <li className="px-4 py-3 text-gray-500 text-sm italic">Tidak ditemukan diagnosis yang cocok.</li>
                           )}
                       </ul>
                   )}
                </div>
                 <div>
                   <label className={labelClass}><AlertCircle size={16} className="inline mr-1"/> Status Rujukan</label>
                   <select className={inputClass(false)} value={formData.referralStatus || 'Tidak Rujuk'} onChange={e => handleChange('referralStatus', e.target.value)}>
                      <option value="Tidak Rujuk">Tidak Rujuk</option>
                      <option value="Rujuk">Rujuk RS</option>
                   </select>
                </div>
                <div className="md:col-span-3">
                   <label className={labelClass}><Pill size={16} className="inline mr-1"/> Therapy / Tindakan / Obat</label>
                   <textarea rows={3} placeholder="Resep obat atau tindakan yang diberikan..." className={inputClass(false)} value={formData.therapy || ''} onChange={e => handleChange('therapy', e.target.value)} />
                </div>
             </div>
          </div>
        ) : (
          <div className={`${sectionClass} space-y-8`}>
             <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
             <h3 className={`${headerClass} text-amber-800 border-amber-100`}>
               <FileText className="text-amber-600" /> Formulir Medical Check-Up (MCU)
             </h3>
             
             {/* 1. Kepala & Leher (Mata, THT, Gigi) */}
             <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                 <h4 className="font-bold text-amber-900 mb-3 uppercase text-sm tracking-wider flex items-center gap-2"><Eye size={16}/> Kepala & Leher</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Split Visus */}
                    <div className="bg-white p-2 rounded border border-amber-200 col-span-1 md:col-span-2 grid grid-cols-2 gap-2">
                       <label className="col-span-2 text-xs font-bold text-amber-700 block border-b pb-1 mb-1">Visus Mata</label>
                       <div>
                          <label className="text-[10px] text-gray-500 uppercase">OD (Kanan)</label>
                          <input placeholder="6/6" className={inputClass(false)} value={formData.visusOD || ''} onChange={e => handleChange('visusOD', e.target.value)} />
                       </div>
                       <div>
                          <label className="text-[10px] text-gray-500 uppercase">OS (Kiri)</label>
                          <input placeholder="6/6" className={inputClass(false)} value={formData.visusOS || ''} onChange={e => handleChange('visusOS', e.target.value)} />
                       </div>
                    </div>
                    
                    <div>
                       <label className={labelClass}>Buta Warna</label>
                       <select className={inputClass(false)} value={formData.colorBlind || ''} onChange={e => handleChange('colorBlind', e.target.value)}>
                           <option value="">- Pilih -</option>
                           <option value="Normal">Normal</option>
                           <option value="Buta Warna Parsial">Buta Warna Parsial</option>
                           <option value="Buta Warna Total">Buta Warna Total</option>
                       </select>
                    </div>
                     <div>
                       <label className={labelClass}>Telinga Kanan</label>
                       <input placeholder="Normal/Serumen..." className={inputClass(false)} value={formData.rightEar || ''} onChange={e => handleChange('rightEar', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelClass}>Telinga Kiri</label>
                       <input placeholder="Normal/Serumen..." className={inputClass(false)} value={formData.leftEar || ''} onChange={e => handleChange('leftEar', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelClass}>Hidung</label>
                       <input placeholder="Normal/Polip/Deviasi..." className={inputClass(false)} value={formData.nose || ''} onChange={e => handleChange('nose', e.target.value)} />
                    </div>
                     <div>
                       <label className={labelClass}>Gigi & Mulut</label>
                       <input placeholder="Caries/Normal..." className={inputClass(false)} value={formData.teeth || ''} onChange={e => handleChange('teeth', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelClass}>Tonsil</label>
                       <input placeholder="T0/T1/T2..." className={inputClass(false)} value={formData.tonsil || ''} onChange={e => handleChange('tonsil', e.target.value)} />
                    </div>
                 </div>
             </div>

             {/* 2. Thorax & Abdomen */}
             <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-3 uppercase text-sm tracking-wider flex items-center gap-2"><Activity size={16}/> Thorax & Abdomen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Thorax (Jantung & Paru)</label>
                        <input placeholder="Cor/Pulmo..." className={inputClass(false)} value={formData.thorax || ''} onChange={e => handleChange('thorax', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Abdomen (Perut)</label>
                        <input placeholder="Supel, Nyeri tekan (-)..." className={inputClass(false)} value={formData.abdomen || ''} onChange={e => handleChange('abdomen', e.target.value)} />
                    </div>
                </div>
             </div>

             {/* 3. Bedah & Genitalia */}
             <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                 <h4 className="font-bold text-amber-900 mb-3 uppercase text-sm tracking-wider flex items-center gap-2"><Shield size={16}/> Bedah & Genitalia</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                       <label className={labelClass}>Varicocele</label>
                       <select className={inputClass(false)} value={formData.varicocele || ''} onChange={e => handleChange('varicocele', e.target.value)}>
                           <option value="">- Pilih -</option>
                           <option value="Tidak Ada">Tidak Ada</option>
                           <option value="Ada">Ada</option>
                       </select>
                    </div>
                    <div>
                       <label className={labelClass}>Hernia</label>
                        <select className={inputClass(false)} value={formData.hernia || ''} onChange={e => handleChange('hernia', e.target.value)}>
                           <option value="">- Pilih -</option>
                           <option value="Tidak Ada">Tidak Ada</option>
                           <option value="Ada">Ada</option>
                       </select>
                    </div>
                    <div>
                       <label className={labelClass}>Haemoroid</label>
                       <select className={inputClass(false)} value={formData.hemorrhoids || ''} onChange={e => handleChange('hemorrhoids', e.target.value)}>
                           <option value="">- Pilih -</option>
                           <option value="Tidak Ada">Tidak Ada</option>
                           <option value="Grade 1">Grade 1</option>
                           <option value="Grade 2">Grade 2</option>
                           <option value="Grade 3">Grade 3</option>
                       </select>
                    </div>
                 </div>
             </div>

             {/* 4. Ekstremitas & Neurologis */}
             <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                 <h4 className="font-bold text-amber-900 mb-3 uppercase text-sm tracking-wider flex items-center gap-2"><Brain size={16}/> Ekstremitas & Neurologis</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div>
                       <label className={labelClass}>Varises</label>
                       <input placeholder="+/-" className={inputClass(false)} value={formData.varicose || ''} onChange={e => handleChange('varicose', e.target.value)} />
                    </div>
                     <div>
                       <label className={labelClass}>Deformitas Alat Gerak</label>
                       <input placeholder="Tidak ada / Lokasi..." className={inputClass(false)} value={formData.extremityDeformity || ''} onChange={e => handleChange('extremityDeformity', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelClass}>Reflek Pupil</label>
                       <input placeholder="+/+" className={inputClass(false)} value={formData.reflexPupil || ''} onChange={e => handleChange('reflexPupil', e.target.value)} />
                    </div>
                     <div>
                       <label className={labelClass}>Reflek Patella</label>
                       <input placeholder="+/+" className={inputClass(false)} value={formData.reflexPatella || ''} onChange={e => handleChange('reflexPatella', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelClass}>Reflek Achiles</label>
                       <input placeholder="+/+" className={inputClass(false)} value={formData.reflexAchilles || ''} onChange={e => handleChange('reflexAchilles', e.target.value)} />
                    </div>
                 </div>
             </div>

             {/* 5. Penunjang */}
             <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-3 uppercase text-sm tracking-wider flex items-center gap-2"><FileBarChart size={16}/> Pemeriksaan Penunjang</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className={labelClass}>Hasil EKG</label>
                       <input placeholder="Normal / Abnormal..." className={inputClass(false)} value={formData.ekgResult || ''} onChange={e => handleChange('ekgResult', e.target.value)} />
                    </div>
                    <div>
                       <label className={labelClass}>Hasil Rontgen</label>
                       <input placeholder="Keterangan Rontgen..." className={inputClass(false)} value={formData.xrayResult || ''} onChange={e => handleChange('xrayResult', e.target.value)} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                       <label className={labelClass}>Ringkasan Hasil Lab</label>
                       <textarea rows={2} placeholder="Hb, Leukosit, Trombosit, Gula Darah..." className={inputClass(false)} value={formData.labSummary || ''} onChange={e => handleChange('labSummary', e.target.value)} />
                    </div>
                </div>
             </div>

             <div className="border-t-2 border-amber-200 pt-6 mt-6">
               <h4 className="text-lg font-bold text-amber-800 mb-4">Kesimpulan & Rekomendasi</h4>
               <div className="space-y-4">
                   <div>
                        <label className={labelClass}>Kesimpulan MCU</label>
                        <textarea placeholder="Fit / Unfit / Temporary Unfit..." className={inputClass(false)} rows={2} value={formData.mcuConclusion || ''} onChange={e => handleChange('mcuConclusion', e.target.value)} />
                   </div>
                   <div>
                        <label className={labelClass}>Rekomendasi / Saran</label>
                        <textarea placeholder="Saran medis..." className={inputClass(false)} rows={2} value={formData.mcuRecommendation || ''} onChange={e => handleChange('mcuRecommendation', e.target.value)} />
                   </div>
               </div>
             </div>
          </div>
        )}

      </div>

      <div className="bg-gray-50 px-8 py-5 flex justify-end gap-3 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-bold transition shadow-sm">Batal</button>
        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-lg shadow-lg hover:bg-secondary font-bold flex items-center gap-2 transform active:scale-95 transition">
           <Save size={18} /> Simpan Data
        </button>
      </div>
    </form>
  );
};

export default PatientForm;