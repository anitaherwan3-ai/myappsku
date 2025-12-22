
import React, { useState, useRef } from 'react';
import { useApp } from '../context';
import { Activity, Officer, News, Patient, ICD10, CarouselItem } from '../types';
import { 
    Edit, Trash2, Plus, Printer, Eye, X, User, Flag, Search, ChevronLeft, Info, 
    Wind, HeartPulse, UserCheck, Microscope, FileSpreadsheet, MapPin
} from 'lucide-react';
import PatientForm from './PatientForm';
import * as XLSX from 'xlsx';

const tableHeadClass = "p-5 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/50 whitespace-nowrap";
const tableCellClass = "p-5 text-sm text-slate-700 border-b border-slate-50 align-middle font-medium";
const tableRowClass = "hover:bg-slate-50 transition duration-150";

// --- KOMPONEN PRINT RESUME ---
export const PatientResumeContent = ({ patient }: { patient: Patient }) => {
    const { activities } = useApp();
    const event = activities.find(a => a.id === patient.activityId);
    const sectionTitle = "text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4 block";
    const dataRow = (label: string, value: any) => (
        <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
            <span className="text-[11px] font-black text-slate-800 text-right">{value || '-'}</span>
        </div>
    );

    return (
        <div className="bg-white p-4">
            <div className="print-header-letterhead">
                <h1>RESUME MEDIS PASIEN</h1>
                <h2>PROVINCE COMMAND CENTER (PCC) SUMATERA SELATAN</h2>
                <p>Sistem Informasi Manajemen War Room Kesehatan • Dinas Kesehatan Provinsi Sumatera Selatan</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <section>
                        <span className={sectionTitle}>Informasi Personal</span>
                        {dataRow("Nama Lengkap", patient.name)}
                        {dataRow("No. Identitas (NIK)", patient.identityNo)}
                        {dataRow("Gender / Usia", `${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'} / ${patient.age} Thn`)}
                        <div className="flex flex-col py-2 border-b border-slate-50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Alamat Lengkap</span>
                            <span className="text-[11px] font-black text-slate-800 leading-relaxed uppercase">{patient.address || '-'}</span>
                        </div>
                        {dataRow("Tanggal Kunjungan", patient.visitDate)}
                        {dataRow("Kegiatan / Event", event?.name)}
                    </section>
                    <section>
                        <span className={sectionTitle}>Tanda-Tanda Vital</span>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Tekanan Darah</p>
                                <p className="text-lg font-black text-slate-800">{patient.bloodPressure} <span className="text-[10px]">mmHg</span></p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Nadi / Respirasi</p>
                                <p className="text-lg font-black text-slate-800">{patient.pulse}/{patient.respiration} <span className="text-[10px]">bpm/rr</span></p>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="space-y-8">
                    {patient.category === 'Berobat' ? (
                        <section>
                            <span className={sectionTitle}>Assessment Klinis (SOAP)</span>
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <p className="text-[9px] font-black text-primary uppercase mb-1">Diagnosa Utama</p>
                                    <p className="text-xs font-black uppercase">[{patient.diagnosisCode || 'NON-ICD'}] {patient.diagnosisName || '-'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Terapi / Instruksi</p>
                                    <p className="text-[11px] font-bold text-slate-700 whitespace-pre-line">{patient.therapy || '-'}</p>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section>
                            <span className={sectionTitle}>Pemeriksaan MCU</span>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                {dataRow("Visus R/L", `${patient.visusOD}/${patient.visusOS}`)}
                                {dataRow("Buta Warna", patient.colorBlind)}
                            </div>
                            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">Kesimpulan Akhir MCU</p>
                                <p className="text-xs font-black text-indigo-900 uppercase italic">{patient.mcuConclusion || 'BELUM ADA KESIMPULAN'}</p>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MANAJEMEN PASIEN & REGISTRY ---
export const ManagePatients = ({ mode }: { mode: 'edit' | 'add' | 'record' }) => {
    const { patients, deletePatient, activities } = useApp();
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActivity, setFilterActivity] = useState<string>('all');

    if (mode === 'add' || editingPatient) {
        return <PatientForm initialData={editingPatient || undefined} onSave={() => setEditingPatient(null)} onCancel={() => setEditingPatient(null)} />;
    }

    const filtered = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActivity = filterActivity === 'all' || p.activityId === filterActivity;
        return matchesSearch && matchesActivity;
    });

    return (
        <div className="animate-fade-in space-y-8">
            {viewingPatient && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 print:p-0 print:static print:bg-white">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:rounded-none print:static">
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50 no-print">
                            <h3 className="font-black text-slate-800 uppercase italic">Detail Resume: {viewingPatient.name}</h3>
                            <div className="flex gap-4">
                                <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Printer size={16}/> Cetak</button>
                                <button onClick={() => setViewingPatient(null)} className="p-3 text-slate-400 hover:text-rose-500"><X size={24}/></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 print:p-0 print:overflow-visible">
                            <PatientResumeContent patient={viewingPatient} />
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden print:block">
                <div className="print-header-letterhead">
                    <h1>LAPORAN {mode === 'record' ? 'REKAM MEDIS' : 'REGISTRY'} PASIEN</h1>
                    <h2>PROVINCE COMMAND CENTER (PCC) SUMATERA SELATAN</h2>
                </div>
                {mode === 'record' ? (
                    filtered.map(p => <div key={p.id} className="bulk-resume-item"><PatientResumeContent patient={p} /></div>)
                ) : (
                    <table className="print-summary-table">
                        <thead>
                            <tr><th>No</th><th>Nama</th><th>NIK</th><th>Kegiatan</th><th>Diagnosa / Kesimpulan</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => (
                                <tr key={p.id}>
                                    <td>{i+1}</td><td>{p.name}</td><td>{p.identityNo}</td>
                                    <td>{activities.find(a => a.id === p.activityId)?.name}</td>
                                    <td>{p.category === 'Berobat' ? p.diagnosisName : p.mcuConclusion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 no-print">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{mode === 'record' ? 'REKAM MEDIS' : 'REGISTRY PASIEN'}</h2>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-white border px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-sm"><Printer size={18}/> Cetak Laporan</button>
                    {mode === 'edit' && <button onClick={() => window.location.hash = '/dashboard/patients/add'} className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl"><Plus size={18}/> Registrasi Baru</button>}
                </div>
            </div>

            <div className="bg-white p-5 rounded-[2.5rem] border shadow-sm flex flex-col lg:flex-row gap-4 no-print">
                <div className="w-full lg:w-[400px] flex items-center gap-4 px-5 bg-slate-50 border rounded-2xl">
                    <Search size={18} className="text-slate-300"/><input placeholder="Cari Nama / RM..." className="flex-1 bg-transparent py-5 outline-none font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden no-print dashboard-table-container">
                <table className="w-full text-left">
                    <thead>
                        <tr><th className={tableHeadClass}>Pasien</th><th className={tableHeadClass}>Identitas</th><th className={tableHeadClass}>Kategori</th><th className={tableHeadClass}>Triage</th><th className={tableHeadClass}>Aksi</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} className={tableRowClass}>
                                <td className={tableCellClass}><p className="font-black uppercase">{p.name}</p><p className="text-[10px] text-slate-400">{p.mrn}</p></td>
                                <td className={tableCellClass}>{p.identityNo}</td>
                                <td className={tableCellClass}><span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-white bg-primary">{p.category}</span></td>
                                <td className={tableCellClass}><span className="text-[9px] font-black">{p.triage}</span></td>
                                <td className={tableCellClass}>
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewingPatient(p)} className="p-3 bg-slate-100 rounded-xl"><Eye size={16}/></button>
                                        <button onClick={() => setEditingPatient(p)} className="p-3 bg-slate-100 rounded-xl"><Edit size={16}/></button>
                                        <button onClick={() => { if(window.confirm('Hapus data?')) deletePatient(p.id) }} className="p-3 bg-slate-100 rounded-xl"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MASTER DATA COMPONENTS ---
export const ManageActivities = () => {
    const { activities, addActivity, deleteActivity } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Master Kegiatan</h2>
                <button onClick={() => {
                    const name = prompt("Nama Kegiatan:");
                    if (name) addActivity({ id: crypto.randomUUID(), name, startDate: new Date().toISOString().split('T')[0], endDate: '', host: 'PCC', location: 'Sumsel', status: 'To Do' });
                }} className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Plus size={18}/> Tambah Kegiatan</button>
            </div>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Nama Kegiatan</th><th className={tableHeadClass}>Lokasi</th><th className={tableHeadClass}>Status</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {activities.map(a => (
                            <tr key={a.id} className={tableRowClass}>
                                <td className={tableCellClass}><p className="font-black uppercase">{a.name}</p></td>
                                <td className={tableCellClass}>{a.location}</td>
                                <td className={tableCellClass}>{a.status}</td>
                                <td className={tableCellClass}><button onClick={() => deleteActivity(a.id)} className="p-3 text-rose-500"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageOfficers = () => {
    const { officers, addOfficer, deleteOfficer } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Manajemen Petugas</h2>
                <button onClick={() => {
                    const name = prompt("Nama Petugas:");
                    const email = prompt("Email:");
                    if (name && email) addOfficer({ id: crypto.randomUUID(), name, email, teamId: 'PCC-OFF', role: 'petugas' });
                }} className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Plus size={18}/> Tambah Petugas</button>
            </div>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Nama</th><th className={tableHeadClass}>Email</th><th className={tableHeadClass}>Role</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {officers.map(o => (
                            <tr key={o.id} className={tableRowClass}>
                                <td className={tableCellClass}><p className="font-black uppercase">{o.name}</p></td>
                                <td className={tableCellClass}>{o.email}</td>
                                <td className={tableCellClass}>{o.role}</td>
                                <td className={tableCellClass}><button onClick={() => deleteOfficer(o.id)} className="p-3 text-rose-500"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageNews = () => {
    const { news, addNews, deleteNews } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Manajemen Berita</h2>
                <button onClick={() => {
                    const title = prompt("Judul Berita:");
                    if (title) addNews({ id: crypto.randomUUID(), title, date: new Date().toLocaleDateString(), imageUrl: 'https://via.placeholder.com/800x400', content: 'Konten...' });
                }} className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Plus size={18}/> Tambah Berita</button>
            </div>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Judul</th><th className={tableHeadClass}>Tanggal</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {news.map(n => (
                            <tr key={n.id} className={tableRowClass}>
                                <td className={tableCellClass}>{n.title}</td>
                                <td className={tableCellClass}>{n.date}</td>
                                <td className={tableCellClass}><button onClick={() => deleteNews(n.id)} className="p-3 text-rose-500"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageICD10 = () => {
    const { icd10List, addICD10, deleteICD10 } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json<any>(ws);
            const formatted = data.map(i => ({ code: i.code || i.KODE, name: i.name || i.NAMA })).filter(i => i.code && i.name);
            if (formatted.length) addICD10(formatted);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Library ICD-10</h2>
                <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept=".xlsx,.xls,.csv" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 border"><FileSpreadsheet size={18}/> Impor Excel</button>
                    <button onClick={() => {
                        const code = prompt("Kode:");
                        const name = prompt("Diagnosa:");
                        if (code && name) addICD10([{ code, name }]);
                    }} className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Plus size={18}/> Tambah Manual</button>
                </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Kode</th><th className={tableHeadClass}>Nama Diagnosa</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {icd10List.map(i => (
                            <tr key={i.code} className={tableRowClass}>
                                <td className={tableCellClass}><span className="font-black bg-slate-900 text-white px-2 py-0.5 rounded text-xs">{i.code}</span></td>
                                <td className={tableCellClass}>{i.name}</td>
                                <td className={tableCellClass}><button onClick={() => deleteICD10(i.code)} className="p-3 text-rose-500"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageCarousel = () => {
    const { carouselItems, addCarousel, deleteCarousel } = useApp();
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Konfigurasi Carousel</h2>
                <button onClick={() => {
                    const title = prompt("Judul:");
                    if (title) addCarousel({ id: crypto.randomUUID(), title, subtitle: '...', imageUrl: 'https://via.placeholder.com/1200x600' });
                }} className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Plus size={18}/> Tambah Slide</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {carouselItems.map(c => (
                    <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col gap-4">
                        <div className="h-44 w-full bg-slate-100 rounded-3xl overflow-hidden"><img src={c.imageUrl} className="w-full h-full object-cover" alt="" /></div>
                        <h4 className="font-black text-xs uppercase">{c.title}</h4>
                        <button onClick={() => deleteCarousel(c.id)} className="w-full py-3 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase">Hapus Slide</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
