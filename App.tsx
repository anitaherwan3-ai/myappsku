
import React, { useState, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardSummary from './components/DashboardSummary';
import NewsDetail from './components/NewsDetail';
import DailyLog from './components/DailyLog';
import PatientMap from './components/PatientMap';
import { useApp } from './context';
import { ManageActivities, ManageOfficers, ManageNews, ManagePatients, ManageICD10, ManageCarousel } from './components/DashboardViews';

interface ErrorBoundaryProps {
  children?: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Aplikasi Mengalami Kendala</h1>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-auto text-xs font-mono mb-6">
              {this.state.error?.toString()}
            </div>
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary transition">Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('admin@pcc.sumsel.go.id');
  const [pass, setPass] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, pass);
    if (success) {
      const redirect = searchParams.get('redirect');
      if (redirect === 'register') {
        navigate('/dashboard/patients/add');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Akses ditolak: Kredensial tidak valid.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_#0d9488_0%,_transparent_60%)]"></div>
      <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-lg shadow-primary/20">P</div>
        </div>
        <h2 className="text-2xl font-black text-white mb-2 text-center">WAR ROOM PCC</h2>
        <p className="text-slate-400 text-sm text-center mb-6 uppercase tracking-widest font-bold">Sumatera Selatan</p>
        
        {error && <div className="bg-rose-500/20 border border-rose-500/40 text-rose-400 p-4 rounded-2xl mb-6 text-xs font-bold animate-shake">{error}</div>}
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">Email Command Center</label>
            <input type="email" required placeholder="name@pcc.gov" className="w-full rounded-2xl bg-white/5 border border-white/10 p-3.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">Access Token / Password</label>
            <input type="password" required className="w-full rounded-2xl bg-white/5 border border-white/10 p-3.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
              <p className="text-[10px] font-bold text-primary uppercase mb-1">Tes Kredensial (Offline Mode):</p>
              <code className="text-[10px] text-white/80 block">Email: admin@pcc.sumsel.go.id</code>
              <code className="text-[10px] text-white/80 block">Pass: admin123</code>
          </div>

          <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black hover:bg-secondary transition shadow-xl shadow-primary/20 active:scale-95">OTORISASI AKSES</button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-slate-500 text-[10px] mt-2 hover:text-white font-black uppercase tracking-widest">KEMBALI KE PORTAL PUBLIK</button>
        </div>
      </form>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { children?: ReactNode, allowedRoles?: string[] }) => {
    const { user } = useApp();
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div className="p-8 text-center text-red-600 font-bold">Akses Dibatasi.</div>;
    }
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
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardSummary />} />
              <Route path="logs" element={<DailyLog />} />
              <Route path="icd10" element={<ManageICD10 />} />
              
              <Route path="activities" element={<ProtectedRoute allowedRoles={['admin']}><ManageActivities /></ProtectedRoute>} />
              <Route path="officers" element={<ProtectedRoute allowedRoles={['admin']}><ManageOfficers /></ProtectedRoute>} />
              <Route path="news" element={<ProtectedRoute allowedRoles={['admin']}><ManageNews /></ProtectedRoute>} />
              <Route path="carousel" element={<ProtectedRoute allowedRoles={['admin']}><ManageCarousel /></ProtectedRoute>} />

              <Route path="patients" element={<ManagePatients mode="edit" />} />
              <Route path="patients/add" element={<ManagePatients mode="add" />} />
              <Route path="patients/map" element={<PatientMap />} />
              <Route path="medical-records" element={<ManagePatients mode="record" />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
