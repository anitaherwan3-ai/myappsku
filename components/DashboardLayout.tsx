
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { 
    LayoutDashboard, Calendar, Users, FileText, LogOut, 
    FilePlus, Database, Menu, X, 
    ClipboardCheck, Map, ShieldAlert,
    Wifi, WifiOff, Newspaper, Image as ImageIcon
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, isOffline } = useApp();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const linkClass = ({isActive}: {isActive: boolean}) => 
    `flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-2' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-secondary text-white flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-2xl md:shadow-none`}>
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">P</div>
             <div>
                <h1 className="font-black text-sm leading-tight tracking-tight uppercase">PCC Management System</h1>
                <p className="text-[9px] text-primary font-black tracking-widest mt-0.5 uppercase">Sumatera Selatan</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink to="/dashboard" end className={linkClass} onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <div className="pt-8 pb-4 px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Intelijen & Log</div>
          <NavLink to="/dashboard/patients/map" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <Map size={18} /> Peta Sebaran
          </NavLink>
          <NavLink to="/dashboard/logs" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <ClipboardCheck size={18} /> Logbook Harian
          </NavLink>

          <div className="pt-8 pb-4 px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pelayanan Medis</div>
          <NavLink to="/dashboard/patients/add" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <FilePlus size={18} /> Pendaftaran Baru
          </NavLink>
          <NavLink to="/dashboard/patients" end className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <Users size={18} /> Registry Pasien
          </NavLink>
          <NavLink to="/dashboard/medical-records" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <FileText size={18} /> Rekam Medis
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <div className="pt-8 pb-4 px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Konfigurasi Sistem</div>
              <NavLink to="/dashboard/activities" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <Calendar size={18} /> Master Kegiatan
              </NavLink>
              <NavLink to="/dashboard/officers" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <Users size={18} /> Manajemen Petugas
              </NavLink>
              <NavLink to="/dashboard/icd10" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                <Database size={18} /> Library ICD-10
              </NavLink>
              <NavLink to="/dashboard/news" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                <Newspaper size={18} /> Manajemen Berita
              </NavLink>
              <NavLink to="/dashboard/carousel" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                <ImageIcon size={18} /> Konfigurasi Carousel
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
           <div className="bg-white/5 rounded-3xl p-4 flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary">
                   {user?.name.charAt(0)}
               </div>
               <div className="overflow-hidden">
                   <p className="text-xs font-black truncate text-white uppercase tracking-tighter">{user?.name}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase">{user?.role}</p>
               </div>
           </div>
           
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center justify-center gap-2 py-4 text-rose-400 hover:text-white hover:bg-rose-500 rounded-2xl w-full transition font-black text-[11px] uppercase tracking-widest border border-rose-500/20 active:scale-95">
            <LogOut size={16} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className={`h-1 w-full transition-colors ${isOffline ? 'bg-rose-500' : 'bg-primary'}`}></div>
        
        <div className="bg-white/70 backdrop-blur-md border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 z-40 shrink-0 px-8">
            <div className="flex items-center gap-6">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-600 p-2.5 bg-slate-100 rounded-xl active:scale-95 transition"><Menu size={20}/></button>
                <div>
                    <h2 className="text-slate-800 font-black text-xl uppercase tracking-tighter italic">PCC <span className="text-primary">Management System</span></h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        {isOffline ? <WifiOff size={12} className="text-rose-500" /> : <Wifi size={12} className="text-primary" />} 
                        {isOffline ? 'Mode Offline' : 'Sistem Terhubung'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Terakhir</span>
                    <span className="text-xs font-black text-slate-700">{new Date().toLocaleTimeString('id-ID')}</span>
                </div>
                <div className="w-px h-8 bg-slate-200 mx-2"></div>
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xl shadow-slate-200 uppercase">{user?.role.charAt(0)}</div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-50/50">
           <Outlet />
        </div>
      </main>

      {isSidebarOpen && (
          <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default DashboardLayout;
