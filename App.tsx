
import React, { useState, ErrorInfo, ReactNode, Component } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardSummary from './components/DashboardSummary';
import NewsDetail from './components/NewsDetail';
import DailyLog from './components/DailyLog';
import PatientMap from './components/PatientMap';
import { useApp } from './context';
import { 
    ManageActivities, ManageOfficers, ManageNews, 
    ManagePatients, ManageICD10, ManageCarousel 
} from './components/DashboardViews';

// Fix: Make children optional to avoid property missing error in JSX usage.
interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

/**
 * Correctly typed ErrorBoundary class component to handle properties and state.
 */
/* Fix: Explicitly use React.Component to ensure inherited 'props' property is recognized by the compiler. */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly initialize state property
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState { 
    return { hasError: true, error }; 
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { 
    console.error(error, errorInfo); 
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 text-center font-black text-slate-800">
          Aplikasi Mengalami Kendala: {this.state.error?.toString()}
        </div>
      );
    }
    /* Fix: 'this.props' is now reliably available through React.Component inheritance. */
    return this.props.children;
  }
}

const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, pass);
    if (success) navigate('/dashboard');
    else setError('Email atau Password salah.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-6 overflow-hidden">
      <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-white/10 dark-input-group">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-2xl shadow-primary/40">P</div>
        </div>
        <h2 className="text-2xl font-black text-white mb-2 text-center italic tracking-tighter uppercase">PCC War Room</h2>
        <p className="text-slate-400 text-[10px] text-center mb-10 uppercase tracking-[0.4em] font-bold">Authentication Required</p>
        
        {error && <div className="bg-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-xs font-bold text-center border border-rose-500/30 animate-shake">{error}</div>}
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Petugas</label>
            <input type="email" required placeholder="name@pcc.sumsel.go.id" className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:ring-2 focus:ring-primary transition-all font-bold" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input type="password" required placeholder="••••••••" className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:ring-2 focus:ring-primary transition-all font-bold" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-light text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4 tracking-widest uppercase text-xs">Otorisasi Akses</button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 hover:text-white transition">Kembali ke Portal Publik</button>
        </div>
      </form>
    </div>
  );
};

// Fixed ProtectedRoute to correctly type children.
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    const { user } = useApp();
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <div className="p-20 text-center font-black">Akses Dibatasi.</div>;
    return <>{children}</>;
};

const App = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute children={<DashboardLayout />} />}>
              <Route index element={<DashboardSummary />} />
              <Route path="logs" element={<DailyLog />} />
              <Route path="icd10" element={<ManageICD10 />} />
              <Route path="patients" element={<ManagePatients mode="edit" />} />
              <Route path="patients/add" element={<ManagePatients mode="add" />} />
              <Route path="patients/map" element={<PatientMap />} />
              <Route path="medical-records" element={<ManagePatients mode="record" />} />
              <Route path="activities" element={<ProtectedRoute allowedRoles={['admin']} children={<ManageActivities />} />} />
              <Route path="officers" element={<ProtectedRoute allowedRoles={['admin']} children={<ManageOfficers />} />} />
              <Route path="news" element={<ProtectedRoute allowedRoles={['admin']} children={<ManageNews />} />} />
              <Route path="carousel" element={<ProtectedRoute allowedRoles={['admin']} children={<ManageCarousel />} />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
};
export default App;
