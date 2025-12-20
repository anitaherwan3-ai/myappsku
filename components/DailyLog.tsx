
import React, { useState, useRef } from 'react';
import { useApp } from '../context';
import { OfficerLog } from '../types';
import { Plus, Edit, Trash2, Printer, X, CalendarDays, MapPin, Clock, Camera, Image as ImageIcon } from 'lucide-react';

const DailyLog = () => {
  const { logs, addLog, deleteLog, user } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setPreviewImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
        id: crypto.randomUUID(),
        officerId: user?.id || '',
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

  const labelStyle = "text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block";
  const inputStyle = "w-full bg-slate-100 border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:bg-white transition-all";

  return (
    <div className="space-y-10 pb-20 animate-card">
      {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-card">
                  <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                      <h3 className="font-black text-xl text-slate-800 uppercase italic tracking-tighter">Laporan Aktivitas Baru</h3>
                      <button onClick={() => { setIsAdding(false); setPreviewImage(null); }} className="p-2 text-slate-400"><X/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className={labelStyle}>Tanggal</label><input name="date" type="date" required className={inputStyle} defaultValue={new Date().toISOString().split('T')[0]} /></div>
                          <div className="flex gap-2">
                              <div><label className={labelStyle}>Mulai</label><input name="startTime" type="time" required className={inputStyle} /></div>
                              <div><label className={labelStyle}>Selesai</label><input name="endTime" type="time" required className={inputStyle} /></div>
                          </div>
                      </div>
                      <div><label className={labelStyle}>Pekerjaan / Aktivitas</label><textarea name="activity" rows={3} required placeholder="Detail pekerjaan..." className={inputStyle}></textarea></div>
                      <div><label className={labelStyle}>Lokasi</label><input name="location" type="text" required placeholder="Nama posko/lokasi..." className={inputStyle} /></div>
                      <div>
                          <label className={labelStyle}>Foto Dokumentasi (Opsional)</label>
                          <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden relative">
                              {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <><Camera size={32} className="text-slate-300"/><span className="text-[10px] font-black text-slate-400 mt-2">Pilih Foto</span></>}
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                          </div>
                      </div>
                      <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Batal</button><button type="submit" className="flex-1 bg-primary text-white py-4 rounded-3xl font-black uppercase text-[10px] shadow-lg">Simpan Laporan</button></div>
                  </form>
              </div>
          </div>
      )}
      
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Logbook <span className="text-primary">Harian</span></h2>
            <p className="text-slate-400 text-sm">Rekaman kegiatan operasional Command Center.</p>
         </div>
         <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-xl shadow-primary/20"><Plus size={18}/> Lapor Kegiatan</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
          {logs.map(log => (
              <div key={log.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-48 shrink-0">
                      {log.imageUrl ? <img src={log.imageUrl} className="w-full h-32 rounded-3xl object-cover border" /> : <div className="w-full h-32 rounded-3xl bg-slate-50 border flex items-center justify-center text-slate-200"><ImageIcon size={32}/></div>}
                      <div className="mt-4"><p className="text-primary font-black text-xs flex items-center gap-2"><CalendarDays size={14}/> {log.date}</p><p className="text-slate-400 font-mono text-[10px]">{log.startTime} - {log.endTime}</p></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                      <p className="text-slate-700 font-bold leading-relaxed mb-4">{log.activity}</p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-4 py-2 rounded-xl w-fit border"><MapPin size={12}/> {log.location}</div>
                  </div>
                  <div className="flex md:flex-col gap-2 justify-center border-l pl-8"><button onClick={() => deleteLog(log.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={20}/></button></div>
              </div>
          ))}
          {logs.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase text-xs italic">Belum ada catatan aktivitas.</div>}
      </div>
    </div>
  );
};
export default DailyLog;
