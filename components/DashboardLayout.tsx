
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { 
    LayoutDashboard, Calendar, Users, FileText, LogOut, 
    FilePlus, Database, Menu, X, 
    ClipboardCheck, WifiOff, Map, Moon, Sun, ShieldAlert,
    ChevronRight, Settings
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, isOffline, patients } = useApp();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({isActive}: {isActive: boolean}) => 
    `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className={`flex h-screen bg-slate-50 font-sans overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar - Production Optimized */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} print:hidden shadow-2xl md:shadow-none`}>
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">P</div>
             <div>
                <h1 className="font-black text-lg leading-none tracking-tighter">PCC CORE</h1>
                <p className="text-[9px] text-slate-500 font-black tracking-[0.2em] mt-1.5 uppercase">Sumatera Selatan</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavLink to="/dashboard" end className={linkClass} onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Inteligensi</div>
          
          <NavLink to="/dashboard/patients/map" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <Map size={18} /> Peta Sebaran
          </NavLink>

          <NavLink to="/dashboard/logs" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <ClipboardCheck size={18} /> Logbook Harian
          </NavLink>

          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Data Medis</div>
          
          <NavLink to="/dashboard/patients/add" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <FilePlus size={18} /> Pendaftaran
          </NavLink>

          <NavLink to="/dashboard/patients" end className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <Users size={18} /> Registry Pasien
          </NavLink>

          <NavLink to="/dashboard/medical-records" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <FileText size={18} /> Rekam Medis
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Master</div>
              <NavLink to="/dashboard/activities" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <Calendar size={18} /> Kegiatan
              </NavLink>
              <NavLink to="/dashboard/officers" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <Users size={18} /> Petugas
              </NavLink>
              <NavLink to="/dashboard/icd10" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                <Database size={18} /> ICD-10 Library
              </NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer - Cleaned (No Critical Alert) */}
        <div className="p-4 border-t border-slate-800/50 space-y-3">
           <div className="bg-slate-800/50 rounded-[24px] p-3 flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-black text-sm text-primary border border-slate-700">
                   {user?.name.charAt(0)}
               </div>
               <div className="overflow-hidden flex-1">
                   <p className="text-xs font-black truncate text-white uppercase tracking-tighter">{user?.name}</p>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{user?.role}</p>
               </div>
               <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 hover:text-white transition">
                   {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
               </button>
           </div>
           
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-3 text-rose-400 hover:text-white hover:bg-rose-500/10 rounded-2xl w-full transition font-black text-[11px] uppercase tracking-widest border border-rose-500/20 group">
            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-20 shrink-0 print:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 p-2.5 bg-slate-50 rounded-xl active:scale-95 transition"><Menu size={20}/></button>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="font-black text-slate-800 text-xs tracking-[0.2em] uppercase">PCC WAR ROOM</span>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs text-primary">{user?.name.charAt(0)}</div>
        </div>

        {isOffline && (
            <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest print:hidden animate-fade-in shadow-lg relative z-30">
                <WifiOff size={14} />
                <span>Mode Offline Aktif - Data Disimpan Secara Lokal</span>
            </div>
        )}

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar relative z-10">
           {/* Decorative background element for War Room feel */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
           <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default DashboardLayout;
