
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Patient, TriageLevel, PatientCategory } from '../types';
import { 
  User, MapPin, Stethoscope, 
  HeartPulse, Search, Save, AlertTriangle, Info, Mic, UserX, Eye, Activity, ClipboardCheck,
  ShieldAlert, ChevronRight, Calculator, CheckCircle2, Zap, Microscope, Activity as ActivityIcon, Thermometer, Wind
} from 'lucide-react';

interface Props {
  initialData?: Patient;
  onSave: () => void;
  onCancel: () => void;
  isStandalone?: boolean;
}

const PatientForm: React.FC<Props> = ({ initialData, onSave, onCancel, isStandalone = false }) => {
  const { activities, user, addPatient, icd10List } = useApp();
  
  const [isListening, setIsListening] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'medis' | 'mcu'>('basic');

  const availableActivities = activities.filter(a => {
    if (user?.role === 'admin') return true;
    return a.status === 'On Progress';
  });

  const generateMRN = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return isEmergencyMode ? `X-TEMP-${yyyy}${mm}${dd}-${random}` : `RM-${yyyy}${mm}${dd}-${random}`;
  };

  const [formData, setFormData] = useState<Partial<Patient>>(initialData || {
    category: 'Berobat',
    triage: 'Green',
    visitDate: new Date().toISOString().split('T')[0],
    height: 0,
    weight: 0,
    gender: 'L',
    mrn: generateMRN(),
    age: 0,
    bloodType: 'O',
    address: '',
    dateOfBirth: '',
    temperature: 36.5,
    respiration: 20
  });

  // AUTO BMI CALCULATOR
  useEffect(() => {
    if (formData.height && formData.weight && formData.height > 0) {
      const heightMeters = formData.height / 100;
      const bmi = parseFloat((formData.weight / (heightMeters * heightMeters)).toFixed(2));
      let status = 'Normal';
      if (bmi < 18.5) status = 'Kurus (Underweight)';
      else if (bmi >= 25 && bmi < 30) status = 'Gemuk (Overweight)';
      else if (bmi >= 30) status = 'Obesitas';
      
      setFormData(prev => ({ ...prev, bmi, bmiStatus: status }));
    }
  }, [formData.height, formData.weight]);

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // SPEED UP: Helper to fill section with "NORMAL" values
  const fillNormal = (section: 'vision' | 'tht' | 'body' | 'neuro') => {
    const updates: Partial<Patient> = {};
    if (section === 'vision') {
        updates.visusOD = '6/6';
        updates.visusOS = '6/6';
        updates.colorBlind = 'Normal (Tidak Buta Warna)';
    } else if (section === 'tht') {
        updates.nose = 'Normal / Dekongenstan (-)';
        updates.tonsil = 'T1-T1 Tenang';
        updates.teeth = 'Caries (-), Mukosa Sehat';
        updates.rightEar = 'Normal, Serumen (-)';
        updates.leftEar = 'Normal, Serumen (-)';
    } else if (section === 'body') {
        updates.thorax = 'Cor/Pulmo Dalam Batas Normal';
        updates.abdomen = 'Supel, Nyeri Tekan (-), BU (+)';
        updates.hernia = 'Negatif';
        updates.hemorrhoids = 'Negatif';
        updates.varicose = 'Negatif';
    } else if (section === 'neuro') {
        updates.reflexPupil = 'Isokor +/+, Refleks Cahaya +/+';
        updates.reflexPatella = 'Normal +/+';
        updates.reflexAchilles = 'Normal +/+';
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activityId) return alert("Pilih kegiatan.");
    
    const patientData = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      lastModifiedBy: user?.name || 'System',
      lastModifiedAt: new Date().toLocaleString('id-ID'),
    } as Patient;

    addPatient(patientData);
    onSave();
  };

  const triageColors = { Green: 'bg-emerald-500', Yellow: 'bg-amber-400', Red: 'bg-rose-500' };
  const sectionClass = "bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest";
  const inputClass = "w-full border border-slate-200 p-3 rounded-2xl bg-slate-50/50 text-slate-800 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold";
  const headerClass = "font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-tighter text-lg";

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6 pb-32 animate-fade-in">
      
      {/* HEADER: DYNAMIC STATUS */}
      <div className={`p-8 rounded-[40px] border shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 transition-all duration-700 ${isEmergencyMode ? 'bg-rose-600 border-rose-400' : formData.category === 'MCU' ? 'bg-amber-500 border-amber-300' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all ${isEmergencyMode ? 'bg-white text-rose-600 scale-110 animate-pulse' : formData.category === 'MCU' ? 'bg-white text-amber-500' : `text-white ${triageColors[formData.triage as TriageLevel]}`}`}>
                  {isEmergencyMode ? <ShieldAlert size={40} /> : formData.category === 'MCU' ? <Eye size={40} /> : <AlertTriangle size={40} />}
              </div>
              <div>
                  <h2 className={`text-3xl font-black uppercase tracking-tighter ${isEmergencyMode || formData.category === 'MCU' ? 'text-white' : 'text-slate-800'}`}>
                    {isEmergencyMode ? 'EMERGENCY RESPONSE' : formData.category === 'MCU' ? 'MEDICAL CHECK-UP' : 'REGISTRASI BEROBAT'}
                  </h2>
                  <p className={`font-mono text-sm ${isEmergencyMode || formData.category === 'MCU' ? 'text-white/70' : 'text-slate-400'}`}>
                    ID-PASIEN: {formData.mrn}
                  </p>
              </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 justify-center">
              <button 
                type="button"
                onClick={() => {
                  setIsEmergencyMode(!isEmergencyMode);
                  if (!isEmergencyMode) {
                    handleChange('category', 'Berobat');
                    setActiveTab('basic');
                    handleChange('triage', 'Red');
                  }
                }}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl ${isEmergencyMode ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}
              >
                  <UserX size={18}/> {isEmergencyMode ? 'Mode Darurat Aktif' : 'Aksi Darurat'}
              </button>
              
              <div className="h-10 w-px bg-slate-200 hidden lg:block"></div>

              {!isEmergencyMode && (
                <div className="flex gap-2 p-1.5 bg-black/10 rounded-2xl">
                    {(['Berobat', 'MCU'] as PatientCategory[]).map(c => (
                        <button 
                          key={c}
                          type="button" 
                          onClick={() => {
                            handleChange('category', c);
                            setActiveTab(c === 'MCU' ? 'mcu' : 'medis');
                          }}
                          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${formData.category === c ? 'bg-white text-slate-800 shadow-lg' : 'text-white/60'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
              )}
          </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-[32px] w-fit mx-auto shadow-sm">
          <button type="button" onClick={() => setActiveTab('basic')} className={`px-8 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'basic' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-50'}`}>Identitas & Vitals</button>
          
          {!isEmergencyMode && formData.category === 'Berobat' && (
              <button type="button" onClick={() => setActiveTab('medis')} className={`px-8 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'medis' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'}`}>Analisis SOAP</button>
          )}

          {!isEmergencyMode && formData.category === 'MCU' && (
              <button type="button" onClick={() => setActiveTab('mcu')} className={`px-8 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'mcu' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-slate-400 hover:bg-slate-50'}`}>Pemeriksaan Fisik & Penunjang</button>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            
            {/* --- TAB: BASIC (IDENTITAS) --- */}
            {activeTab === 'basic' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className={sectionClass}>
                        <h3 className={headerClass}><User size={24} className="text-primary"/> Informasi Identitas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>No. KTP / NIK</label>
                                <input type="text" placeholder="Masukkan 16 Digit NIK" className={inputClass} value={formData.identityNo || ''} onChange={e => handleChange('identityNo', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Nama Lengkap Pasien</label>
                                <input type="text" required className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Tanggal Lahir</label>
                                <input type="date" className={inputClass} value={formData.dateOfBirth || ''} onChange={e => {
                                    const val = e.target.value;
                                    const birthYear = new Date(val).getFullYear();
                                    const currentYear = new Date().getFullYear();
                                    handleChange('dateOfBirth', val);
                                    handleChange('age', currentYear - birthYear);
                                }} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Jenis Kelamin</label>
                                    <select className={inputClass} value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                                        <option value="L">Laki-Laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Usia (Otomatis)</label>
                                    <input type="number" className={inputClass} value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Alamat Lengkap (Domisili)</label>
                                <textarea rows={2} className={inputClass} value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} placeholder="Jl, RT/RW, Kec, Kab/Kota..." />
                            </div>
                        </div>
                    </div>

                    <div className={sectionClass}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg flex items-center gap-3">
                                <HeartPulse size={24} className="text-rose-500"/> Vital Signs & Nutrisi
                            </h3>
                            {formData.bmi && (
                                <div className="px-5 py-2.5 bg-slate-900 rounded-3xl flex items-center gap-4 shadow-xl">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-500 uppercase leading-none">Indeks Masa Tubuh</span>
                                        <span className="text-white font-black text-lg leading-tight">{formData.bmi}</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-700"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-500 uppercase leading-none">Status Nutrisi</span>
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 mt-1 rounded-full ${
                                            formData.bmiStatus?.includes('Normal') ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'
                                        }`}>{formData.bmiStatus}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            <div>
                                <label className={labelClass}>Tensi (mmHg)</label>
                                <input placeholder="120/80" className={inputClass} value={formData.bloodPressure || ''} onChange={e => handleChange('bloodPressure', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Nadi (x/m)</label>
                                <input type="number" className={inputClass} value={formData.pulse || ''} onChange={e => handleChange('pulse', parseInt(e.target.value))} />
                            </div>
                            <div>
                                <label className={labelClass}>Napas (x/m)</label>
                                <div className="relative">
                                  <Wind className="absolute right-3 top-3 text-slate-300" size={16}/>
                                  <input type="number" className={inputClass} value={formData.respiration || ''} onChange={e => handleChange('respiration', parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Suhu (°C)</label>
                                <div className="relative">
                                  <Thermometer className="absolute right-3 top-3 text-slate-300" size={16}/>
                                  <input type="number" step="0.1" className={inputClass} value={formData.temperature || ''} onChange={e => handleChange('temperature', parseFloat(e.target.value))} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Tinggi (cm)</label>
                                <input type="number" className={inputClass} value={formData.height || ''} onChange={e => handleChange('height', parseFloat(e.target.value))} />
                            </div>
                            <div>
                                <label className={labelClass}>Berat (kg)</label>
                                <input type="number" className={inputClass} value={formData.weight || ''} onChange={e => handleChange('weight', parseFloat(e.target.value))} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: MEDIS (BEROBAT) --- */}
            {activeTab === 'medis' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className={sectionClass}>
                        <h3 className={headerClass}><Stethoscope size={24} className="text-emerald-500"/> Analisis Medis (S.O.A.P)</h3>
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Subjektif (Anamnesis/Keluhan Utama)</label>
                                <textarea rows={4} className={inputClass} value={formData.subjective || ''} onChange={e => handleChange('subjective', e.target.value)} placeholder="Pasien mengeluh..." />
                            </div>
                            <div>
                                <label className={labelClass}>Objektif (Temuan Pemeriksaan Fisik)</label>
                                <textarea rows={3} className={inputClass} value={formData.physicalExam || ''} onChange={e => handleChange('physicalExam', e.target.value)} placeholder="Keadaan Umum, Thorax, Abdomen..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Assessment (Diagnosa ICD-10)</label>
                                    <select className={inputClass} value={formData.diagnosisCode} onChange={e => {
                                        const found = icd10List.find(x => x.code === e.target.value);
                                        setFormData(prev => ({ ...prev, diagnosisCode: e.target.value, diagnosisName: found?.name }));
                                    }}>
                                        <option value="">-- Cari Diagnosa --</option>
                                        {icd10List.map(item => <option key={item.code} value={item.code}>{item.code} - {item.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Plan (Therapy & Instruksi)</label>
                                    <textarea className={inputClass} value={formData.therapy || ''} onChange={e => handleChange('therapy', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: MCU (DETAILED + PENUNJANG) --- */}
            {activeTab === 'mcu' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className={sectionClass}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg flex items-center gap-3">
                                <Eye size={24} className="text-amber-500"/> Pemeriksaan Head-to-Toe
                            </h3>
                            <div className="flex items-center gap-2 bg-slate-900/5 p-2 rounded-2xl">
                                <Zap size={14} className="text-amber-500" />
                                <span className="text-[10px] font-black uppercase text-slate-500 mr-2">Quick Input:</span>
                                <button type="button" onClick={() => fillNormal('vision')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">Normal Mata</button>
                                <button type="button" onClick={() => fillNormal('tht')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">Normal THT</button>
                                <button type="button" onClick={() => fillNormal('body')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">Normal Tubuh</button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* VISION */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 border-b pb-2 mb-4 flex items-center gap-2"><CheckCircle2 size={12}/> PENGLIHATAN</h4>
                                <div><label className={labelClass}>Visus Mata Kanan (OD)</label><input className={inputClass} value={formData.visusOD || ''} onChange={e => handleChange('visusOD', e.target.value)} /></div>
                                <div><label className={labelClass}>Visus Mata Kiri (OS)</label><input className={inputClass} value={formData.visusOS || ''} onChange={e => handleChange('visusOS', e.target.value)} /></div>
                                <div><label className={labelClass}>Tes Buta Warna</label><input className={inputClass} value={formData.colorBlind || ''} onChange={e => handleChange('colorBlind', e.target.value)} /></div>
                            </div>
                            
                            {/* THT & GIGI */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 border-b pb-2 mb-4 flex items-center gap-2"><CheckCircle2 size={12}/> THT & GIGI</h4>
                                <div><label className={labelClass}>Telinga (Kanan/Kiri)</label><input className={inputClass} placeholder="DBN/DBN" value={`${formData.rightEar || ''}${formData.rightEar && formData.leftEar ? '/' : ''}${formData.leftEar || ''}`} onChange={e => {
                                    const val = e.target.value;
                                    if(val.includes('/')) {
                                        const [r, l] = val.split('/');
                                        setFormData(prev => ({ ...prev, rightEar: r, leftEar: l }));
                                    } else {
                                        handleChange('rightEar', val);
                                    }
                                }} /></div>
                                <div><label className={labelClass}>Hidung / Sinus</label><input className={inputClass} value={formData.nose || ''} onChange={e => handleChange('nose', e.target.value)} /></div>
                                <div><label className={labelClass}>Tenggorokan / Tonsil</label><input className={inputClass} value={formData.tonsil || ''} onChange={e => handleChange('tonsil', e.target.value)} /></div>
                                <div><label className={labelClass}>Status Gigi Geligi</label><input className={inputClass} value={formData.teeth || ''} onChange={e => handleChange('teeth', e.target.value)} /></div>
                            </div>

                            {/* BODY & SURGICAL */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 border-b pb-2 mb-4 flex items-center gap-2"><CheckCircle2 size={12}/> BEDAH & TUBUH</h4>
                                <div><label className={labelClass}>Thorax (Cor/Pulmo)</label><input className={inputClass} value={formData.thorax || ''} onChange={e => handleChange('thorax', e.target.value)} /></div>
                                <div><label className={labelClass}>Abdomen (Organ Dalam)</label><input className={inputClass} value={formData.abdomen || ''} onChange={e => handleChange('abdomen', e.target.value)} /></div>
                                <div><label className={labelClass}>Hernia / Haemoroid</label><input className={inputClass} value={formData.hernia || ''} onChange={e => handleChange('hernia', e.target.value)} /></div>
                                <div><label className={labelClass}>Varises / Deformitas</label><input className={inputClass} value={formData.varicose || ''} onChange={e => handleChange('varicose', e.target.value)} /></div>
                            </div>
                            
                            {/* NEUROLOGY */}
                            <div className="space-y-4 md:col-span-3">
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h4 className="text-[10px] font-black text-slate-500 flex items-center gap-2"><CheckCircle2 size={12}/> NEUROLOGI & REFLEKS</h4>
                                    <button type="button" onClick={() => fillNormal('neuro')} className="text-[8px] font-black text-primary uppercase hover:underline">Semua Refleks Normal</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div><label className={labelClass}>Refleks Pupil</label><input className={inputClass} value={formData.reflexPupil || ''} onChange={e => handleChange('reflexPupil', e.target.value)} /></div>
                                    <div><label className={labelClass}>Refleks Patella</label><input className={inputClass} value={formData.reflexPatella || ''} onChange={e => handleChange('reflexPatella', e.target.value)} /></div>
                                    <div><label className={labelClass}>Refleks Achilles</label><input className={inputClass} value={formData.reflexAchilles || ''} onChange={e => handleChange('reflexAchilles', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        {/* PENUNJANG (EKG, RONTGEN, LAB) */}
                        <div className="mt-12 pt-10 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 rounded-b-[40px]">
                            <h4 className="font-black text-slate-800 uppercase tracking-tighter text-lg flex items-center gap-3 mb-6">
                                <Microscope size={24} className="text-primary"/> Pemeriksaan Penunjang (Laboratorium & Radiologi)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <label className={labelClass}>Interpretasi Jantung (EKG)</label>
                                    <textarea rows={3} className={inputClass} value={formData.ekgResult || ''} onChange={e => handleChange('ekgResult', e.target.value)} placeholder="Sinus Rhythm, dll..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Kesan Rontgen Thorax / X-Ray</label>
                                    <textarea rows={3} className={inputClass} value={formData.xrayResult || ''} onChange={e => handleChange('xrayResult', e.target.value)} placeholder="Cor/Pulmo tak tampak kelainan..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Ringkasan Hasil Laboratorium</label>
                                    <textarea rows={3} className={inputClass} value={formData.labSummary || ''} onChange={e => handleChange('labSummary', e.target.value)} placeholder="Hb, GDS, Kolesterol, Asam Urat..." />
                                </div>
                            </div>
                            
                            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                                 <div>
                                    <label className={labelClass}>Kesimpulan Akhir MCU (Fit/Unfit)</label>
                                    <textarea rows={2} className={`${inputClass} bg-white border-2`} value={formData.mcuConclusion || ''} onChange={e => handleChange('mcuConclusion', e.target.value)} placeholder="Dinyatakan Sehat/Fit untuk bekerja..." />
                                 </div>
                                 <div>
                                    <label className={labelClass}>Saran & Rekomendasi Medis</label>
                                    <textarea rows={2} className={`${inputClass} bg-white border-2`} value={formData.mcuRecommendation || ''} onChange={e => handleChange('mcuRecommendation', e.target.value)} placeholder="Perlu kontrol gula darah, kurangi lemak..." />
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* SIDEBAR: TRIAGE & CONTEXT */}
        <div className="space-y-8">
            <div className={sectionClass}>
                <h3 className={headerClass}><AlertTriangle size={24} className="text-primary"/> Tingkat Triage</h3>
                <div className="grid grid-cols-3 gap-2">
                   {(['Red', 'Yellow', 'Green'] as TriageLevel[]).map(t => (
                       <button 
                        key={t}
                        type="button" 
                        onClick={() => handleChange('triage', t)}
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${formData.triage === t ? `${triageColors[t]} text-white shadow-lg scale-105` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                       >
                           <div className={`w-3 h-3 rounded-full ${triageColors[t]}`}></div>
                           <span className="text-[10px] font-black uppercase">{t}</span>
                       </button>
                   ))}
                </div>
            </div>

            <div className={sectionClass}>
                <h3 className={headerClass}><ActivityIcon size={24} className="text-primary"/> Metadata Laporan</h3>
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Pilih Kegiatan Aktif</label>
                        <select required className={inputClass} value={formData.activityId || ''} onChange={e => handleChange('activityId', e.target.value)}>
                            <option value="">-- Pilih Nama Kegiatan --</option>
                            {availableActivities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Tanggal Pelayanan</label>
                        <input type="date" className={inputClass} value={formData.visitDate} onChange={e => handleChange('visitDate', e.target.value)} />
                    </div>
                    
                    <div className="p-4 bg-slate-900 rounded-[28px] text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <ClipboardCheck className="text-primary" size={20}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">Petugas Command Center</span>
                        </div>
                        <p className="text-sm font-bold">{user?.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono uppercase mt-1">{user?.teamId}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* FLOATING ACTION FOOTER */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/80 backdrop-blur-2xl p-6 rounded-[40px] border border-slate-200 shadow-2xl flex justify-between items-center z-[100] animate-fade-in-up">
          <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-100 rounded-2xl transition">Batal</button>
          <button type="submit" className={`px-12 py-4 rounded-[32px] font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl transition-all transform active:scale-95 ${isEmergencyMode ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-primary text-white shadow-primary/20'}`}>
              <Save size={20}/> {isEmergencyMode ? 'Kirim Data Darurat' : 'Simpan Rekam Medis'}
          </button>
      </div>
    </form>
  );
};

export default PatientForm;
