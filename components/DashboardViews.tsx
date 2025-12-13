import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Activity, Officer, News, Patient, ICD10, CarouselItem } from '../types';
import { Edit, Trash2, Plus, Printer, Eye, Upload, Image as ImageIcon, Save, X, FileText, Calendar, User, ChevronDown, ChevronRight, ChevronUp, Folder, FolderOpen, Stethoscope, ClipboardList, Activity as ActivityIcon, Search, Filter, Info, Power, RotateCcw, Download, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import PatientForm from './PatientForm';

// --- HELPER FOR FILE UPLOAD ---
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Validate File
const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert("Hanya file JPG, PNG, atau WEBP yang diperbolehkan.");
        return false;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
        alert("Ukuran file maksimal 2MB.");
        return false;
    }
    return true;
};

// --- SHARED STYLES ---
const tableHeadClass = "p-4 text-gray-600 font-bold text-xs uppercase tracking-wider border-b border-gray-200 bg-slate-100";
const tableCellClass = "p-4 text-sm text-gray-700 border-b border-gray-100 align-middle";
const tableRowClass = "hover:bg-slate-50 transition duration-150";

// --- ACTIVITIES ---
export const ManageActivities = () => {
  const { activities, addActivity, updateActivity, deleteActivity } = useApp();
  const [isEditing, setIsEditing] = useState<Activity | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    if (isEditing) {
      updateActivity({ ...isEditing, ...data });
      setIsEditing(null);
    } else {
      addActivity({ ...data, id: Date.now().toString() });
      setIsAdding(false);
    }
  };

  if (isAdding || isEditing) {
    const defaultVal: Partial<Activity> = isEditing || {};
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-gray-800">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">{isEditing ? <Edit size={20}/> : <Plus size={20}/>} {isEditing ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Kegiatan</label>
              <input name="name" placeholder="Nama Kegiatan" defaultValue={defaultVal.name} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Mulai</label>
                <input name="startDate" type="date" defaultValue={defaultVal.startDate} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900" />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Selesai</label>
                <input name="endDate" type="date" defaultValue={defaultVal.endDate} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900" />
             </div>
          </div>
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Penyelenggara (Host)</label>
              <input name="host" placeholder="Host" defaultValue={defaultVal.host} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900" />
          </div>
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi</label>
              <input name="location" placeholder="Tempat" defaultValue={defaultVal.location} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900" />
          </div>
          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select name="status" defaultValue={defaultVal.status || 'To Do'} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary focus:border-primary bg-white text-gray-900">
                <option>To Do</option>
                <option>On Progress</option>
                <option>Done</option>
              </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50">Batal</button>
            <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-secondary shadow-lg">Simpan</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Kegiatan</h2>
        <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary shadow-md font-medium">
          <Plus size={18} /> Tambah Kegiatan
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className={tableHeadClass}>Nama</th>
              <th className={tableHeadClass}>Tanggal</th>
              <th className={tableHeadClass}>Host/Lokasi</th>
              <th className={tableHeadClass}>Status</th>
              <th className={tableHeadClass}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(a => (
              <tr key={a.id} className={tableRowClass}>
                <td className={`${tableCellClass} font-semibold text-gray-900`}>{a.name}</td>
                <td className={`${tableCellClass} whitespace-nowrap`}>{a.startDate} <span className="text-gray-400">/</span> {a.endDate}</td>
                <td className={tableCellClass}>{a.host}<br/><span className="text-gray-500 text-xs">{a.location}</span></td>
                <td className={tableCellClass}>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    a.status === 'On Progress' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                    a.status === 'Done' ? 'bg-slate-200 text-slate-700 border border-slate-300' : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>{a.status}</span>
                </td>
                <td className={`${tableCellClass} flex gap-2`}>
                  <button onClick={() => setIsEditing(a)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded hover:bg-blue-100 transition"><Edit size={16} /></button>
                  <button onClick={() => deleteActivity(a.id)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded hover:bg-red-100 transition"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- OFFICERS ---
export const ManageOfficers = () => {
  const { officers, addOfficer, updateOfficer, deleteOfficer } = useApp();
  const [isEditing, setIsEditing] = useState<Officer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    if (isEditing) {
      updateOfficer({ ...isEditing, ...data });
      setIsEditing(null);
    } else {
      addOfficer({ ...data, id: Date.now().toString() });
      setIsAdding(false);
    }
  };

  if (isAdding || isEditing) {
      const defaultVal: Partial<Officer> = isEditing || {};
      return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">{isEditing ? 'Edit Petugas' : 'Tambah Petugas'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Nama Petugas</label>
                 <input name="name" placeholder="Nama Petugas" defaultValue={defaultVal.name} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white" />
            </div>
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Email (Login ID)</label>
                 <input name="email" type="email" placeholder="nama@email.com" defaultValue={defaultVal.email} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white" />
            </div>
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">ID Team (Badge/NIP)</label>
                 <input name="teamId" placeholder="ID Team" defaultValue={defaultVal.teamId} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white" />
            </div>
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                 <input name="password" placeholder="Password" defaultValue={defaultVal.password} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white" />
            </div>
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                 <select name="role" defaultValue={defaultVal.role || 'petugas'} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white">
                    <option value="petugas">Petugas</option>
                    <option value="admin">Admin</option>
                 </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50">Batal</button>
              <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-secondary shadow-lg">Simpan</button>
            </div>
          </form>
        </div>
      );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Petugas</h2>
        <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary shadow-md font-medium">
          <Plus size={18} /> Tambah Petugas
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className={tableHeadClass}>Nama</th>
              <th className={tableHeadClass}>Email</th>
              <th className={tableHeadClass}>ID Team</th>
              <th className={tableHeadClass}>Role</th>
              <th className={tableHeadClass}>Password</th>
              <th className={tableHeadClass}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {officers.map(o => (
              <tr key={o.id} className={tableRowClass}>
                <td className={`${tableCellClass} font-semibold text-gray-900`}>{o.name}</td>
                <td className={tableCellClass}>{o.email}</td>
                <td className={tableCellClass}>{o.teamId}</td>
                <td className={`${tableCellClass} capitalize`}>{o.role}</td>
                <td className={`${tableCellClass} font-mono text-xs text-gray-500`}>{o.password}</td>
                <td className={`${tableCellClass} flex gap-2`}>
                  <button onClick={() => setIsEditing(o)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded hover:bg-blue-100"><Edit size={16} /></button>
                  <button onClick={() => deleteOfficer(o.id)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded hover:bg-red-100"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- NEWS ---
export const ManageNews = () => {
    // ... (Keep existing code)
    const { news, addNews, updateNews, deleteNews } = useApp();
    const [isEditing, setIsEditing] = useState<News | null>(null);
    const [isAdding, setIsAdding] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const file = formData.get('imageFile') as File;
      
      let imageUrl = isEditing?.imageUrl || '';

      if (file && file.size > 0) {
          if (!validateImage(file)) return;
          imageUrl = await convertFileToBase64(file);
      }

      const data = {
          title: formData.get('title') as string,
          date: formData.get('date') as string,
          content: formData.get('content') as string,
          imageUrl: imageUrl || 'https://via.placeholder.com/800x400',
      };
      
      if (isEditing) {
        updateNews({ ...isEditing, ...data });
        setIsEditing(null);
      } else {
        addNews({ ...data, id: Date.now().toString() });
        setIsAdding(false);
      }
    };
  
    if (isAdding || isEditing) {
        const defaultVal: Partial<News> = isEditing || {};
        return (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-2xl text-gray-900">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">{isEditing ? 'Edit Berita' : 'Tambah Berita'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Judul Berita</label>
                  <input name="title" placeholder="Judul Berita" defaultValue={defaultVal.title} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white" />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                  <input name="date" type="date" defaultValue={defaultVal.date} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white" />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gambar Berita</label>
                  <input name="imageFile" type="file" accept="image/*" className="w-full border border-gray-300 p-2.5 rounded-lg bg-white" />
                  <p className="text-[10px] text-gray-500 mt-1">* Max 2MB, JPG/PNG. Rekomendasi Resolusi: 800x600 px</p>
                  {defaultVal.imageUrl && <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah gambar.</p>}
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Isi Berita</label>
                  <textarea name="content" placeholder="Keterangan Berita" rows={6} defaultValue={defaultVal.content} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-primary bg-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-secondary shadow-lg">Simpan</button>
              </div>
            </form>
          </div>
        );
    }

    return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Kelola Berita</h2>
            <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary shadow-md font-medium">
              <Plus size={18} /> Tambah Berita
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(n => (
              <div key={n.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition">
                <img src={n.imageUrl} alt={n.title} className="h-48 w-full object-cover" />
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{n.title}</h3>
                  <p className="text-xs text-primary font-bold uppercase mb-3">{n.date}</p>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{n.content}</p>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                   <button onClick={() => setIsEditing(n)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded hover:bg-blue-100"><Edit size={18} /></button>
                   <button onClick={() => deleteNews(n.id)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded hover:bg-red-100"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
};

// --- ICD 10 ---
export const ManageICD10 = () => {
    // ... (Keep existing code)
    const { icd10List, addICD10, deleteICD10, updateICD10 } = useApp();
    const [isAddingManual, setIsAddingManual] = useState(false);
    const [isEditing, setIsEditing] = useState<ICD10 | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data: any[] = XLSX.utils.sheet_to_json(ws);
            const formatted: ICD10[] = data.map(row => ({
                code: row.Code || row.code || '?', 
                name: row.Name || row.name || 'Unknown'
            })).filter(x => x.code !== '?');
            addICD10(formatted);
            alert(`Berhasil impor ${formatted.length} data ICD-10.`);
        };
        reader.readAsBinaryString(file);
    };

    const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const item = {
            code: formData.get('code') as string,
            name: formData.get('name') as string
        };
        if (isEditing) {
            updateICD10(item);
            setIsEditing(null);
        } else {
            addICD10([item]);
            setIsAddingManual(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Kelola ICD-10</h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsAddingManual(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-secondary">
                        <Plus size={18} /> Manual
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 relative overflow-hidden font-medium hover:bg-green-700">
                       <Upload size={18} /> Excel
                       <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </button>
                </div>
            </div>
            {(isAddingManual || isEditing) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-200">
                        <h3 className="font-bold text-xl mb-4 text-gray-900">{isEditing ? 'Edit ICD-10' : 'Tambah ICD-10'}</h3>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kode</label>
                                <input name="code" placeholder="Kode ICD-10" defaultValue={isEditing?.code} required readOnly={!!isEditing} className={`w-full border border-gray-300 p-2.5 rounded-lg ${isEditing ? 'bg-gray-100' : 'bg-white'} text-gray-900`} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Penyakit</label>
                                <input name="name" placeholder="Nama Penyakit" defaultValue={isEditing?.name} required className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900" />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => {setIsAddingManual(false); setIsEditing(null);}} className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium">Batal</button>
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className={`${tableHeadClass} w-32`}>Kode</th>
                            <th className={tableHeadClass}>Nama Penyakit</th>
                            <th className={`${tableHeadClass} w-24`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {icd10List.map((icd, idx) => (
                            <tr key={idx} className={tableRowClass}>
                                <td className={`${tableCellClass} font-mono font-bold text-primary`}>{icd.code}</td>
                                <td className={`${tableCellClass} font-semibold text-gray-800`}>{icd.name}</td>
                                <td className={`${tableCellClass} flex gap-2`}>
                                    <button onClick={() => setIsEditing(icd)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                    <button onClick={() => deleteICD10(icd.code)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {icd10List.length === 0 && <p className="p-8 text-center text-gray-500">Belum ada data. Silahkan upload file Excel.</p>}
            </div>
        </div>
    );
};

// --- CAROUSEL ---
export const ManageCarousel = () => {
    // ... (Keep existing code)
    const { carouselItems, addCarousel, deleteCarousel } = useApp();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleAdd = async () => {
        if(imageFile && title) {
            if (!validateImage(imageFile)) return;
            const base64 = await convertFileToBase64(imageFile);
            addCarousel({ id: Date.now().toString(), imageUrl: base64, title, subtitle });
            setTitle(''); setSubtitle(''); setImageFile(null);
        } else {
            alert("Gambar dan Judul wajib diisi!");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Kelola Banner Carousel</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8 text-gray-900">
                <h3 className="font-bold text-xl mb-4 border-b pb-2">Tambah Banner Baru</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Upload Gambar</label>
                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="border border-gray-300 p-2.5 rounded-lg w-full bg-white" />
                        <p className="text-[10px] text-gray-500 mt-1">* Max 2MB, JPG/PNG. 1920x600 px</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Judul</label>
                        <input placeholder="Judul Utama" value={title} onChange={e => setTitle(e.target.value)} className="border border-gray-300 p-2.5 rounded-lg w-full bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sub Judul</label>
                        <input placeholder="Sub Judul" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="border border-gray-300 p-2.5 rounded-lg w-full bg-white" />
                    </div>
                </div>
                <button onClick={handleAdd} className="mt-4 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-secondary font-medium shadow-md">Tambah Banner</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {carouselItems.map(item => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden shadow-lg aspect-video">
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                            <h4 className="text-white font-bold text-xl">{item.title}</h4>
                            <p className="text-gray-200">{item.subtitle}</p>
                        </div>
                        <button onClick={() => deleteCarousel(item.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- PATIENTS & MEDICAL RECORDS ---
export const ManagePatients = ({ mode = 'edit' }: { mode: 'edit' | 'record' | 'add' }) => {
    const { patients, deletePatient, activities, updatePatient } = useApp();
    const navigate = useNavigate();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [filterName, setFilterName] = useState('');
    // Changed filterActivityId to filterActivityName for text search
    const [filterActivityName, setFilterActivityName] = useState('');
    
    // Side Filter State
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));

    // Pagination State (New)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // State for Bulk Print (Printing list of patients for an activity)
    const [printListActivity, setPrintListActivity] = useState<{activity: Activity | undefined, patients: Patient[]} | null>(null);

    // Activity Detail Modal
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    // --- Data Grouping Logic ---
    const groupedPatients = useMemo(() => {
        if (mode === 'edit' || mode === 'add') return null;

        const groups: Record<string, Record<string, Record<string, Patient[]>>> = {};

        patients.forEach(p => {
             const date = new Date(p.visitDate);
             const year = date.getFullYear().toString();
             const month = String(date.getMonth() + 1).padStart(2, '0');
             const activityId = p.activityId;

             if (!groups[year]) groups[year] = {};
             if (!groups[year][month]) groups[year][month] = {};
             if (!groups[year][month][activityId]) groups[year][month][activityId] = [];
             
             if (p.name.toLowerCase().includes(filterName.toLowerCase())) {
                 groups[year][month][activityId].push(p);
             }
        });
        return groups;
    }, [patients, filterName, mode]);

    const availableYears = useMemo(() => {
        if(!groupedPatients) return [];
        return Object.keys(groupedPatients).sort().reverse();
    }, [groupedPatients]);

    const handleEdit = (p: Patient) => {
        setEditingPatient(p);
        setIsFormOpen(true);
    };

    const showActivityDetail = (activityId: string) => {
        const act = activities.find(a => a.id === activityId);
        if(act) setSelectedActivity(act);
    }
    
    const handleExportExcel = (filteredData: Patient[]) => {
        const dataToExport = filteredData.map(p => {
            const actName = activities.find(a => a.id === p.activityId)?.name || 'Unknown';
            return {
                MRN: p.mrn,
                Nama: p.name,
                NIK: p.identityNo,
                Kegiatan: actName,
                Kategori: p.category,
                'Tgl Lahir': p.dateOfBirth,
                Umur: p.age,
                JK: p.gender,
                Alamat: p.address,
                NoHP: p.phone,
                TglKunjungan: p.visitDate,
                Diagnosis: p.diagnosisName || '-',
                KesimpulanMCU: p.mcuConclusion || '-'
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Pasien");
        const fileName = `Data_Pasien_PCC_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // 1. ADD / FORM MODE
    if (mode === 'add' || isFormOpen) {
        return (
            <div>
               <PatientForm 
                  initialData={editingPatient}
                  onSave={() => { setIsFormOpen(false); if(mode==='add') navigate('/dashboard'); }} 
                  onCancel={() => { setIsFormOpen(false); if(mode==='add') navigate('/dashboard'); }}
                  isStandalone={mode === 'add'}
               />
            </div>
        );
    }

    // 2. BULK PRINT LIST MODAL
    if (printListActivity) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto print:bg-white print:fixed print:inset-0 font-sans text-gray-900">
                <div className="bg-white p-8 rounded-xl max-w-5xl w-full shadow-2xl print:shadow-none print:w-full border border-gray-100 print:border-none print:p-0">
                    <div className="flex justify-between items-start mb-6 print:hidden">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-800">Cetak Laporan Kegiatan</h2>
                        </div>
                        <div className="space-x-2">
                             <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 inline-flex transition shadow-md"><Printer size={16}/> Cetak</button>
                             <button onClick={() => setPrintListActivity(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition">Tutup</button>
                        </div>
                    </div>
                    {/* ... (Print Content Kept the same) ... */}
                    <div className="text-gray-950 font-sans print:font-sans leading-relaxed text-sm">
                        <div className="text-center border-b-2 border-black pb-4 mb-6 print:mb-4">
                            <h1 className="text-2xl font-bold uppercase tracking-widest text-black mb-1 print:text-2xl">PCC Sumsel</h1>
                            <p className="text-xs tracking-[0.3em] uppercase font-bold text-black print:text-xs">Province Command Center Sumatera Selatan</p>
                        </div>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-center uppercase mb-2">Laporan Rekam Medis Kegiatan</h2>
                            <div className="flex justify-center gap-8 text-sm mt-4">
                                <div><span className="font-bold">Kegiatan:</span> {printListActivity.activity?.name}</div>
                                <div><span className="font-bold">Tanggal:</span> {printListActivity.activity?.startDate}</div>
                                <div><span className="font-bold">Lokasi:</span> {printListActivity.activity?.location}</div>
                            </div>
                        </div>
                        <table className="w-full text-left text-[12px] border-collapse border border-black">
                            <thead>
                                <tr className="bg-gray-100 print:bg-gray-100">
                                    <th className="border border-black p-2 text-center w-10">No</th>
                                    <th className="border border-black p-2">MRN</th>
                                    <th className="border border-black p-2">Nama Pasien</th>
                                    <th className="border border-black p-2 text-center">L/P</th>
                                    <th className="border border-black p-2 text-center">Umur</th>
                                    <th className="border border-black p-2">Kategori</th>
                                    <th className="border border-black p-2">Diagnosa / Kesimpulan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {printListActivity.patients.map((p, idx) => (
                                    <tr key={p.id}>
                                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                                        <td className="border border-black p-2 font-mono">{p.mrn}</td>
                                        <td className="border border-black p-2 font-bold">{p.name}</td>
                                        <td className="border border-black p-2 text-center">{p.gender}</td>
                                        <td className="border border-black p-2 text-center">{p.age}</td>
                                        <td className="border border-black p-2">{p.category}</td>
                                        <td className="border border-black p-2">
                                            {p.category === 'Berobat' 
                                                ? `${p.diagnosisCode || ''} - ${p.diagnosisName || '-'}`
                                                : `MCU: ${p.mcuConclusion || '-'}`
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-12 flex justify-end text-center break-inside-avoid">
                            <div className="w-56">
                                <p className="mb-12 text-[12px]">Palembang, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                <p className="font-bold border-b border-black pb-1 inline-block min-w-[150px]">( ........................................... )</p>
                                <p className="text-[10px] mt-1 uppercase font-bold">Penanggung Jawab Kegiatan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. SINGLE PATIENT PRINT MODAL (UNIFORM FONTS)
    if (viewingPatient) {
        const act = activities.find(a => a.id === viewingPatient.activityId);
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 print:bg-white print:fixed print:inset-0 print:z-[100] print:block print:p-0">
                <div className="bg-white rounded-xl max-w-5xl w-full shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden print:shadow-none print:border-none print:w-full print:max-h-none print:max-w-none print:rounded-none">
                    
                    {/* HEADER (Screen Only) */}
                    <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-white shrink-0 print:hidden">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full text-primary"><ClipboardList size={24}/></div>
                            <h2 className="text-2xl font-bold text-gray-800">Detail Rekam Medis</h2>
                        </div>
                        <div className="space-x-2">
                             <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 inline-flex transition shadow-md font-bold"><Printer size={16}/> Cetak</button>
                             <button onClick={() => setViewingPatient(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-bold flex items-center gap-2"><X size={16}/> Close</button>
                        </div>
                    </div>

                    {/* SCROLLABLE CONTENT / PRINT CONTENT */}
                    <div className="p-8 overflow-y-auto custom-scrollbar print:p-0 print:overflow-visible text-gray-950 font-sans print:font-sans leading-relaxed text-sm">
                        
                        {/* Header Print Only - PROFESSIONAL LETTERHEAD */}
                        <div className="hidden print:flex flex-row items-center justify-center gap-6 mb-6 border-b-4 border-double border-black pb-4">
                            {/* Logo Placeholder - You can replace 'PCC' text with an <img> tag if you have a URL */}
                            <div className="w-20 h-20 flex items-center justify-center border-2 border-black rounded-full font-bold text-xl">
                                PCC
                            </div>
                            <div className="text-center flex-1">
                                <h3 className="text-lg font-bold uppercase text-black font-serif tracking-wide">PEMERINTAH PROVINSI SUMATERA SELATAN</h3>
                                <h2 className="text-xl font-bold uppercase text-black font-serif tracking-wider">DINAS KESEHATAN</h2>
                                <h1 className="text-2xl font-black uppercase text-black font-sans tracking-widest mt-1">PROVINCE COMMAND CENTER (PCC)</h1>
                                <p className="text-sm text-black mt-1 font-serif italic">Jl. Merdeka No. 10, Palembang - Sumatera Selatan | Telp: 0811-7870-119</p>
                            </div>
                             {/* Logo Placeholder Right (Optional balance) */}
                             <div className="w-20 h-20"></div> 
                        </div>

                        <div className="hidden print:block text-center mb-6">
                            <h2 className="text-lg font-bold uppercase underline mt-4 text-center">LEMBAR HASIL PEMERIKSAAN KESEHATAN</h2>
                            <p className="text-xs text-center font-mono mt-1">Nomor Dokumen: {viewingPatient.mrn}</p>
                        </div>
                        
                        {/* Identity Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 border-b border-gray-300 pb-6 print:border-none print:text-[12px] print:font-serif">
                             {[
                                 ['No. RM', viewingPatient.mrn, true],
                                 ['Tanggal', viewingPatient.visitDate],
                                 ['Nama Pasien', viewingPatient.name, true],
                                 ['Tgl Lahir / Umur', `${viewingPatient.dateOfBirth || '-'} / ${viewingPatient.age} Th`],
                                 ['Jenis Kelamin', viewingPatient.gender === 'L' ? 'Laki-Laki' : 'Perempuan'],
                                 ['Kegiatan', act?.name]
                             ].map(([label, val, isBold], idx) => (
                                 <div key={idx} className="grid grid-cols-[140px_1fr] items-baseline">
                                     <span className="uppercase text-[11px] font-bold text-gray-600 print:text-black">{label} :</span> 
                                     <span className={`${isBold ? 'font-bold' : 'font-medium'} text-[13px] print:text-black uppercase print:text-[12px]`}>{val}</span>
                                 </div>
                             ))}
                        </div>

                        {/* Vitals Table Style for Print */}
                        <div className="mb-6 border border-gray-300 rounded p-4 print:border-none print:p-0 print:rounded-none">
                            <h3 className="font-bold text-black uppercase text-xs tracking-wider border-b border-gray-300 print:hidden pb-2 mb-3">Tanda-Tanda Vital</h3>
                            
                            {/* Print Version: Table for Vitals */}
                            <table className="w-full text-center border-collapse hidden print:table print:mb-6 text-[11px]">
                                <thead>
                                    <tr>
                                        <th className="border border-black px-2 py-1 bg-gray-100">Tekanan Darah</th>
                                        <th className="border border-black px-2 py-1 bg-gray-100">Nadi</th>
                                        <th className="border border-black px-2 py-1 bg-gray-100">TB / BB</th>
                                        <th className="border border-black px-2 py-1 bg-gray-100">BMI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-black px-2 py-1 font-bold">{viewingPatient.bloodPressure}</td>
                                        <td className="border border-black px-2 py-1 font-bold">{viewingPatient.pulse} x/mnt</td>
                                        <td className="border border-black px-2 py-1 font-bold">{viewingPatient.height}cm / {viewingPatient.weight}kg</td>
                                        <td className="border border-black px-2 py-1 font-bold">{viewingPatient.bmi} ({viewingPatient.bmiStatus})</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Screen Version Vitals */}
                            <div className="grid grid-cols-4 gap-4 print:hidden">
                                {[
                                    ['Tekanan Darah', viewingPatient.bloodPressure],
                                    ['Nadi', `${viewingPatient.pulse} x/mnt`],
                                    ['TB / BB', `${viewingPatient.height}cm / ${viewingPatient.weight}kg`],
                                    ['BMI', `${viewingPatient.bmi} (${viewingPatient.bmiStatus})`]
                                ].map(([l, v], i) => (
                                    <div key={i}>
                                        <span className="block text-[10px] uppercase font-bold text-gray-500">{l}</span>
                                        <span className="font-bold text-[14px] text-black">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Clinical Data */}
                        {viewingPatient.category === 'Berobat' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-2">
                                    <span className="font-bold block text-black uppercase text-xs tracking-wider print:text-[11px] print:mb-1">Riwayat Penyakit</span> 
                                    <div className="border-l-2 border-gray-300 pl-3 print:border-black text-[13px] print:text-[12px]">{viewingPatient.historyOfIllness || '-'}</div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-8 print:gap-4">
                                    {[
                                        ['Anamnesis (Subjektif)', viewingPatient.subjective],
                                        ['Pemeriksaan Fisik (Objektif)', viewingPatient.physicalExam]
                                    ].map(([l, v], i) => (
                                        <div key={i}>
                                            <span className="font-bold block text-black uppercase text-xs tracking-wider mb-1 bg-gray-100 print:bg-transparent print:border-b print:border-black print:pb-1 print:text-[11px] print:p-0 p-1">{l}</span> 
                                            <div className="border border-gray-200 p-2 min-h-[80px] print:border-none print:min-h-0 print:text-[12px] text-[13px]">{v}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border border-gray-300 p-4 rounded print:border print:border-black print:rounded-none">
                                    <span className="font-bold block text-black mb-4 text-sm uppercase tracking-wide border-b border-gray-300 print:border-black pb-1 print:text-center print:bg-gray-100">Diagnosis & Terapi</span>
                                    <div className="grid grid-cols-2 gap-4 print:gap-0 print:divide-x print:divide-black">
                                        <div className="print:p-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Diagnosis (ICD-10)</span>
                                            <p className="font-bold text-[14px] text-black print:text-[12px]">{viewingPatient.diagnosisCode} - {viewingPatient.diagnosisName}</p>
                                        </div>
                                        <div className="print:p-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Status Rujukan</span>
                                            <p className="font-bold text-[14px] text-black print:text-[12px]">{viewingPatient.referralStatus}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 print:border-black print:mt-0 print:pt-2 print:p-2">
                                        <span className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Therapy / Tindakan</span>
                                        <p className="font-medium text-[13px] text-black print:text-[12px]">{viewingPatient.therapy}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="font-bold text-center border-y-2 border-black py-2 uppercase tracking-wide text-black mb-4 text-sm bg-gray-100 print:bg-gray-200 print:text-[12px] print:border-black">Hasil Pemeriksaan MCU Lengkap</div>
                                
                                {/* MCU Table Structure for Print */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-[12px] print:block">
                                    {/* MCU Groups */}
                                    {[
                                        { title: 'Kepala & Leher', items: [['Visus OD', viewingPatient.visusOD], ['Visus OS', viewingPatient.visusOS], ['Buta Warna', viewingPatient.colorBlind], ['Gigi', viewingPatient.teeth], ['THT', `${viewingPatient.rightEar}/${viewingPatient.leftEar}`]] },
                                        { title: 'Tubuh & Bedah', items: [['Thorax', viewingPatient.thorax], ['Abdomen', viewingPatient.abdomen], ['Hernia', viewingPatient.hernia], ['Varicocele', viewingPatient.varicocele], ['Haemoroid', viewingPatient.hemorrhoids]] },
                                        { title: 'Ekstremitas & Neuro', items: [['Varises', viewingPatient.varicose], ['Reflek Pupil', viewingPatient.reflexPupil], ['Reflek Patella', viewingPatient.reflexPatella], ['Reflek Achiles', viewingPatient.reflexAchilles]] }
                                    ].map((group, idx) => (
                                        <div key={idx} className="print:mb-4">
                                            <h4 className="font-bold border-b border-black mb-2 pb-1 text-xs uppercase bg-gray-50 print:bg-transparent print:text-[11px] print:border-black">{group.title}</h4>
                                            
                                            {/* Screen List */}
                                            <ul className="space-y-1 print:hidden">
                                                {group.items.map(([l, v], i) => (
                                                    <li key={i} className="grid grid-cols-[80px_1fr]"><span className="text-gray-600 font-semibold">{l}</span> <span className="font-bold text-black">{v || '-'}</span></li>
                                                ))}
                                            </ul>

                                            {/* Print Table for each group to ensure alignment */}
                                            <table className="w-full text-left border-collapse border border-black hidden print:table text-[11px]">
                                                <tbody>
                                                    {group.items.map(([l, v], i) => (
                                                        <tr key={i}>
                                                            <td className="border border-black px-2 py-0.5 w-1/3 font-semibold">{l}</td>
                                                            <td className="border border-black px-2 py-0.5 font-bold">{v || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-black">
                                     <h4 className="font-bold text-xs uppercase mb-2 bg-gray-100 print:bg-gray-200 p-1 print:border print:border-black print:text-center">Pemeriksaan Penunjang & Kesimpulan</h4>
                                     <div className="grid grid-cols-2 gap-4 text-[12px] print:border print:border-black print:p-0 print:gap-0">
                                         <div className="print:border-b print:border-black print:p-2 print:col-span-2"><span className="block font-bold">EKG/Rontgen:</span> {viewingPatient.ekgResult || '-'} / {viewingPatient.xrayResult || '-'}</div>
                                         <div className="print:border-b print:border-black print:p-2 print:col-span-2"><span className="block font-bold">Lab:</span> {viewingPatient.labSummary || '-'}</div>
                                         <div className="col-span-2 mt-2 border border-black p-2 bg-gray-50 print:bg-white print:border-none print:border-b print:border-black print:m-0 print:p-2"><span className="block font-bold">KESIMPULAN:</span> {viewingPatient.mcuConclusion}</div>
                                         <div className="col-span-2 border border-black p-2 mt-2 bg-gray-50 print:bg-white print:border-none print:m-0 print:p-2"><span className="block font-bold">SARAN:</span> {viewingPatient.mcuRecommendation}</div>
                                     </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Footer Signature */}
                        <div className="mt-12 flex justify-end text-center break-inside-avoid">
                            <div className="w-56">
                                <p className="mb-12 text-[12px]">Palembang, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                <p className="font-bold border-b border-black pb-1 inline-block min-w-[150px]">( ........................................... )</p>
                                <p className="text-[10px] mt-1 uppercase font-bold">Dokter Pemeriksa</p>
                            </div>
                        </div>

                        {/* Audit Note */}
                        {viewingPatient.lastModifiedBy && (
                            <div className="mt-8 text-[10px] text-gray-500 text-right print:block hidden border-t border-gray-300 pt-1">
                                <i>Terakhir diubah oleh: {viewingPatient.lastModifiedBy} pada {viewingPatient.lastModifiedAt}</i>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 4. EDIT MODE (FLAT TABLE)
    if (mode === 'edit') {
        const flatFiltered = patients.filter(p => {
             const matchesName = p.name.toLowerCase().includes(filterName.toLowerCase()) || p.mrn.toLowerCase().includes(filterName.toLowerCase());
             
             // Updated Activity Filtering Logic (Name based search instead of Dropdown ID)
             const activity = activities.find(a => a.id === p.activityId);
             const activityName = activity ? activity.name.toLowerCase() : '';
             const matchesActivity = filterActivityName ? activityName.includes(filterActivityName.toLowerCase()) : true;

             return matchesName && matchesActivity;
        });

        // Pagination Logic
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = flatFiltered.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(flatFiltered.length / itemsPerPage);

        const paginate = (pageNumber: number) => {
            if (pageNumber >= 1 && pageNumber <= totalPages) {
                setCurrentPage(pageNumber);
            }
        };

        // Optimized Pagination Numbers Logic
        const getPageNumbers = () => {
            const pageNumbers = [];
            const maxPagesToShow = 5;
            
            if (totalPages <= maxPagesToShow) {
                for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                let startPage = currentPage - 2;
                let endPage = currentPage + 2;

                if (startPage < 1) {
                    startPage = 1;
                    endPage = maxPagesToShow;
                }

                if (endPage > totalPages) {
                    endPage = totalPages;
                    startPage = totalPages - maxPagesToShow + 1;
                }

                for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                }
            }
            return pageNumbers;
        };

        return (
            <div>
                 {/* Activity Detail Modal */}
                 {selectedActivity && (
                     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                         <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                             <h3 className="font-bold text-xl mb-4 border-b pb-2 text-gray-800">{selectedActivity.name}</h3>
                             <div className="space-y-3 text-sm">
                                 <div><span className="font-bold block text-gray-500 text-xs uppercase">Tanggal</span> {selectedActivity.startDate} s/d {selectedActivity.endDate}</div>
                                 <div><span className="font-bold block text-gray-500 text-xs uppercase">Host</span> {selectedActivity.host}</div>
                                 <div><span className="font-bold block text-gray-500 text-xs uppercase">Lokasi</span> {selectedActivity.location}</div>
                                 <div><span className="font-bold block text-gray-500 text-xs uppercase">Status</span> {selectedActivity.status}</div>
                             </div>
                             <div className="flex gap-3 mt-6">
                                 <button onClick={() => window.print()} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-lg font-bold flex items-center justify-center gap-2"><Printer size={16}/> Print</button>
                                 <button onClick={() => setSelectedActivity(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-bold">Close</button>
                             </div>
                         </div>
                     </div>
                 )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Database Pasien</h2>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => handleExportExcel(flatFiltered)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-md font-medium justify-center flex-1 md:flex-none">
                            <Download size={18} /> Export Excel
                        </button>
                        <button onClick={() => { setEditingPatient(undefined); setIsFormOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary shadow-md font-medium justify-center flex-1 md:flex-none">
                            <Plus size={18} /> Input Manual
                        </button>
                    </div>
                </div>
                
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {/* Name Search */}
                     <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input placeholder="Cari Nama Pasien / MRN..." value={filterName} onChange={e => { setFilterName(e.target.value); setCurrentPage(1); }} className="border border-gray-300 pl-10 p-2.5 rounded-lg w-full bg-white text-gray-900 focus:ring-primary focus:border-primary shadow-sm" />
                    </div>
                    {/* Activity Search Filter (Replaced Dropdown) */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            placeholder="Cari Nama Kegiatan..." 
                            value={filterActivityName} 
                            onChange={(e) => { setFilterActivityName(e.target.value); setCurrentPage(1); }} 
                            className="border border-gray-300 pl-10 p-2.5 rounded-lg w-full bg-white text-gray-900 focus:ring-primary focus:border-primary shadow-sm" 
                        />
                    </div>
                     {/* Items Per Page */}
                     <div>
                        <select 
                            className="border border-gray-300 p-2.5 rounded-lg w-full bg-white text-gray-900 focus:ring-primary focus:border-primary shadow-sm font-bold text-sm"
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            <option value={20}>Tampilkan 20 Data</option>
                            <option value={50}>Tampilkan 50 Data</option>
                            <option value={100}>Tampilkan 100 Data</option>
                        </select>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className={tableHeadClass}>MRN</th>
                                    <th className={tableHeadClass}>Nama</th>
                                    <th className={tableHeadClass}>Kegiatan</th>
                                    <th className={tableHeadClass}>Kategori</th>
                                    <th className={tableHeadClass}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(p => {
                                    const actName = activities.find(a => a.id === p.activityId)?.name || 'Unknown';
                                    return (
                                        <tr key={p.id} className={tableRowClass}>
                                            <td className={`${tableCellClass} text-xs font-mono font-bold text-slate-600`}>{p.mrn}</td>
                                            <td className={`${tableCellClass} font-semibold text-gray-900`}>{p.name}</td>
                                            <td className={tableCellClass}>
                                                <button 
                                                    onClick={() => showActivityDetail(p.activityId)}
                                                    className="text-xs text-blue-600 hover:underline text-left"
                                                >
                                                    {actName}
                                                </button>
                                            </td>
                                            <td className={tableCellClass}><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.category === 'MCU' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{p.category}</span></td>
                                            <td className={`${tableCellClass} flex gap-2`}>
                                                <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
                                                <button onClick={() => deletePatient(p.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">Data tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-xs text-gray-500 font-medium">
                                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, flatFiltered.length)} dari {flatFiltered.length} data
                            </div>
                            <div className="flex gap-1 items-center">
                                {/* First & Prev */}
                                <button 
                                    onClick={() => paginate(1)} 
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-100 text-gray-600"
                                    title="Halaman Pertama"
                                >
                                    <ChevronsLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => paginate(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-100 text-gray-600 mr-2"
                                    title="Sebelumnya"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {/* Numbers */}
                                {getPageNumbers().map(pNum => (
                                    <button 
                                        key={pNum} 
                                        onClick={() => paginate(pNum)}
                                        className={`w-8 h-8 rounded-lg border text-sm font-bold flex items-center justify-center transition-colors ${
                                            currentPage === pNum 
                                            ? 'bg-primary text-white border-primary shadow-sm' 
                                            : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {pNum}
                                    </button>
                                ))}

                                {/* Next & Last */}
                                <button 
                                    onClick={() => paginate(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-100 text-gray-600 ml-2"
                                    title="Selanjutnya"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <button 
                                    onClick={() => paginate(totalPages)} 
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-100 text-gray-600"
                                    title="Halaman Terakhir"
                                >
                                    <ChevronsRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 5. RECORD MODE (SIDEBAR FILTER + CONTENT)
    return (
        <div className="flex flex-col md:flex-row gap-6 font-sans h-[calc(100vh-140px)]">
            {/* Left Sidebar Filter */}
            <div className="w-full md:w-64 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col p-4 shrink-0 h-fit md:h-full">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Filter size={18}/> Filter</h3>
                    {(selectedYear || filterName) && (
                        <button 
                            onClick={() => {setSelectedYear(''); setSelectedMonth(''); setFilterName('')}}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                        >
                            <RotateCcw size={12}/> Reset
                        </button>
                    )}
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tahun</label>
                        <select 
                            className="w-full border border-gray-300 p-2 rounded-lg bg-slate-50 font-bold text-gray-700 focus:ring-primary"
                            value={selectedYear} 
                            onChange={e => { setSelectedYear(e.target.value); setSelectedMonth(''); }}
                        >
                            <option value="">-- Pilih Tahun --</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bulan</label>
                        <select 
                            className="w-full border border-gray-300 p-2 rounded-lg bg-slate-50 font-bold text-gray-700 focus:ring-primary"
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            disabled={!selectedYear}
                        >
                            <option value="">-- Semua Bulan --</option>
                            {selectedYear && groupedPatients?.[selectedYear] && Object.keys(groupedPatients[selectedYear]).sort().map(m => (
                                <option key={m} value={m}>{new Date(2000, parseInt(m)-1, 1).toLocaleDateString('id-ID', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cari Pasien</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                            <input 
                                className="w-full border border-gray-300 pl-8 p-2 rounded-lg bg-slate-50 text-sm focus:ring-primary" 
                                placeholder="Nama..."
                                value={filterName}
                                onChange={e => setFilterName(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-auto pt-4 text-xs text-center text-gray-400 border-t border-gray-100 hidden md:block">
                    Pilih filter untuk menampilkan data
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-slate-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><FileText size={18}/> Data Rekam Medis</h3>
                    <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        {selectedYear} {selectedMonth ? ` - ${new Date(2000, parseInt(selectedMonth)-1, 1).toLocaleDateString('id-ID', { month: 'long' })}` : ''}
                    </div>
                </div>
                
                <div className="overflow-y-auto p-4 flex-1 custom-scrollbar space-y-4">
                    {/* Logic to Render Activities based on Filter */}
                    {(!selectedYear || !groupedPatients || !groupedPatients[selectedYear]) ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
                            <Folder size={48} />
                            <p>Silahkan pilih Tahun dan Bulan di panel kiri</p>
                        </div>
                    ) : (
                        Object.keys(groupedPatients[selectedYear]).filter(m => !selectedMonth || m === selectedMonth).map(month => {
                            const monthData = groupedPatients[selectedYear][month];
                            return Object.keys(monthData).map(actId => {
                                const act = activities.find(a => a.id === actId);
                                const pts = monthData[actId];
                                if (!pts.length) return null;

                                return (
                                    <div key={`${month}-${actId}`} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white">
                                        <div className="bg-slate-100 p-3 flex justify-between items-center border-b border-slate-200">
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{act?.name}</h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <Calendar size={12}/> {new Date(2000, parseInt(month)-1, 1).toLocaleDateString('id-ID', { month: 'long' })} 
                                                    <span className="text-slate-300">|</span> 
                                                    <User size={12}/> {act?.host}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">{pts.length} Pasien</span>
                                                <button 
                                                    onClick={() => setPrintListActivity({ activity: act, patients: pts })} 
                                                    className="flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition"
                                                    title="Cetak Laporan Kegiatan"
                                                >
                                                    <Printer size={14}/> Cetak Laporan
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead>
                                                    <tr>
                                                        <th className="p-3 text-xs uppercase font-bold text-gray-500 bg-white border-b border-slate-100">MRN</th>
                                                        <th className="p-3 text-xs uppercase font-bold text-gray-500 bg-white border-b border-slate-100">Nama Pasien</th>
                                                        <th className="p-3 text-xs uppercase font-bold text-gray-500 bg-white border-b border-slate-100 text-center">Jenis</th>
                                                        <th className="p-3 text-xs uppercase font-bold text-gray-500 bg-white border-b border-slate-100 text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {pts.map(p => (
                                                        <tr key={p.id} className="hover:bg-blue-50/50 transition">
                                                            <td className="p-3 font-mono text-xs font-bold text-primary">{p.mrn}</td>
                                                            <td className="p-3">
                                                                <div className="font-medium text-gray-800">{p.name}</div>
                                                                <div className="text-[10px] text-gray-400">{p.gender}, {p.age} Th</div>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.category === 'MCU' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{p.category}</span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <button onClick={() => setViewingPatient(p)} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-primary hover:text-white hover:border-primary transition shadow-sm text-gray-500">
                                                                    <Eye size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            });
                        })
                    )}
                </div>
            </div>
        </div>
    );
};