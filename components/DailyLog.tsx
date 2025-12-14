import React, { useState, useRef } from 'react';
import { useApp } from '../context';
import { OfficerLog } from '../types';
import { Plus, Edit, Trash2, Printer, Filter, Save, X, Calendar, List, CalendarDays } from 'lucide-react';

const DailyLog = () => {
  const { logs, addLog, updateLog, deleteLog, user } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingLog, setEditingLog] = useState<OfficerLog | null>(null);

  // Filter State
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly'); // 'monthly' or 'daily'
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // For Daily Mode
  
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0')); // For Monthly Mode
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString()); // For Monthly Mode
  
  const [selectedOfficer, setSelectedOfficer] = useState<string>(''); // Only for Admin

  // Unique Officers in logs (for Admin Filter)
  const officerNames = Array.from(new Set(logs.map(l => l.officerName).filter(Boolean)));

  // Filtered Logs Logic
  const filteredLogs = logs.filter(l => {
     const matchOfficer = selectedOfficer ? l.officerName === selectedOfficer : true;

     if (viewMode === 'daily') {
         // Filter by specific date
         return l.date === selectedDate && matchOfficer;
     } else {
         // Filter by Month & Year
         const d = new Date(l.date);
         const matchMonth = (d.getMonth() + 1).toString().padStart(2, '0') === selectedMonth;
         const matchYear = d.getFullYear().toString() === selectedYear;
         return matchMonth && matchYear && matchOfficer;
     }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
        date: formData.get('date') as string,
        startTime: formData.get('startTime') as string,
        endTime: formData.get('endTime') as string,
        activity: formData.get('activity') as string,
        location: formData.get('location') as string,
    } as any;

    if (editingLog) {
        updateLog({ ...editingLog, ...data });
        setEditingLog(null);
    } else {
        addLog({ ...data, id: crypto.randomUUID(), officerId: user?.id || '' });
        setIsAdding(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // FORM COMPONENT
  const FormModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {editingLog ? <Edit size={18}/> : <Plus size={18}/>} 
                    {editingLog ? 'Edit Aktivitas' : 'Catat Aktivitas Baru'}
                </h3>
                <button onClick={() => { setIsAdding(false); setEditingLog(null); }} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tanggal</label>
                    <input name="date" type="date" required defaultValue={editingLog?.date || selectedDate} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Waktu Mulai</label>
                        <input name="startTime" type="time" required defaultValue={editingLog?.startTime} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Waktu Selesai</label>
                        <input name="endTime" type="time" required defaultValue={editingLog?.endTime} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Uraian Kegiatan</label>
                    <textarea name="activity" rows={3} required defaultValue={editingLog?.activity} placeholder="Apa yang dilakukan..." className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary"></textarea>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Lokasi</label>
                    <input name="location" type="text" required defaultValue={editingLog?.location} placeholder="Tempat kegiatan..." className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary" />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setIsAdding(false); setEditingLog(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold">Batal</button>
                    <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-secondary shadow-lg flex items-center justify-center gap-2"><Save size={18}/> Simpan</button>
                </div>
            </form>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans">
      {(isAdding || editingLog) && <FormModal />}

      {/* Header & Controls (Hidden on Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-primary"/> Laporan Aktivitas Harian
         </h2>
         <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             <button onClick={() => setIsAdding(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary shadow-md flex items-center justify-center gap-2">
                 <Plus size={18}/> <span className="hidden sm:inline">Tambah Log</span>
             </button>
             <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center justify-center gap-2">
                 <Printer size={18}/> <span className="hidden sm:inline">Cetak Laporan</span>
             </button>
         </div>
      </div>

      {/* Filters (Hidden on Print) */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-200 mb-6 flex flex-wrap gap-4 items-center print:hidden">
          <div className="flex items-center gap-2 text-gray-500 font-bold uppercase text-xs mr-2 border-r border-gray-200 pr-4">
              <Filter size={16}/> Mode:
          </div>
          
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
              <button 
                onClick={() => setViewMode('monthly')} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <CalendarDays size={16}/> Bulanan
              </button>
              <button 
                onClick={() => setViewMode('daily')} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <List size={16}/> Harian
              </button>
          </div>

          {/* Conditional Inputs */}
          {viewMode === 'monthly' ? (
              <>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-slate-50 font-semibold focus:ring-primary">
                    {Array.from({length: 12}, (_, i) => {
                        const m = (i + 1).toString().padStart(2, '0');
                        return <option key={m} value={m}>{new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'long' })}</option>
                    })}
                </select>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-slate-50 font-semibold focus:ring-primary">
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                </select>
              </>
          ) : (
             <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-slate-50 font-semibold focus:ring-primary"
             />
          )}

          {/* Admin Officer Filter */}
          {user?.role === 'admin' && (
              <select value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-slate-50 font-semibold focus:ring-primary min-w-[200px] ml-auto">
                  <option value="">-- Semua Petugas --</option>
                  {officerNames.map(name => <option key={name} value={name as string}>{name}</option>)}
              </select>
          )}
      </div>

      {/* PRINT HEADER (Visible only on print) */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase">Laporan Aktivitas Harian Petugas</h1>
            <h2 className="text-xl font-bold uppercase">Province Command Center (PCC) Sumsel</h2>
            
            {/* Dynamic Date Header */}
            {viewMode === 'monthly' ? (
                <p className="text-sm mt-2 font-bold">Periode: {new Date(parseInt(selectedYear), parseInt(selectedMonth)-1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            ) : (
                <p className="text-sm mt-2 font-bold">Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            )}

            {selectedOfficer && <p className="text-sm font-bold mt-1">Petugas: {selectedOfficer}</p>}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden print:shadow-none print:border-none">
          <table className="w-full text-left border-collapse min-w-[600px] print:w-full print:border print:border-black">
              <thead>
                  <tr className="bg-slate-50 print:bg-gray-100">
                      <th className="p-3 border-b border-gray-200 font-bold text-xs uppercase text-gray-500 w-12 text-center print:border print:border-black print:text-black">No</th>
                      <th className="p-3 border-b border-gray-200 font-bold text-xs uppercase text-gray-500 w-32 print:border print:border-black print:text-black">Hari / Tanggal</th>
                      <th className="p-3 border-b border-gray-200 font-bold text-xs uppercase text-gray-500 w-24 print:border print:border-black print:text-black">Waktu</th>
                      {user?.role === 'admin' && !selectedOfficer && <th className="p-3 border-b border-gray-200 font-bold text-xs uppercase text-gray-500 w-40 print:border print:border-black print:text-black">Petugas</th>}
                      <th className="p-3 border-b border-gray-200 font-bold text-xs uppercase text-gray-500 print:border print:border-black print:text-black">Uraian Kegiatan</th>
                      <th className="p-3 border-b border-gray-200 font-bold text-xs uppercase text-gray-500 w-40 print:border print:border-black print:text-black">Lokasi</th>
                      <th className="p-3 border-b border-gray-200 font-bold text-xs uppercase text-gray-500 w-20 text-center print:hidden">Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
                      <tr key={log.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                          <td className="p-3 border-b border-gray-100 text-sm text-center print:border print:border-black">{idx + 1}</td>
                          <td className="p-3 border-b border-gray-100 text-sm print:border print:border-black">
                              <span className="font-bold block">{new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long' })}</span>
                              <span className="text-xs text-gray-500 print:text-black">{log.date}</span>
                          </td>
                          <td className="p-3 border-b border-gray-100 text-sm font-mono print:border print:border-black">{log.startTime} - {log.endTime}</td>
                          {user?.role === 'admin' && !selectedOfficer && (
                              <td className="p-3 border-b border-gray-100 text-sm print:border print:border-black">
                                  <span className="font-bold block">{log.officerName}</span>
                                  <span className="text-[10px] bg-slate-100 px-1 rounded border border-slate-200 print:border-none print:bg-transparent">{log.teamId}</span>
                              </td>
                          )}
                          <td className="p-3 border-b border-gray-100 text-sm print:border print:border-black whitespace-pre-wrap">{log.activity}</td>
                          <td className="p-3 border-b border-gray-100 text-sm print:border print:border-black">{log.location}</td>
                          <td className="p-3 border-b border-gray-100 text-center print:hidden">
                              <div className="flex justify-center gap-2">
                                  <button onClick={() => setEditingLog(log)} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded"><Edit size={16}/></button>
                                  <button onClick={() => deleteLog(log.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash2 size={16}/></button>
                              </div>
                          </td>
                      </tr>
                  )) : (
                      <tr>
                          <td colSpan={user?.role === 'admin' ? 7 : 6} className="p-8 text-center text-gray-500 italic border border-black print:border">
                              {viewMode === 'daily' 
                                ? `Tidak ada aktivitas tercatat pada tanggal ${new Date(selectedDate).toLocaleDateString('id-ID')}.`
                                : `Tidak ada aktivitas tercatat pada periode ini.`
                              }
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>

      {/* Print Footer Signature */}
      <div className="hidden print:flex mt-12 justify-end break-inside-avoid">
            <div className="w-64 text-center">
                <p className="mb-16">Palembang, {new Date(viewMode === 'daily' ? selectedDate : Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold border-b border-black pb-1 inline-block min-w-[200px]">
                    {selectedOfficer || user?.name || '( ................................... )'}
                </p>
                <p className="text-xs font-bold uppercase mt-1">
                     {selectedOfficer ? 'Petugas Pelaksana' : (user?.role === 'admin' ? 'Mengetahui' : 'Petugas Pelaksana')}
                </p>
            </div>
      </div>
    </div>
  );
};

export default DailyLog;