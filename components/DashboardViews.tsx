
import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context';
import { Activity, Officer, News, Patient, ICD10, CarouselItem } from '../types';
import { 
    Edit, Trash2, Plus, Printer, Eye, Upload, Image as ImageIcon, Save, X, FileText, 
    Calendar, User, Users, Database, ChevronLeft, Search, Filter, AlertTriangle, Layers,
    Activity as ActivityIcon, Monitor, Flag, Camera, ShieldAlert, Download, FileJson,
    Trash, CheckCircle, Smartphone, Siren, ArrowUpRight, ClipboardList, Stethoscope, Clock, History, UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import PatientForm from './PatientForm';

const tableHeadClass = "p-5 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/50 whitespace-nowrap";
const tableCellClass = "p-5 text-sm text-slate-700 border-b border-slate-50 align-middle font-medium";
const tableRowClass = "hover:bg-slate-50 transition duration-150";

const ActivitySearchSelector = ({ value, onChange, activities }: { value: string, onChange: (id: string) => void, activities: Activity[] }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const filtered = activities.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
    const selected = activities.find(a => a.id === value);

    return (
        <div className="relative flex-1">
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterYear, setFilterYear] = useState<string>('all');
    const [filterActivity, setFilterActivity] = useState<string>('all');
    const [pageSize, setPageSize] = useState<number>(20);

    const availableYears = useMemo(() => {
        const years = new Set(patients.map(p => new Date(p.visitDate).getFullYear().toString()));
        return Array.from(years).sort().reverse();
    }, [patients]);

    if (mode === 'add' || editingPatient) {
        return <div className="animate-fade-in"><button onClick={() => setEditingPatient(null)} className="mb-8 flex items-center gap-3 text-slate-400 hover:text-slate-900 font-black uppercase text-[11px] tracking-[0.2em] transition-all"><ChevronLeft size={16}/> Kembali ke Dashboard</button><PatientForm initialData={editingPatient || undefined} onSave={() => setEditingPatient(null)} onCancel={() => setEditingPatient(null)} /></div>;
    }

    const filtered = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) || p.identityNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
        const matchesYear = filterYear === 'all' || new Date(p.visitDate).getFullYear().toString() === filterYear;
        const matchesActivity = filterActivity === 'all' || p.activityId === filterActivity;
        return matchesSearch && matchesCategory && matchesYear && matchesActivity;
    }).slice(0, pageSize);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">
                        {mode === 'record' ? 'DATABASE REKAM MEDIS' : 'REGISTRY PASIEN PUSAT'}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">
                        {mode === 'record' ? 'Hasil pemeriksaan klinis (SOAP) dan fisik (MCU) terintegrasi.' : 'Pendaftaran, identitas, dan manajemen audit petugas medis.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-white border px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-sm hover:shadow-md transition active:scale-95"><Printer size={18}/> Cetak Laporan</button>
                    {mode === 'edit' && <button onClick={() => window.location.hash = '/dashboard/patients/add'} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition"><Plus size={18}/> Registrasi Baru</button>}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border shadow-sm items-center">
                <div className="w-full lg:w-[350px] flex items-center gap-4 px-5 bg-slate-50 border rounded-2xl">
                    <Search size={18} className="text-slate-300"/>
                    <input placeholder="Cari Nama / RM / NIK..." className="flex-1 bg-transparent py-5 outline-none font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <ActivitySearchSelector value={filterActivity} onChange={setFilterActivity} activities={activities} />
                <div className="flex gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-3 px-5 bg-slate-50 border rounded-2xl shrink-0">
                        <Calendar size={18} className="text-slate-300"/>
                        <select className="bg-transparent py-5 outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                            <option value="all">Semua Tahun</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className={tableHeadClass}>Pasien & No. RM</th>
                            <th className={tableHeadClass}>{mode === 'record' ? 'Hasil / Diagnosa' : 'Identitas (NIK)'}</th>
                            <th className={tableHeadClass}>Kategori & Event</th>
                            <th className={tableHeadClass}>Petugas Input</th>
                            <th className={tableHeadClass}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} className={`${tableRowClass} ${p.isEmergency ? 'bg-rose-50/40' : ''}`}>
                                <td className={tableCellClass}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-sm ${p.isEmergency ? 'bg-rose-600 animate-pulse' : 'bg-slate-900'}`}>
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase tracking-tight leading-none mb-1 ${p.isEmergency ? 'text-rose-600' : 'text-slate-800'}`}>{p.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">{p.mrn}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className={tableCellClass}>
                                    {mode === 'record' ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md w-fit font-black tracking-widest">{p.diagnosisCode || 'NON-ICD'}</span>
                                            <p className="text-[10px] font-black text-slate-700 uppercase truncate max-w-[180px]">{p.category === 'MCU' ? (p.mcuConclusion || 'Belum Ada Kesimpulan') : (p.diagnosisName || 'Pemeriksaan Umum')}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-[11px] font-mono font-black text-slate-500 tracking-[0.15em]">{p.identityNo || 'EMERGENCY'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{p.gender} | {p.age} Thn</p>
                                        </div>
                                    )}
                                </td>
                                <td className={tableCellClass}>
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase w-fit text-white ${p.category === 'MCU' ? 'bg-indigo-500' : 'bg-primary'}`}>{p.category}</span>
                                        <p className="text-[9px] font-black text-slate-400 uppercase truncate max-w-[150px]">
                                            {activities.find(a => a.id === p.activityId)?.name || 'Event PCC'}
                                        </p>
                                    </div>
                                </td>
                                <td className={tableCellClass}>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-slate-700 flex items-center gap-2 uppercase tracking-tighter"><UserCheck size={12} className="text-primary"/> {p.lastModifiedBy || 'Unknown'}</p>
                                        <p className="text-[9px] font-bold text-slate-400 flex items-center gap-2"><Clock size={10}/> {p.lastModifiedAt || '-'}</p>
                                    </div>
                                </td>
                                <td className={tableCellClass}>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingPatient(p)} className="p-3 text-slate-400 hover:text-primary transition-all bg-slate-100 rounded-xl"><Edit size={16}/></button>
                                        <button onClick={() => deletePatient(p.id)} className="p-3 text-slate-400 hover:text-rose-600 transition-all bg-slate-100 rounded-xl"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs italic">Basis Data Masih Kosong</div>}
            </div>
        </div>
    );
};

export const ManageNews = () => {
    const { news, deleteNews, addNews } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Berita & Pengumuman</h2>
                {!isAdding && <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl"><Plus size={18}/> Tambah Berita</button>}
            </div>
            {isAdding && (
                <div className="bg-white p-10 rounded-[2.5rem] border shadow-2xl animate-card">
                    <form onSubmit={(e: any) => {
                        e.preventDefault();
                        const f = new FormData(e.target);
                        addNews({ id: Date.now().toString(), title: f.get('title') as string, date: f.get('date') as string, content: f.get('content') as string, imageUrl: preview || 'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf' });
                        setIsAdding(false); setPreview(null);
                    }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul Berita</label><input name="title" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold text-slate-700" placeholder="Ketik judul artikel..." /></div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Publikasi</label><input name="date" type="date" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Konten Lengkap</label><textarea name="content" required rows={6} className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-medium text-slate-600" placeholder="Isi artikel berita..." /></div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Unggah Gambar</label>
                                <div onClick={() => fileRef.current?.click()} className="w-full h-80 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden relative group">
                                    {preview ? <img src={preview} className="w-full h-full object-cover" /> : <><Camera size={48} className="text-slate-300 group-hover:text-primary transition"/><span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">Klik Untuk Pilih Gambar</span></>}
                                    <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handlePhoto} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-6 border-t"><button type="button" onClick={() => {setIsAdding(false); setPreview(null);}} className="px-10 text-slate-400 uppercase text-[10px] font-black">Batal</button><button type="submit" className="flex-1 bg-primary text-white py-5 rounded-3xl font-black uppercase text-[10px] shadow-xl tracking-widest">Simpan & Publikasikan</button></div>
                    </form>
                </div>
            )}
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Preview</th><th className={tableHeadClass}>Judul Berita</th><th className={tableHeadClass}>Tanggal</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {news.map(n => (<tr key={n.id} className={tableRowClass}><td className={tableCellClass}><img src={n.imageUrl} className="w-20 h-12 object-cover rounded-xl border" /></td><td className={tableCellClass}><p className="font-bold uppercase text-slate-800 line-clamp-1">{n.title}</p></td><td className={tableCellClass}><span className="text-xs font-mono text-slate-400">{n.date}</span></td><td className={tableCellClass}><button onClick={() => deleteNews(n.id)} className="text-slate-300 hover:text-rose-500 bg-slate-50 p-2.5 rounded-xl transition-all"><Trash2 size={18}/></button></td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageCarousel = () => {
    const { carouselItems, deleteCarousel, addCarousel } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Slide Banner Utama</h2>
                <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl"><Plus size={18}/> Tambah Slide</button>
            </div>
            {isAdding && (
                <div className="bg-white p-10 rounded-[2.5rem] border shadow-2xl animate-card max-w-2xl mx-auto">
                    <form onSubmit={(e: any) => {
                        e.preventDefault();
                        const f = new FormData(e.target);
                        addCarousel({ id: Date.now().toString(), title: f.get('title') as string, subtitle: f.get('subtitle') as string, imageUrl: f.get('url') as string });
                        setIsAdding(false);
                    }} className="space-y-6">
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Headline Slide</label><input name="title" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-black text-slate-800" placeholder="PCC SUMATERA SELATAN..." /></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sub-headline</label><input name="subtitle" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" placeholder="Layanan monitoring 24 jam..." /></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">URL Gambar</label><input name="url" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-mono text-xs" placeholder="https://..." /></div>
                        <div className="flex gap-4 pt-6"><button type="button" onClick={() => setIsAdding(false)} className="px-8 text-slate-400 uppercase text-[10px] font-black">Batal</button><button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Tambahkan Slide</button></div>
                    </form>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {carouselItems.map(c => (
                    <div key={c.id} className="bg-white rounded-[2rem] border shadow-sm overflow-hidden group">
                        <div className="h-48 relative overflow-hidden">
                            <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <div className="absolute top-4 right-4"><button onClick={() => deleteCarousel(c.id)} className="bg-rose-500 text-white p-2.5 rounded-xl shadow-lg hover:bg-rose-600 transition"><Trash size={18}/></button></div>
                        </div>
                        <div className="p-6">
                            <h4 className="font-black text-slate-800 uppercase italic tracking-tighter mb-1 truncate">{c.title}</h4>
                            <p className="text-xs text-slate-400 font-bold truncate">{c.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ManageActivities = () => {
    const { activities, deleteActivity, addActivity } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Daftar Kegiatan PCC</h2>
                <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl"><Plus size={18}/> Tambah Kegiatan</button>
            </div>
            {isAdding && (
                <div className="bg-white p-10 rounded-[2.5rem] border shadow-2xl animate-card">
                    <form onSubmit={(e: any) => {
                        e.preventDefault();
                        const f = new FormData(e.target);
                        addActivity({ id: Date.now().toString(), name: f.get('name') as string, startDate: f.get('start') as string, endDate: f.get('end') as string, host: f.get('host') as string, location: f.get('loc') as string, status: 'To Do' });
                        setIsAdding(false);
                    }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Kegiatan</label><input name="name" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-black text-slate-700 uppercase" placeholder="Nama event/kegiatan..." /></div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tgl Mulai</label><input name="start" type="date" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" /></div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tgl Selesai</label><input name="end" type="date" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" /></div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Host / Dinas</label><input name="host" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" /></div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lokasi</label><input name="loc" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" /></div>
                        </div>
                        <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsAdding(false)} className="px-8 text-slate-400 uppercase text-[10px] font-black">Batal</button><button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Simpan</button></div>
                    </form>
                </div>
            )}
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Kegiatan</th><th className={tableHeadClass}>Host</th><th className={tableHeadClass}>Status</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {activities.map(a => (<tr key={a.id} className={tableRowClass}><td className={tableCellClass}><p className="font-bold uppercase text-slate-800 leading-tight">{a.name}</p><p className="text-[10px] font-bold text-slate-400">{a.location}</p></td><td className={tableCellClass}><span className="text-xs font-bold text-slate-500">{a.host}</span></td><td className={tableCellClass}><span className="text-[10px] font-black uppercase px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl">{a.status}</span></td><td className={tableCellClass}><button onClick={() => deleteActivity(a.id)} className="text-slate-300 hover:text-rose-500 bg-slate-50 p-2.5 rounded-xl"><Trash2 size={18}/></button></td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageOfficers = () => {
    const { officers, deleteOfficer, addOfficer } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Database Petugas</h2>
                <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl"><Plus size={18}/> Tambah Petugas</button>
            </div>
            {isAdding && (
                <div className="bg-white p-10 rounded-[2.5rem] border shadow-2xl animate-card max-w-2xl mx-auto">
                    <form onSubmit={(e: any) => {
                        e.preventDefault();
                        const f = new FormData(e.target);
                        addOfficer({ id: Date.now().toString(), name: f.get('name') as string, email: f.get('email') as string, teamId: f.get('team') as string, role: f.get('role') as any, password: 'password123' });
                        setIsAdding(false);
                    }} className="space-y-6">
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Petugas</label><input name="name" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-black text-slate-800" /></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email / ID Petugas</label><input name="email" type="email" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" /></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Team ID</label><input name="team" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" /></div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Otoritas</label><select name="role" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-black uppercase text-xs"><option value="petugas">Petugas Medis</option><option value="admin">Administrator</option></select></div>
                        </div>
                        <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsAdding(false)} className="px-8 text-slate-400 uppercase text-[10px] font-black">Batal</button><button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Simpan</button></div>
                    </form>
                </div>
            )}
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Petugas</th><th className={tableHeadClass}>Email</th><th className={tableHeadClass}>Role</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {officers.map(o => (<tr key={o.id} className={tableRowClass}><td className={tableCellClass}><p className="font-bold uppercase text-slate-800 leading-tight">{o.name}</p><p className="text-[10px] font-bold text-slate-400">Team: {o.teamId}</p></td><td className={tableCellClass}><span className="text-xs font-medium text-slate-500">{o.email}</span></td><td className={tableCellClass}><span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-xl ${o.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>{o.role}</span></td><td className={tableCellClass}><button onClick={() => deleteOfficer(o.id)} className="text-slate-300 hover:text-rose-500 bg-slate-50 p-2.5 rounded-xl"><Trash2 size={18}/></button></td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageICD10 = () => {
    const { icd10List, deleteICD10, addICD10 } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, {type: 'binary'});
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data: any[] = XLSX.utils.sheet_to_json(ws);
            const newList: ICD10[] = data.map(row => ({ code: String(row.code || row.Code || ''), name: String(row.name || row.Name || '') }));
            addICD10(newList);
            alert(`Sukses mengimport ${newList.length} diagnosa.`);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Library ICD-10</h2>
                <div className="flex gap-4">
                    <button onClick={() => fileRef.current?.click()} className="bg-white border px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-sm hover:bg-slate-50 transition"><FileJson size={18} className="text-primary"/> Import File</button>
                    <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl"><Plus size={18}/> Tambah Manual</button>
                    <input type="file" ref={fileRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleImportCSV} />
                </div>
            </div>
            {isAdding && (
                <div className="bg-white p-10 rounded-[2.5rem] border shadow-2xl animate-card max-w-2xl mx-auto">
                    <form onSubmit={(e: any) => {
                        e.preventDefault();
                        const f = new FormData(e.target);
                        addICD10([{ code: f.get('code') as string, name: f.get('name') as string }]);
                        setIsAdding(false);
                    }} className="space-y-6">
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kode ICD-10</label><input name="code" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-black text-primary" placeholder="A00.0..." /></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Penyakit</label><input name="name" required className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold uppercase" placeholder="Cholera..." /></div>
                        <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsAdding(false)} className="px-8 text-slate-400 uppercase text-[10px] font-black">Batal</button><button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Simpan</button></div>
                    </form>
                </div>
            )}
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr><th className={tableHeadClass}>Kode ICD</th><th className={tableHeadClass}>Nama Diagnosa</th><th className={tableHeadClass}>Aksi</th></tr></thead>
                    <tbody>
                        {icd10List.map(i => (<tr key={i.code} className={tableRowClass}><td className={tableCellClass}><span className="font-mono text-primary font-black bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 tracking-widest">{i.code}</span></td><td className={tableCellClass}><p className="font-bold uppercase text-slate-800 tracking-tight">{i.name}</p></td><td className={tableCellClass}><button onClick={() => deleteICD10(i.code)} className="text-slate-300 hover:text-rose-500 bg-slate-50 p-2.5 rounded-xl"><Trash2 size={18}/></button></td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
