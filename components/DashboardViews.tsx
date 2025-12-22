
import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Activity, Officer, News, Patient, ICD10, CarouselItem } from '../types';
import { 
    Edit, Trash2, Plus, Printer, Eye, X, User, Flag, Search, ChevronLeft, Info, 
    Wind, HeartPulse, UserCheck, Clock, Microscope
} from 'lucide-react';
import PatientForm from './PatientForm';

const tableHeadClass = "p-5 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/50 whitespace-nowrap";
const tableCellClass = "p-5 text-sm text-slate-700 border-b border-slate-50 align-middle font-medium";
const tableRowClass = "hover:bg-slate-50 transition duration-150";

// MODAL RESUME MEDIS (FIXED PRINT)
const PatientDetailModal = ({ patient, onClose }: { patient: Patient, onClose: () => void }) => {
    const { activities } = useApp();
    const event = activities.find(a => a.id === patient.activityId);

    const handlePrint = () => {
        window.print();
    };

    const sectionTitle = "text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4 block";
    const dataRow = (label: string, value: any) => (
        <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
            <span className="text-[11px] font-black text-slate-800 text-right">{value || '-'}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 print:static print:bg-white print:p-0">
            <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-card print:static print:max-h-none print:max-w-none print:shadow-none print:rounded-none">
                {/* MODAL HEADER */}
                <div className="p-8 border-b flex justify-between items-center bg-slate-50/50 no-print">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${patient.isEmergency ? 'bg-rose-500 emergency-pulse' : 'bg-primary'}`}>
                            <User size={24}/>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 uppercase italic leading-none">{patient.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {patient.mrn} • {patient.category}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handlePrint} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-lg hover:bg-slate-800 transition-all"><Printer size={16}/> Cetak Resume</button>
                        <button onClick={onClose} className="p-3 text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
                    </div>
                </div>

                {/* PRINT AREA */}
                <div id="printable-resume" className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white print:p-0 print:overflow-visible">
                    <div className="text-center border-b-2 border-slate-900 pb-8 mb-8">
                        <h1 className="text-2xl font-black uppercase">RESUME MEDIS PASIEN</h1>
                        <p className="font-bold text-slate-600 uppercase tracking-widest">PROVINCE COMMAND CENTER (PCC) SUMATERA SELATAN</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* LEFT COLUMN */}
                        <div className="space-y-8">
                            <section>
                                <span className={sectionTitle}>Informasi Personal</span>
                                {dataRow("Nama Lengkap", patient.name)}
                                {dataRow("No. Identitas", patient.identityNo)}
                                {dataRow("Gender / Usia", `${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'} / ${patient.age} Thn`)}
                                {dataRow("Alamat", patient.address)}
                                {dataRow("Tanggal Kunjungan", patient.visitDate)}
                                {dataRow("Event / Lokasi", event?.name)}
                            </section>

                            <section>
                                <span className={sectionTitle}>Tanda-Tanda Vital</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border">
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Tekanan Darah</p>
                                        <p className="text-lg font-black text-slate-800">{patient.bloodPressure} <span className="text-[10px]">mmHg</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border">
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Nadi / Respirasi</p>
                                        <p className="text-lg font-black text-slate-800">{patient.pulse}/{patient.respiration} <span className="text-[10px]">bpm/rr</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border">
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Suhu Tubuh</p>
                                        <p className="text-lg font-black text-slate-800">{patient.temperature} <span className="text-[10px]">°C</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border">
                                        <p className="text-[8px] font-black text-slate-400 uppercase">BMI Status</p>
                                        <p className="text-lg font-black text-slate-800">{patient.bmiStatus || 'Normal'}</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-8">
                            {patient.category === 'Berobat' ? (
                                <section>
                                    <span className={sectionTitle}>Assessment Klinis (SOAP)</span>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                            <p className="text-[9px] font-black text-primary uppercase mb-1">Subjektif & Objektif</p>
                                            <p className="text-[11px] font-bold text-slate-700 italic">"{patient.subjective || 'Tidak ada anamnesa'}"</p>
                                            <p className="text-[11px] font-bold text-slate-700 mt-2">{patient.physicalExam}</p>
                                        </div>
                                        <div className="p-4 bg-slate-900 rounded-2xl text-white">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Diagnosis ICD-10</p>
                                            <p className="text-xs font-black uppercase">[{patient.diagnosisCode || 'NON-ICD'}] {patient.diagnosisName || '-'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Plan / Terapi</p>
                                            <p className="text-[11px] font-bold text-slate-700 whitespace-pre-line">{patient.therapy || '-'}</p>
                                        </div>
                                    </div>
                                </section>
                            ) : (
                                <section>
                                    <span className={sectionTitle}>Pemeriksaan MCU & Fisik</span>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                        {dataRow("Visus R/L", `${patient.visusOD}/${patient.visusOS}`)}
                                        {dataRow("Buta Warna", patient.colorBlind)}
                                        {dataRow("Hidung", patient.nose)}
                                        {dataRow("Gigi/Mulut", patient.teeth)}
                                        {dataRow("Tonsil", patient.tonsil)}
                                        {dataRow("Thorax", patient.thorax)}
                                        {dataRow("Abdomen", patient.abdomen)}
                                        {dataRow("Hernia", patient.hernia)}
                                    </div>
                                    
                                    <span className={`${sectionTitle} mt-6`}>Pemeriksaan Penunjang</span>
                                    <div className="space-y-2">
                                        {dataRow("Rontgen Thorax", patient.rontgen)}
                                        {dataRow("EKG", patient.ekg)}
                                        <div className="flex flex-col py-2 border-b border-slate-50">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Hasil Laboratorium</span>
                                            <span className="text-[11px] font-bold text-slate-800 leading-relaxed">{patient.laboratory || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">Kesimpulan Akhir MCU</p>
                                        <p className="text-xs font-black text-indigo-900 uppercase">{patient.mcuConclusion || 'BELUM ADA KESIMPULAN'}</p>
                                    </div>
                                </section>
                            )}

                            <section>
                                <span className={sectionTitle}>Status Akhir</span>
                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white ${patient.triage === 'Red' ? 'bg-rose-600' : patient.triage === 'Yellow' ? 'bg-amber-500' : 'bg-emerald-600'}`}>Triage: {patient.triage}</div>
                                    <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">Kondisi: {patient.referralStatus}</div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Tanda Tangan Cetak */}
                    <div className="hidden print:flex justify-between mt-20 px-4">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase mb-16">Pasien / Keluarga,</p>
                            <p className="text-xs font-black border-t border-slate-900 pt-1">( ____________________ )</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase mb-16">Petugas Medis PCC,</p>
                            <p className="text-xs font-black border-t border-slate-900 pt-1">{patient.lastModifiedBy || 'PCC Officer'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivitySearchSelector = ({ value, onChange, activities }: { value: string, onChange: (id: string) => void, activities: Activity[] }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const filtered = activities.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
    const selected = activities.find(a => a.id === value);

    return (
        <div className="relative flex-1 no-print">
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 px-4 bg-slate-50 border rounded-2xl cursor-pointer py-4 hover:border-primary/30 transition">
                <Flag size={18} className="text-slate-300"/>
                <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-600 truncate">
                    {selected ? selected.name : (query || 'Filter Berdasarkan Event...')}
                </span>
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border shadow-2xl rounded-[1.5rem] z-[100] p-3 animate-fade-in max-h-[350px] overflow-y-auto">
                    <input autoFocus placeholder="Ketik nama event..." className="w-full p-4 bg-slate-100 rounded-xl mb-3 text-xs font-black uppercase tracking-widest outline-none" value={query} onChange={e => setQuery(e.target.value)} />
                    <button onClick={() => { onChange('all'); setIsOpen(false); setQuery(''); }} className="w-full p-4 text-left hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors mb-1">Semua Kegiatan</button>
                    {filtered.map(a => (
                        <button key={a.id} onClick={() => { onChange(a.id); setIsOpen(false); setQuery(''); }} className="w-full p-4 text-left hover:bg-slate-50 rounded-xl text-[10px] font-bold uppercase text-slate-600 transition-colors">{a.name}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ManagePatients = ({ mode }: { mode: 'edit' | 'add' | 'record' }) => {
    const { patients, deletePatient, activities } = useApp();
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActivity, setFilterActivity] = useState<string>('all');

    if (mode === 'add' || editingPatient) {
        return <div className="animate-fade-in"><button onClick={() => setEditingPatient(null)} className="mb-8 flex items-center gap-3 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-colors hover:translate-x-1 no-print"><ChevronLeft size={16}/> Kembali ke Registry</button><PatientForm initialData={editingPatient || undefined} onSave={() => setEditingPatient(null)} onCancel={() => setEditingPatient(null)} /></div>;
    }

    const filtered = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActivity = filterActivity === 'all' || p.activityId === filterActivity;
        return matchesSearch && matchesActivity;
    });

    return (
        <div className="animate-fade-in space-y-8">
            {viewingPatient && <PatientDetailModal patient={viewingPatient} onClose={() => setViewingPatient(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
                <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">
                        {mode === 'record' ? 'DATABASE REKAM MEDIS' : 'REGISTRY PASIEN'}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Monitoring data pelayanan kesehatan terintegrasi.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-white border px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95"><Printer size={18}/> Cetak Laporan</button>
                    {mode === 'edit' && <button onClick={() => window.location.hash = '/dashboard/patients/add'} className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"><Plus size={18}/> Registrasi Baru</button>}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 bg-white p-5 rounded-[2.5rem] border shadow-sm items-center no-print">
                <div className="w-full lg:w-[400px] flex items-center gap-4 px-5 bg-slate-50 border rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Search size={18} className="text-slate-300"/>
                    <input placeholder="Cari Nama / RM..." className="flex-1 bg-transparent py-5 outline-none font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <ActivitySearchSelector value={filterActivity} onChange={setFilterActivity} activities={activities} />
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className={tableHeadClass}>Pasien & RM</th>
                            <th className={tableHeadClass}>{mode === 'record' ? 'Hasil / Diagnosa' : 'Identitas (NIK)'}</th>
                            <th className={tableHeadClass}>Event & Kategori</th>
                            <th className={tableHeadClass}>Triage & Status</th>
                            <th className={`${tableHeadClass} no-print`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} className={`${tableRowClass} ${p.isEmergency ? 'bg-rose-50/50' : ''}`}>
                                <td className={tableCellClass}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white ${p.isEmergency ? 'bg-rose-600 emergency-pulse' : 'bg-slate-900'}`}>{p.name.charAt(0)}</div>
                                        <div><p className="font-black uppercase tracking-tight text-slate-800">{p.name}</p><p className="text-[10px] font-mono text-slate-400 font-bold">{p.mrn}</p></div>
                                    </div>
                                </td>
                                <td className={tableCellClass}>
                                    {mode === 'record' ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded w-fit font-black">{p.diagnosisCode || 'NON-ICD'}</span>
                                            <p className="text-[10px] font-black text-slate-700 uppercase truncate max-w-[200px]">{p.diagnosisName || p.mcuConclusion || '-'}</p>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] font-mono font-black text-slate-500">{p.identityNo || 'EMERGENCY'}</p>
                                    )}
                                </td>
                                <td className={tableCellClass}>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${p.category === 'MCU' ? 'bg-indigo-500' : 'bg-primary'}`}>{p.category}</span>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1 truncate max-w-[150px]">{activities.find(a => a.id === p.activityId)?.name}</p>
                                </td>
                                <td className={tableCellClass}>
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded w-fit uppercase ${p.triage === 'Red' ? 'bg-rose-500 text-white' : p.triage === 'Yellow' ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'}`}>{p.triage}</span>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">RR: {p.respiration || '-'} bpm</p>
                                    </div>
                                </td>
                                <td className={`${tableCellClass} no-print`}>
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewingPatient(p)} className="p-3 text-slate-400 hover:text-primary transition-all bg-slate-100 rounded-xl" title="Lihat Detail & Cetak"><Eye size={16}/></button>
                                        <button onClick={() => setEditingPatient(p)} className="p-3 text-slate-400 hover:text-amber-600 transition-all bg-slate-100 rounded-xl"><Edit size={16}/></button>
                                        <button onClick={() => { if(window.confirm('Hapus data pasien ini?')) deletePatient(p.id) }} className="p-3 text-slate-400 hover:text-rose-600 transition-all bg-slate-100 rounded-xl"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-20 text-center bg-slate-50">
                        <Info className="mx-auto text-slate-300 mb-4" size={40}/>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada data ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ManageActivities = () => {
    const { activities, addActivity, deleteActivity } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Master Kegiatan</h2>
                <button 
                    onClick={() => {
                        const name = prompt("Nama Kegiatan Baru:");
                        const location = prompt("Lokasi Kegiatan:");
                        if (name && location) {
                            addActivity({
                                id: crypto.randomUUID(),
                                name,
                                startDate: new Date().toISOString().split('T')[0],
                                endDate: new Date().toISOString().split('T')[0],
                                host: 'PCC Sumsel',
                                location,
                                status: 'To Do'
                            });
                        }
                    }}
                    className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl shadow-primary/20"
                >
                    <Plus size={18}/> Tambah Kegiatan
                </button>
            </div>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className={tableHeadClass}>Kegiatan</th>
                            <th className={tableHeadClass}>Host</th>
                            <th className={tableHeadClass}>Lokasi</th>
                            <th className={tableHeadClass}>Status</th>
                            <th className={`${tableHeadClass} no-print`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map(a => (
                            <tr key={a.id} className={tableRowClass}>
                                <td className={tableCellClass}><p className="font-black uppercase">{a.name}</p><p className="text-[10px] text-slate-400 font-bold">{a.startDate}</p></td>
                                <td className={tableCellClass}>{a.host}</td>
                                <td className={tableCellClass}>{a.location}</td>
                                <td className={tableCellClass}><span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase">{a.status}</span></td>
                                <td className={`${tableCellClass} no-print`}>
                                    <button onClick={() => { if(window.confirm('Hapus kegiatan ini?')) deleteActivity(a.id) }} className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageOfficers = () => {
    const { officers, deleteOfficer } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Manajemen Petugas</h2>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className={tableHeadClass}>Nama Petugas</th>
                            <th className={tableHeadClass}>Email / Akun</th>
                            <th className={tableHeadClass}>Role</th>
                            <th className={tableHeadClass}>Team ID</th>
                            <th className={`${tableHeadClass} no-print`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {officers.map(o => (
                            <tr key={o.id} className={tableRowClass}>
                                <td className={tableCellClass}><p className="font-black uppercase">{o.name}</p></td>
                                <td className={tableCellClass}>{o.email}</td>
                                <td className={tableCellClass}><span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${o.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>{o.role}</span></td>
                                <td className={tableCellClass}><span className="font-mono">{o.teamId}</span></td>
                                <td className={`${tableCellClass} no-print`}>
                                    <button onClick={() => { if(window.confirm('Hapus petugas ini?')) deleteOfficer(o.id) }} className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageNews = () => {
    const { news, deleteNews } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Manajemen Konten Berita</h2>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className={tableHeadClass}>Judul Berita</th>
                            <th className={tableHeadClass}>Tanggal</th>
                            <th className={`${tableHeadClass} no-print`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map(n => (
                            <tr key={n.id} className={tableRowClass}>
                                <td className={tableCellClass}><p className="font-black uppercase line-clamp-1">{n.title}</p></td>
                                <td className={tableCellClass}>{n.date}</td>
                                <td className={`${tableCellClass} no-print`}>
                                    <button onClick={() => { if(window.confirm('Hapus berita ini?')) deleteNews(n.id) }} className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageICD10 = () => {
    const { icd10List, deleteICD10 } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Library ICD-10</h2>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className={tableHeadClass}>Kode</th>
                            <th className={tableHeadClass}>Nama Diagnosa</th>
                            <th className={`${tableHeadClass} no-print`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {icd10List.map(i => (
                            <tr key={i.code} className={tableRowClass}>
                                <td className={tableCellClass}><span className="font-black bg-slate-900 text-white px-2 py-0.5 rounded text-xs">{i.code}</span></td>
                                <td className={tableCellClass}><p className="font-bold text-slate-600">{i.name}</p></td>
                                <td className={`${tableCellClass} no-print`}>
                                    <button onClick={() => { if(window.confirm('Hapus kode ini?')) deleteICD10(i.code) }} className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageCarousel = () => {
    const { carouselItems, deleteCarousel } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Konfigurasi Carousel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {carouselItems.map(c => (
                    <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col gap-4 group hover:border-primary/20 transition-all">
                        <div className="relative h-44 w-full overflow-hidden rounded-3xl">
                            <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                                <p className="font-black text-white text-xs uppercase italic tracking-tighter">{c.title}</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-2">{c.subtitle}</p>
                        <button onClick={() => { if(window.confirm('Hapus slide ini?')) deleteCarousel(c.id) }} className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all no-print">Hapus Slide</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
