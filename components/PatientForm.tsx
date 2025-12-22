
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Patient, TriageLevel, PatientCategory, ReferralStatus } from '../types';
import { 
  User, Stethoscope, HeartPulse, Save, Eye, Microscope, ChevronLeft, Calculator, 
  Zap, Siren, Wind, Footprints, ClipboardList, Clock, UserCheck
} from 'lucide-react';

interface Props {
  initialData?: Patient;
  onSave: () => void;
  onCancel: () => void;
}

const PatientForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
  const { activities, user, addPatient, updatePatient, icd10List } = useApp();

  const [formData, setFormData] = useState<Partial<Patient>>(initialData || {
    category: 'Berobat',
    triage: 'Green',
    isEmergency: false,
    visitDate: new Date().toISOString().split('T')[0],
    gender: 'L',
    mrn: `RM-${Date.now()}`,
    age: 0, height: 0, weight: 0, temperature: 36.5, respiration: 20, pulse: 80,
    referralStatus: 'Selesai'
  });

  // Otomatis hitung BMI
  useEffect(() => {
    if (formData.height && formData.weight && formData.height > 0) {
      const h = formData.height / 100;
      const bmi = parseFloat((formData.weight / (h * h)).toFixed(2));
      let status = 'Normal';
      if (bmi < 18.5) status = 'Kurus';
      else if (bmi >= 25 && bmi < 30) status = 'Overweight';
      else if (bmi >= 30) status = 'Obesitas';
      setFormData(prev => ({ ...prev, bmi, bmiStatus: status }));
    }
  }, [formData.height, formData.weight]);

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // FIX QUICK FILL MODE
  const setMcuNormal = () => {
    if (window.confirm("Isi semua hasil pemeriksaan fisik dengan status 'Normal'?")) {
      const normalData: Partial<Patient> = {
        bloodPressure: '120/80',
        pulse: 80,
        respiration: 20,
        temperature: 36.5,
        visusOD: '6/6', 
        visusOS: '6/6', 
        colorBlind: 'Negatif', 
        rightEar: 'Normal', 
        leftEar: 'Normal',
        nose: 'Normal', 
        teeth: 'Normal', 
        tonsil: 'T1-T1 Tenang', 
        thorax: 'Normal', 
        abdomen: 'Normal',
        hernia: '(-) Tidak Ada', 
        hemorrhoids: '(-) Tidak Ada', 
        varicose: '(-) Tidak Ada',
        extremityDeformity: '(-) Tidak Ada', 
        reflexPupil: '(+) Isokor', 
        reflexPatella: '(+) Normal', 
        reflexAchilles: '(+) Normal', 
        rontgen: 'Cor & Pulmo dalam batas normal',
        ekg: 'Sinus Rhythm',
        laboratory: 'Darah Rutin & Urin Rutin dalam batas normal',
        mcuConclusion: 'SEHAT / FIT FOR WORK',
        referralStatus: 'Selesai'
      };
      
      // Force state update to all normal fields
      setFormData(prev => ({
        ...prev,
        ...normalData
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activityId) return alert("Pilih Event/Kegiatan operasional.");
    
    const finalName = formData.isEmergency && !formData.name ? `PASIEN DARURAT (${formData.mrn})` : formData.name;
    const finalNIK = formData.isEmergency && !formData.identityNo ? 'BYPASS-EMERGENCY' : formData.identityNo;

    if (!formData.isEmergency && (!finalName || !finalNIK)) {
        return alert("Nama dan NIK wajib diisi untuk registrasi normal.");
    }

    const patientPayload = { 
        ...formData, 
        name: finalName,
        identityNo: finalNIK,
        id: formData.id || crypto.randomUUID(), 
        lastModifiedBy: user?.name || 'Sistem PCC', 
        lastModifiedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    } as Patient;

    if (initialData?.id) {
        updatePatient(patientPayload);
    } else {
        addPatient(patientPayload);
    }
    onSave();
  };

  const cardClass = "bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all";
  const labelClass = "text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block";
  const inputClass = "w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-32 animate-card">
      {/* HEADER REGISTRASI */}
      <div className={`bg-white p-6 rounded-[2.5rem] border flex flex-col md:flex-row justify-between items-center shadow-lg gap-6 transition-all ${formData.isEmergency ? 'border-rose-500 ring-8 ring-rose-500/10' : ''}`}>
          <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${formData.isEmergency ? 'bg-rose-500 text-white animate-pulse' : 'bg-primary text-white'}`}>
                  {formData.isEmergency ? <Siren size={28} /> : (formData.category === 'MCU' ? <Microscope size={28} /> : <ClipboardList size={28} />)}
              </div>
              <div>
                  <h2 className={`text-xl font-black uppercase tracking-tighter italic ${formData.isEmergency ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formData.isEmergency ? 'MODE EMERGENCY AKTIF' : (formData.category === 'MCU' ? 'PENDAFTARAN MCU' : 'PENDAFTARAN MEDIS')}
                  </h2>
                  <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">ID KUNJUNGAN: {formData.mrn}</p>
              </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-200">
             <button type="button" onClick={() => handleChange('isEmergency', !formData.isEmergency)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${formData.isEmergency ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-rose-500'}`}>
                <Siren size={14}/> {formData.isEmergency ? 'DARURAT' : 'NORMAL'}
             </button>
             <div className="w-px h-6 bg-slate-200"></div>
             {(['Berobat', 'MCU'] as PatientCategory[]).map(cat => (
                 <button key={cat} type="button" onClick={() => handleChange('category', cat)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${formData.category === cat ? 'bg-white text-primary shadow-md' : 'text-slate-400'}`}>
                    {cat}
                 </button>
             ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* KOLOM KIRI: FORM UTAMA */}
        <div className="lg:col-span-8 space-y-8">
            {/* 1. BIODATA */}
            <div className={cardClass}>
                <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><User className="text-primary" size={20}/> 1. Informasi Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className={labelClass}>No. Identitas (NIK) {!formData.isEmergency && <span className="text-rose-500">*</span>}</label>
                        <input className={inputClass} value={formData.identityNo || ''} onChange={e => handleChange('identityNo', e.target.value)} placeholder={formData.isEmergency ? "Auto Bypass..." : "Masukkan 16 Digit NIK..."} />
                    </div>
                    <div>
                        <label className={labelClass}>Nama Lengkap {!formData.isEmergency && <span className="text-rose-500">*</span>}</label>
                        <input className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Nama sesuai KTP..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Gender</label><select className={inputClass} value={formData.gender} onChange={e => handleChange('gender', e.target.value as 'L' | 'P')}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                        <div><label className={labelClass}>Usia (Thn)</label><input type="number" className={inputClass} value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value))} /></div>
                    </div>
                </div>
            </div>

            {/* 2. VITAL SIGNS */}
            <div className={cardClass}>
                <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><HeartPulse className="text-rose-500" size={20}/> 2. Tanda Vital</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="col-span-2"><label className={labelClass}>TD (mmHg)</label><input className={inputClass} value={formData.bloodPressure || ''} onChange={e => handleChange('bloodPressure', e.target.value)} placeholder="120/80" /></div>
                    <div><label className={labelClass}>Nadi (bpm)</label><input type="number" className={inputClass} value={formData.pulse || ''} onChange={e => handleChange('pulse', parseInt(e.target.value))} /></div>
                    <div><label className={labelClass}>Suhu (°C)</label><input type="number" step="0.1" className={inputClass} value={formData.temperature || ''} onChange={e => handleChange('temperature', parseFloat(e.target.value))} /></div>
                    <div><label className={labelClass}>Resp (RR/m) <span className="text-primary font-black">*</span></label><input type="number" className={inputClass} value={formData.respiration || ''} onChange={e => handleChange('respiration', parseInt(e.target.value))} placeholder="20" /></div>
                    <div><label className={labelClass}>Tinggi (cm)</label><input type="number" className={inputClass} value={formData.height || ''} onChange={e => handleChange('height', parseFloat(e.target.value))} /></div>
                    <div><label className={labelClass}>Berat (kg)</label><input type="number" className={inputClass} value={formData.weight || ''} onChange={e => handleChange('weight', parseFloat(e.target.value))} /></div>
                    <div className="bg-slate-50 p-3 rounded-2xl border flex flex-col justify-center">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">BMI / Status</label>
                        <p className="font-black text-sm text-slate-700">{formData.bmi || 0} ({formData.bmiStatus || '-'})</p>
                    </div>
                </div>
            </div>

            {/* 3. SOAP (Kategori Berobat) */}
            {formData.category === 'Berobat' && (
                <div className={`${cardClass} animate-fade-in`}>
                    <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Stethoscope className="text-primary" size={20}/> 3. Assessment Klinis (SOAP)</h3>
                    <div className="space-y-6">
                        <div><label className={labelClass}>Subjektif (Anamnesa)</label><textarea rows={3} className={inputClass} value={formData.subjective || ''} onChange={e => handleChange('subjective', e.target.value)} placeholder="Keluhan utama pasien..." /></div>
                        <div><label className={labelClass}>Objektif (Pemeriksaan Fisik)</label><textarea rows={3} className={inputClass} value={formData.physicalExam || ''} onChange={e => handleChange('physicalExam', e.target.value)} placeholder="Hasil observasi visual..." /></div>
                        <div>
                            <label className={labelClass}>Assessment (Diagnosa ICD-10)</label>
                            <select className={inputClass} value={formData.diagnosisCode} onChange={e => {
                                const icd = icd10List.find(i => i.code === e.target.value);
                                setFormData(prev => ({ ...prev, diagnosisCode: e.target.value, diagnosisName: icd?.name }));
                            }}>
                                <option value="">-- Cari Diagnosa ICD-10 --</option>
                                {icd10List.map(i => <option key={i.code} value={i.code}>{i.code} - {i.name}</option>)}
                            </select>
                        </div>
                        <div><label className={labelClass}>Plan (Therapy & Instruksi)</label><textarea rows={3} className={inputClass} value={formData.therapy || ''} onChange={e => handleChange('therapy', e.target.value)} placeholder="Rencana pengobatan / tindakan..." /></div>
                    </div>
                </div>
            )}

            {/* 4. MCU DATA (Kategori MCU) */}
            {formData.category === 'MCU' && (
                <div className="space-y-8 animate-fade-in">
                    {/* QUICK FILL BUTTON */}
                    <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex justify-between items-center no-print">
                        <div>
                            <h4 className="font-black text-primary text-sm uppercase">Quick Fill Mode</h4>
                            <p className="text-[10px] font-bold text-primary/60">Isi otomatis hasil fisik sebagai "Normal"</p>
                        </div>
                        <button type="button" onClick={setMcuNormal} className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Set Normal Semua</button>
                    </div>

                    {/* FISIK MCU */}
                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Eye className="text-primary" size={20}/> 3. Penglihatan & THT</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Visus OD/OS</label><div className="flex gap-2"><input className={inputClass} value={formData.visusOD || ''} onChange={e => handleChange('visusOD', e.target.value)} placeholder="Kanan" /><input className={inputClass} value={formData.visusOS || ''} onChange={e => handleChange('visusOS', e.target.value)} placeholder="Kiri" /></div></div>
                            <div><label className={labelClass}>Buta Warna</label><input className={inputClass} value={formData.colorBlind || ''} onChange={e => handleChange('colorBlind', e.target.value)} placeholder="Negatif" /></div>
                            <div><label className={labelClass}>Hidung & Gigi</label><div className="flex gap-2"><input className={inputClass} value={formData.nose || ''} onChange={e => handleChange('nose', e.target.value)} placeholder="Hidung" /><input className={inputClass} value={formData.teeth || ''} onChange={e => handleChange('teeth', e.target.value)} placeholder="Gigi & Mulut" /></div></div>
                            <div><label className={labelClass}>Tonsil & Tenggorokan</label><input className={inputClass} value={formData.tonsil || ''} onChange={e => handleChange('tonsil', e.target.value)} placeholder="Normal" /></div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Wind className="text-primary" size={20}/> 4. Thorax & Abdomen</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Thorax (Jantung/Paru)</label><input className={inputClass} value={formData.thorax || ''} onChange={e => handleChange('thorax', e.target.value)} placeholder="Normal" /></div>
                            <div><label className={labelClass}>Abdomen</label><input className={inputClass} value={formData.abdomen || ''} onChange={e => handleChange('abdomen', e.target.value)} placeholder="Normal" /></div>
                            <div><label className={labelClass}>Hernia & Varicose</label><div className="flex gap-2"><input className={inputClass} value={formData.hernia || ''} onChange={e => handleChange('hernia', e.target.value)} placeholder="Hernia" /><input className={inputClass} value={formData.varicose || ''} onChange={e => handleChange('varicose', e.target.value)} placeholder="Varicose" /></div></div>
                            <div><label className={labelClass}>Hemoroid</label><input className={inputClass} value={formData.hemorrhoids || ''} onChange={e => handleChange('hemorrhoids', e.target.value)} placeholder="(-) Tidak Ada" /></div>
                        </div>
                    </div>

                    {/* PARAKLINIS & PENUNJANG */}
                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Microscope className="text-primary" size={20}/> 5. Pemeriksaan Penunjang</h3>
                        <div className="space-y-6">
                            <div><label className={labelClass}>Hasil Rontgen Thorax</label><input className={inputClass} value={formData.rontgen || ''} onChange={e => handleChange('rontgen', e.target.value)} placeholder="Misal: Cor & Pulmo Normal" /></div>
                            <div><label className={labelClass}>Hasil EKG (Jantung)</label><input className={inputClass} value={formData.ekg || ''} onChange={e => handleChange('ekg', e.target.value)} placeholder="Misal: Sinus Rhythm" /></div>
                            <div><label className={labelClass}>Hasil Laboratorium</label><textarea rows={3} className={inputClass} value={formData.laboratory || ''} onChange={e => handleChange('laboratory', e.target.value)} placeholder="Hasil DL, Urin, Kimia Darah..." /></div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Calculator className="text-primary" size={20}/> 6. Kesimpulan Akhir</h3>
                        <textarea rows={4} className={inputClass} value={formData.mcuConclusion || ''} onChange={e => handleChange('mcuConclusion', e.target.value)} placeholder="Tuliskan hasil akhir kesehatan secara menyeluruh..." />
                    </div>
                </div>
            )}
        </div>

        {/* KOLOM KANAN: PARAMETER OPERASIONAL */}
        <div className="lg:col-span-4 space-y-6 no-print">
            <div className={cardClass}>
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap size={14} className="text-amber-500"/> Parameter Operasional
                </h4>
                <div className="space-y-5">
                    <div>
                        <label className={labelClass}>Kegiatan/Event</label>
                        <select required className={inputClass} value={formData.activityId || ''} onChange={e => handleChange('activityId', e.target.value)}>
                            <option value="">-- Pilih Event --</option>
                            {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Triage Level</label>
                        <div className="grid grid-cols-3 gap-2">
                           {(['Red', 'Yellow', 'Green'] as TriageLevel[]).map(t => (
                               <button key={t} type="button" onClick={() => handleChange('triage', t)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.triage === t ? (t === 'Red' ? 'bg-rose-500 text-white shadow-lg' : t === 'Yellow' ? 'bg-amber-400 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg') : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                           ))}
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Status Akhir</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['Selesai', 'Rujuk'] as ReferralStatus[]).map(s => (
                                <button key={s} type="button" onClick={() => handleChange('referralStatus', s)} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${formData.referralStatus === s ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${cardClass} bg-slate-900 border-slate-800 text-white shadow-2xl`}>
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <UserCheck size={14} className="text-primary"/> Audit Trail
                </h4>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Petugas Terakhir</p>
                        <p className="text-xs font-black text-white">{initialData?.lastModifiedBy || user?.name || 'Sistem'}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Update Terakhir</p>
                        <p className="text-xs font-black text-white">{initialData?.lastModifiedAt || new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-slate-950/90 backdrop-blur-xl p-5 rounded-[2.5rem] flex justify-between items-center z-50 shadow-2xl border border-white/10 no-print">
          <button type="button" onClick={onCancel} className="px-8 text-white/40 font-black uppercase text-[10px] tracking-widest hover:text-white transition">Batal</button>
          <button type="submit" className={`px-12 py-4 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-4 ${formData.isEmergency ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-primary text-white hover:bg-primary-light'}`}>
             <Save size={18}/> {initialData?.id ? 'PERBARUI DATA' : 'SIMPAN REGISTRASI'}
          </button>
      </div>
    </form>
  );
};
export default PatientForm;
