
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Patient, TriageLevel, PatientCategory, ReferralStatus } from '../types';
import { 
  User, Stethoscope, HeartPulse, Save, AlertTriangle, Eye, ClipboardCheck,
  ShieldAlert, Microscope, ChevronLeft, Calendar, Calculator, FileText,
  Zap, Crosshair, Activity, ArrowUpRight, ZapOff, Siren, Ear, Footprints,
  Baby, Syringe, ClipboardList, Info, CheckCircle2, History, UserCheck
} from 'lucide-react';

interface Props {
  initialData?: Patient;
  onSave: () => void;
  onCancel: () => void;
}

const PatientForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
  const { activities, user, addPatient, icd10List } = useApp();
  const [activeTab, setActiveTab] = useState<'basic' | 'medis' | 'mcu'>('basic');

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

  // Enforcement: Only allow relevant tabs
  useEffect(() => {
    if (formData.category === 'Berobat' && activeTab === 'mcu') setActiveTab('medis');
    if (formData.category === 'MCU' && activeTab === 'medis') setActiveTab('mcu');
  }, [formData.category]);

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

  const handleChange = (field: keyof Patient, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  // FEATURE: Quick Fill Normal for MCU
  const setMcuNormal = () => {
    if (window.confirm("Isi semua hasil pemeriksaan fisik dengan status 'Normal'?")) {
      setFormData(prev => ({
        ...prev,
        visusOD: '6/6',
        visusOS: '6/6',
        colorBlind: 'Negatif',
        rightEar: 'Normal',
        leftEar: 'Normal',
        nose: 'Normal',
        teeth: 'Karies (-)',
        tonsil: 'T1-T1 Tenang',
        thorax: 'Cor/Pulmo Normal',
        abdomen: 'Supel, BU (+) Normal',
        hernia: 'Tidak Ditemukan',
        hemorrhoids: 'Tidak Ditemukan',
        varicose: 'Tidak Ditemukan',
        reflexPupil: '(+) Isokor',
        reflexPatella: '(+) Normal',
        reflexAchilles: '(+) Normal',
        mcuConclusion: 'SEHAT / FIT FOR WORK'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activityId) return alert("Pilih Event/Kegiatan.");
    
    const finalName = formData.isEmergency && !formData.name ? `PASIEN DARURAT (${formData.mrn})` : formData.name;
    const finalNIK = formData.isEmergency && !formData.identityNo ? 'BYPASS-EMERGENCY' : formData.identityNo;

    if (!formData.isEmergency && (!finalName || !finalNIK)) {
        return alert("Nama dan NIK wajib diisi.");
    }

    addPatient({ 
        ...formData, 
        name: finalName,
        identityNo: finalNIK,
        id: formData.id || crypto.randomUUID(), 
        lastModifiedBy: user?.name || 'Sistem', 
        lastModifiedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    } as Patient);
    onSave();
  };

  const cardClass = "bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all";
  const labelClass = "text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block";
  const inputClass = "w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-32 animate-card">
      {/* Header Form */}
      <div className={`bg-white p-8 rounded-[2.5rem] border flex justify-between items-center shadow-lg transition-all ${formData.isEmergency ? 'border-rose-500 ring-8 ring-rose-500/10 shadow-rose-200' : ''}`}>
          <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${formData.isEmergency ? 'bg-rose-500 text-white animate-pulse' : 'bg-primary text-white'}`}>
                  {formData.isEmergency ? <Siren size={32} /> : (formData.category === 'MCU' ? <Microscope size={32} /> : <ClipboardList size={32} />)}
              </div>
              <div>
                  <div className="flex items-center gap-3">
                    <h2 className={`text-2xl font-black uppercase tracking-tighter italic ${formData.isEmergency ? 'text-rose-600' : 'text-slate-800'}`}>
                        {formData.isEmergency ? 'ENTRY DARURAT' : (formData.category === 'MCU' ? 'PEMERIKSAAN MCU' : 'PENDAFTARAN BEROBAT')}
                    </h2>
                    {formData.isEmergency && <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Emergency</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs font-mono text-slate-400 font-bold tracking-widest uppercase">ID: {formData.mrn}</p>
                      {initialData?.lastModifiedBy && (
                          <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                              <History size={12}/> Update Terakhir: {initialData.lastModifiedBy} ({initialData.lastModifiedAt})
                          </div>
                      )}
                  </div>
              </div>
          </div>
          
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
             {(['Berobat', 'MCU'] as PatientCategory[]).map(cat => (
                 <button 
                    key={cat} 
                    type="button" 
                    onClick={() => handleChange('category', cat)} 
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.category === cat ? 'bg-white text-primary shadow-md' : 'text-slate-400'}`}
                 >
                    {cat}
                 </button>
             ))}
          </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1.5 bg-slate-200/50 rounded-[2rem] w-fit mx-auto border shadow-inner">
          <button type="button" onClick={() => setActiveTab('basic')} className={`px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'basic' ? 'bg-white text-primary shadow-md' : 'text-slate-500'}`}>1. Identitas & Vitals</button>
          {formData.category === 'Berobat' ? (
              <button type="button" onClick={() => setActiveTab('medis')} className={`px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'medis' ? 'bg-white text-primary shadow-md' : 'text-slate-500'}`}>2. Data Klinis (SOAP)</button>
          ) : (
              <button type="button" onClick={() => setActiveTab('mcu')} className={`px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'mcu' ? 'bg-white text-primary shadow-md' : 'text-slate-500'}`}>2. Pemeriksaan Fisik (MCU)</button>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
            {/* Tab: Identitas */}
            {activeTab === 'basic' && (
                <div className="space-y-8 animate-fade-in">
                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><User className="text-primary" size={20}/> Informasi Personal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>No. Identitas (NIK) {!formData.isEmergency && <span className="text-rose-500">*</span>}</label>
                                <input className={inputClass} value={formData.identityNo || ''} onChange={e => handleChange('identityNo', e.target.value)} placeholder={formData.isEmergency ? "Opsional (Mode Emergency)" : "16 Digit NIK..."} />
                            </div>
                            <div>
                                <label className={labelClass}>Nama Lengkap {!formData.isEmergency && <span className="text-rose-500">*</span>}</label>
                                <input className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder={formData.isEmergency ? "Boleh Kosong..." : "Nama Lengkap..."} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Gender</label><select className={inputClass} value={formData.gender} onChange={e => handleChange('gender', e.target.value)}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                                <div><label className={labelClass}>Usia (Thn)</label><input type="number" className={inputClass} value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value))} /></div>
                            </div>
                        </div>
                    </div>
                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><HeartPulse className="text-rose-500" size={20}/> Tanda Vital Dasar</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div><label className={labelClass}>TD (mmHg)</label><input className={inputClass} value={formData.bloodPressure || ''} onChange={e => handleChange('bloodPressure', e.target.value)} placeholder="120/80" /></div>
                            <div><label className={labelClass}>Nadi (bpm)</label><input type="number" className={inputClass} value={formData.pulse || ''} onChange={e => handleChange('pulse', parseInt(e.target.value))} /></div>
                            <div><label className={labelClass}>Suhu (°C)</label><input type="number" step="0.1" className={inputClass} value={formData.temperature || ''} onChange={e => handleChange('temperature', parseFloat(e.target.value))} /></div>
                            <div><label className={labelClass}>Napas (x/m)</label><input type="number" className={inputClass} value={formData.respiration || ''} onChange={e => handleChange('respiration', parseInt(e.target.value))} /></div>
                            <div><label className={labelClass}>Tinggi (cm)</label><input type="number" className={inputClass} value={formData.height || ''} onChange={e => handleChange('height', parseFloat(e.target.value))} /></div>
                            <div><label className={labelClass}>Berat (kg)</label><input type="number" className={inputClass} value={formData.weight || ''} onChange={e => handleChange('weight', parseFloat(e.target.value))} /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Medis (Berobat Only) */}
            {activeTab === 'medis' && formData.category === 'Berobat' && (
                <div className={`${cardClass} animate-fade-in`}>
                    <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Stethoscope className="text-primary" size={20}/> Assessment Klinis (SOAP)</h3>
                    <div className="space-y-6">
                        <div><label className={labelClass}>Subjektif (Keluhan)</label><textarea rows={3} className={inputClass} value={formData.subjective || ''} onChange={e => handleChange('subjective', e.target.value)} placeholder="Keluhan utama..." /></div>
                        <div><label className={labelClass}>Objektif (Pemeriksaan Fisik)</label><textarea rows={3} className={inputClass} value={formData.physicalExam || ''} onChange={e => handleChange('physicalExam', e.target.value)} placeholder="Hasil observasi fisik..." /></div>
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
                        <div><label className={labelClass}>Plan (Therapy & Edukasi)</label><textarea rows={3} className={inputClass} value={formData.therapy || ''} onChange={e => handleChange('therapy', e.target.value)} placeholder="Tindakan medis..." /></div>
                    </div>
                </div>
            )}

            {/* Tab: MCU (MCU Only) */}
            {activeTab === 'mcu' && formData.category === 'MCU' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-center bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                        <div>
                            <h4 className="font-black text-primary text-sm uppercase italic tracking-tight">Quick Fill MCU</h4>
                            <p className="text-[10px] text-primary/60 font-bold uppercase">Mempercepat pengisian data fisik normal</p>
                        </div>
                        <button type="button" onClick={setMcuNormal} className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3">
                           <CheckCircle2 size={16}/> Set Normal Semua
                        </button>
                    </div>

                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Eye className="text-primary" size={20}/> Mata & Indera</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className={labelClass}>Visus OD (Kanan)</label><input className={inputClass} value={formData.visusOD || ''} onChange={e => handleChange('visusOD', e.target.value)} placeholder="6/6" /></div>
                            <div><label className={labelClass}>Visus OS (Kiri)</label><input className={inputClass} value={formData.visusOS || ''} onChange={e => handleChange('visusOS', e.target.value)} placeholder="6/6" /></div>
                            <div><label className={labelClass}>Buta Warna</label><input className={inputClass} value={formData.colorBlind || ''} onChange={e => handleChange('colorBlind', e.target.value)} placeholder="Negatif" /></div>
                        </div>
                    </div>
                    
                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Ear className="text-primary" size={20}/> THT, Gigi & Mulut</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Telinga (Kanan/Kiri)</label><input className={inputClass} value={formData.rightEar || ''} onChange={e => handleChange('rightEar', e.target.value)} placeholder="Normal" /></div>
                            <div><label className={labelClass}>Hidung & Sinus</label><input className={inputClass} value={formData.nose || ''} onChange={e => handleChange('nose', e.target.value)} placeholder="Normal" /></div>
                            <div><label className={labelClass}>Gigi & Mulut</label><input className={inputClass} value={formData.teeth || ''} onChange={e => handleChange('teeth', e.target.value)} placeholder="Karies (-)" /></div>
                            <div><label className={labelClass}>Tenggorokan & Tonsil</label><input className={inputClass} value={formData.tonsil || ''} onChange={e => handleChange('tonsil', e.target.value)} placeholder="Tenang" /></div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <h3 className="font-black text-slate-800 text-lg uppercase flex items-center gap-3 mb-8 italic tracking-tighter"><Activity className="text-rose-500" size={20}/> Sistem Thorax & Saraf</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><label className={labelClass}>Thorax (Cor & Pulmo)</label><textarea rows={2} className={inputClass} value={formData.thorax || ''} onChange={e => handleChange('thorax', e.target.value)} placeholder="Normal" /></div>
                            <div><label className={labelClass}>Refleks Pupil</label><input className={inputClass} value={formData.reflexPupil || ''} onChange={e => handleChange('reflexPupil', e.target.value)} placeholder="(+) Normal" /></div>
                            <div><label className={labelClass}>Refleks Patella</label><input className={inputClass} value={formData.reflexPatella || ''} onChange={e => handleChange('reflexPatella', e.target.value)} placeholder="(+) Normal" /></div>
                        </div>
                        <div className="mt-8">
                            <label className={labelClass}>Kesimpulan & Rekomendasi Akhir MCU</label>
                            <textarea rows={4} className={inputClass} value={formData.mcuConclusion || ''} onChange={e => handleChange('mcuConclusion', e.target.value)} placeholder="Misal: FIT FOR WORK / SEHAT..." />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <div className={`${cardClass} bg-slate-900 border-slate-800 text-white shadow-2xl`}>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-white/10 rounded-2xl text-primary"><UserCheck size={20}/></div>
                   <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-tight">Informasi Audit</p>
                       <h4 className="font-black uppercase text-sm tracking-tighter italic">Jejak Pembaruan</h4>
                   </div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Editor Terakhir</p>
                        <p className="text-sm font-black text-white">{initialData?.lastModifiedBy || user?.name || 'Petugas Aktif'}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Waktu Modifikasi</p>
                        <p className="text-sm font-black text-white">{initialData?.lastModifiedAt || new Date().toLocaleString()}</p>
                    </div>
                    {initialData && (
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                            <ShieldAlert size={16} />
                            <p className="text-[9px] font-black uppercase leading-tight">Data ini merupakan salinan permanen dari database pusat.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={`${cardClass} bg-rose-50/40 border-rose-100`}>
                <label className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-4 block flex items-center gap-2"><Siren size={14}/> GAWAT DARURAT (EMERGENCY)</label>
                <div className="bg-white p-5 rounded-3xl border border-rose-200 flex items-center justify-between shadow-sm">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Mode Quick Entry?</span>
                    <button type="button" onClick={() => handleChange('isEmergency', !formData.isEmergency)} className={`w-16 h-8 rounded-full transition-all relative ${formData.isEmergency ? 'bg-rose-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isEmergency ? 'left-9' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <div className={cardClass}>
                <label className={labelClass}>Operasional</label>
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Pilih Event/Kegiatan</label>
                        <select required className={inputClass} value={formData.activityId || ''} onChange={e => handleChange('activityId', e.target.value)}>
                            <option value="">-- Pilih Kegiatan --</option>
                            {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Triage Level</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                           {(['Red', 'Yellow', 'Green'] as TriageLevel[]).map(t => (
                               <button key={t} type="button" onClick={() => handleChange('triage', t)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.triage === t ? (t === 'Red' ? 'bg-rose-500 text-white shadow-lg' : t === 'Yellow' ? 'bg-amber-400 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg') : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                           ))}
                        </div>
                    </div>
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Status Akhir</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {(['Selesai', 'Rujuk'] as ReferralStatus[]).map(s => (
                                <button key={s} type="button" onClick={() => handleChange('referralStatus', s)} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${formData.referralStatus === s ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl bg-slate-900/95 backdrop-blur-xl p-6 rounded-[3rem] flex justify-between items-center z-50 shadow-2xl border border-white/10">
          <button type="button" onClick={onCancel} className="px-10 text-white/40 font-black uppercase text-[11px] tracking-widest hover:text-white transition">Batal</button>
          <button type="submit" className={`px-16 py-4 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-xl transition-all active:scale-95 flex items-center gap-4 ${formData.isEmergency ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/40' : 'bg-primary text-white hover:bg-primary-light shadow-primary/40'}`}>
             <Save size={20}/> SIMPAN REKAMAN
          </button>
      </div>
    </form>
  );
};
export default PatientForm;
