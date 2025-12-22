
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../context';
import { OfficerLog } from '../types';
import { Plus, Edit, Trash2, Printer, X, CalendarDays, MapPin, Clock, Camera, Image as ImageIcon, Search, Filter, User, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const DailyLog = () => {
  const { logs, logsTotal, addLog, deleteLog, user, refreshLogs } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    refreshLogs(currentPage, ITEMS_PER_PAGE);
  }, [currentPage, refreshLogs]);

  const filteredLogs = useMemo(() => {
      return logs.filter(log => {
          if (!startDate && !endDate) return true;
          const logDate = new Date(log.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if (start && logDate < start) return false;
          if (end && logDate > end) return false;
          return true;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, startDate, endDate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setPreviewImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
        id: crypto.randomUUID(),
        officerId: user?.id || '',
        officerName: user?.name || 'Petugas',
        teamId: user?.teamId || '',
        date: f.get('date') as string,
        startTime: f.get('startTime') as string,
        endTime: f.get('endTime') as string,
        activity: f.get('activity') as string,
        location: f.get('location') as string,
        imageUrl: previewImage || undefined
    } as OfficerLog;

    addLog(data);
    setIsAdding(false);
    setPreviewImage(null);
  };

  const labelStyle = "text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block";
  const inputStyle = "w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold";

  const totalPages = Math.ceil(logsTotal / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 pb-20 animate-card">
      {/* ADD LOG MODAL */}
      {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-card">
                  <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                      <h3 className="font-black text-xl text-slate-800 uppercase italic tracking-tighter">Laporan Aktivitas Harian</h3>
                      <button onClick={() => { setIsAdding(false); setPreviewImage(null); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className={labelStyle}>Tanggal</label><input name="date" type="date" required className={inputStyle} defaultValue={new Date().toISOString().split('T')[0]} /></div>
                          <div className="flex gap-2">
                              <div><label className={labelStyle}>Mulai</label><input name="startTime" type="time" required className={inputStyle} /></div>
                              <div><label className={labelStyle}>Selesai</label><input name="endTime" type="time" required className={inputStyle} /></div>
                          </div>
                      </div>
                      <div><label className={labelStyle}>Uraian Pekerjaan / Aktivitas</label><textarea name="activity" rows={3} required placeholder="Apa yang anda kerjakan hari ini?" className={inputStyle}></textarea></div>
                      <div><label className={labelStyle}>Lokasi Operasional</label><input name="location" type="text" required placeholder="Nama posko, kantor, atau lapangan..." className={inputStyle} /></div>
                      <div>
                          <label className={labelStyle}>Unggah Dokumentasi (Opsional)</label>
                          <div onClick={() => fileInputRef.current?.click()} className="w-full h-44 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden relative group">
                              {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : (
                                  <div className="text-center">
                                      <Camera size={40} className="text-slate-300 mx-auto group-hover:text-primary transition-colors"/>
                                      <span className="text-[10px] font-black text-slate-400 mt-3 block uppercase tracking-widest">Klik untuk unggah foto</span>
                                  </div>
                              )}
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                          </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Batalkan</button>
                          <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Simpan Laporan</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
         <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">Logbook <span className="text-primary">Harian</span></h2>
            <p className="text-slate-400 text-sm font-medium">Rekaman kegiatan operasional personil Command Center.</p>
         </div>
         <div className="flex gap-4">
            <button onClick={handlePrint} className="bg-white border px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-sm hover:shadow-md transition active:scale-95"><Printer size={18}/> Cetak Logbook</button>
            <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition"><Plus size={18}/> Lapor Kegiatan</button>
         </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col lg:flex-row items-center gap-6 print:hidden">
          <div className="flex items-center gap-3 text-slate-400 shrink-0">
              <Filter size={18}/>
              <span className="text-[10px] font-black uppercase tracking-widest">Filter Tanggal:</span>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1 w-full">
              <div className="flex items-center gap-3 bg-slate-50 border rounded-2xl px-4 py-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase shrink-0">Mulai</span>
                  <input type="date" className="bg-transparent outline-none w-full text-xs font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 border rounded-2xl px-4 py-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase shrink-0">Sampai</span>
                  <input type="date" className="bg-transparent outline-none w-full text-xs font-bold" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
          </div>
          {(startDate || endDate) && (
              <button onClick={() => {setStartDate(''); setEndDate('');}} className="text-rose-500 font-black text-[10px] uppercase px-4 py-2 hover:bg-rose-50 rounded-xl transition-colors shrink-0">Reset Filter</button>
          )}
      </div>

      {/* PRINT HEADER (ONLY VISIBLE ON PRINT) */}
      <div className="hidden print:block text-center mb-10 border-b-2 border-slate-900 pb-6">
          <h1 className="text-2xl font-black uppercase">LAPORAN AKTIVITAS HARIAN PETUGAS</h1>
          <h2 className="text-lg font-bold uppercase text-slate-600">PROVINCE COMMAND CENTER (PCC) SUMATERA SELATAN</h2>
          <p className="text-xs mt-2 font-mono">Periode: {startDate || 'Awal'} s/d {endDate || 'Sekarang'}</p>
      </div>

      {/* LOG LIST */}
      <div className="grid grid-cols-1 gap-6">
          {filteredLogs.map(log => (
              <div key={log.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row gap-8 transition-all hover:border-primary/20 group print:shadow-none print:rounded-none print:border-slate-200">
                  <div className="w-full md:w-56 shrink-0">
                      <div className="h-40 w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
                          {log.imageUrl ? (
                              <img src={log.imageUrl} className="w-full h-full object-cover" alt="Dokumentasi" />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                  <ImageIcon size={48} className="mb-2"/>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">No Image</span>
                              </div>
                          )}
                      </div>
                      <div className="mt-4 space-y-1">
                          <p className="text-primary font-black text-xs flex items-center gap-2"><CalendarDays size={14}/> {log.date}</p>
                          <p className="text-slate-400 font-mono text-[10px] flex items-center gap-2"><Clock size={12}/> {log.startTime} - {log.endTime}</p>
                      </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                      <div className="mb-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktivitas & Pekerjaan</h4>
                          <p className="text-slate-800 font-bold leading-relaxed text-lg italic tracking-tight uppercase">{log.activity}</p>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm"><MapPin size={12} className="text-primary"/> {log.location}</div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm"><User size={12} className="text-slate-400"/> {log.officerName || 'Unknown'}</div>
                      </div>
                  </div>
                  <div className="flex md:flex-col gap-2 justify-center border-l border-slate-100 pl-8 print:hidden">
                      <button onClick={() => deleteLog(log.id)} className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={24}/></button>
                  </div>
              </div>
          ))}
          {filteredLogs.length === 0 && (
              <div className="p-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200"><CalendarDays size={40}/></div>
                  <h3 className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs italic">Belum ada catatan aktivitas harian</h3>
              </div>
          )}
      </div>

      {/* PAGINATION FOR LOGS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 no-print">
            <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-primary disabled:opacity-30 transition-all bg-white shadow-sm"
            >
                <ChevronLeft size={20} />
            </button>
            <div className="bg-white border px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 shadow-sm">
                Page <span className="text-slate-800">{currentPage}</span> of <span className="text-slate-800">{totalPages}</span>
            </div>
            <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-primary disabled:opacity-30 transition-all bg-white shadow-sm"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}

      {/* FOOTER INFO (ONLY PRINT) */}
      <div className="hidden print:flex justify-between mt-20 px-10">
          <div className="text-center">
              <p className="text-[10px] uppercase font-bold mb-16">Diverifikasi Oleh,</p>
              <p className="text-xs font-black border-t border-slate-900 pt-1">Supervisor PCC</p>
          </div>
          <div className="text-center">
              <p className="text-[10px] uppercase font-bold mb-16">Dilaporkan Oleh,</p>
              <p className="text-xs font-black border-t border-slate-900 pt-1">{user?.name || 'Petugas Pelaksana'}</p>
          </div>
      </div>
    </div>
  );
};
export default DailyLog;
