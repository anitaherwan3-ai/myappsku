import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { LayoutDashboard, Calendar, Users, FileText, LogOut, FilePlus, Database, Image as ImageIcon, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
      return <div className="p-10 text-center">Unauthorized</div>;
  }

  const linkClass = ({isActive}: {isActive: boolean}) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-2xl print:hidden`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-gradient-to-tr from-primary to-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">P</div>
             <div>
                <h1 className="font-bold text-lg tracking-tight leading-none">PCC Admin</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider">MANAGEMENT SYSTEM</p>
             </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1 bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 shrink-0">
          <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">User Aktif</p>
          <div className="flex items-center justify-between">
             <span className="text-sm font-semibold text-slate-200 truncate max-w-[150px]">{user.name}</span>
             <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 uppercase tracking-wide font-bold">{user.role}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavLink to="/dashboard" end className={linkClass} onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pasien & Medis</div>
          
          <NavLink to="/dashboard/patients/add" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <FilePlus size={20} /> Pendaftaran Baru
          </NavLink>

          <NavLink to="/dashboard/patients" end className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <Users size={20} /> Database Pasien
          </NavLink>

           <NavLink to="/dashboard/medical-records" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
             <FileText size={20} /> Rekam Medis
          </NavLink>

          {user.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Master Data</div>
              <NavLink to="/dashboard/activities" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <Calendar size={20} /> Kegiatan
              </NavLink>
              <NavLink to="/dashboard/officers" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <Users size={20} /> Petugas
              </NavLink>
              <NavLink to="/dashboard/icd10" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                <Database size={20} /> Kode ICD-10
              </NavLink>

              <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Konten Web</div>
              <NavLink to="/dashboard/news" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <FileText size={20} /> Berita
              </NavLink>
              <NavLink to="/dashboard/carousel" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
                  <ImageIcon size={20} /> Banner Depan
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg w-full transition font-medium border border-transparent hover:border-red-900/50">
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
         {/* Mobile Header */}
         <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 p-1 active:bg-slate-100 rounded">
                  <Menu size={24} />
                </button>
                <span className="font-bold text-slate-800 text-lg">PCC Sumsel</span>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                {user.name.charAt(0)}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 md:p-8 print:p-0 print:overflow-visible custom-scrollbar">
            <div className="max-w-7xl mx-auto min-h-full">
                <Outlet />
            </div>
         </div>
      </main>
    </div>
  );
};

export default DashboardLayout;