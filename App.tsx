import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardSummary from './components/DashboardSummary';
import NewsDetail from './components/NewsDetail'; // Import NewsDetail
import { useApp } from './context';
import { ManageActivities, ManageOfficers, ManageNews, ManagePatients, ManageICD10, ManageCarousel } from './components/DashboardViews';

// Login Page Component (Internal)
const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, pass)) {
      const redirect = searchParams.get('redirect');
      if (redirect === 'register') {
        navigate('/dashboard/patients/add');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Email atau Password salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Login Petugas PCC</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Petugas</label>
            <input 
              type="email" 
              required 
              placeholder="nama@pcc.sumsel.go.id"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white text-gray-900 focus:ring-primary focus:border-primary" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white text-gray-900 focus:ring-primary focus:border-primary" 
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-secondary transition shadow-md">Login</button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-gray-500 text-sm mt-2 hover:text-gray-700 font-medium">Kembali ke Beranda</button>
        </div>
      </form>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
    const { user } = useApp();
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div className="p-8 text-center text-red-600 font-bold">Akses Ditolak. Anda tidak memiliki izin.</div>;
    }
    return <>{children}</>;
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardSummary />} />
            
            {/* New Routes */}
            <Route path="icd10" element={<ManageICD10 />} />
            
            {/* Admin Only */}
            <Route path="activities" element={<ProtectedRoute allowedRoles={['admin']}><ManageActivities /></ProtectedRoute>} />
            <Route path="officers" element={<ProtectedRoute allowedRoles={['admin']}><ManageOfficers /></ProtectedRoute>} />
            <Route path="news" element={<ProtectedRoute allowedRoles={['admin']}><ManageNews /></ProtectedRoute>} />
            <Route path="carousel" element={<ProtectedRoute allowedRoles={['admin']}><ManageCarousel /></ProtectedRoute>} />

            {/* Shared */}
            <Route path="patients" element={<ManagePatients mode="edit" />} />
            <Route path="patients/add" element={<ManagePatients mode="add" />} />
            <Route path="medical-records" element={<ManagePatients mode="record" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;