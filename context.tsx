import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppState, Officer, Activity, News, Patient, ICD10, CarouselItem } from './types';

// API Configuration
// Logic: Jika di localhost, pakai port 5000. Jika di hosting (domain asli), pakai relative path '/api'
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal ? 'http://localhost:5000/api' : '/api';

// --- MOCK DATA FOR OFFLINE MODE ---
const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', name: 'Pemeriksaan Kesehatan Rutin', startDate: '2024-01-01', endDate: '2024-01-31', host: 'Dinkes Sumsel', location: 'Palembang', status: 'On Progress' },
  { id: '2', name: 'Donor Darah Massal', startDate: '2023-12-15', endDate: '2023-12-15', host: 'PMI', location: 'Indralaya', status: 'Done' }
];
const MOCK_NEWS: News[] = [
    { id: '1', title: 'Peluncuran Sistem PCC', date: '2024-01-01', content: 'Sistem manajemen baru telah diluncurkan untuk meningkatkan layanan kesehatan.', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80' },
    { id: '2', title: 'Kunjungan Gubernur', date: '2023-12-20', content: 'Gubernur meninjau fasilitas kesehatan di daerah terpencil.', imageUrl: 'https://images.unsplash.com/photo-1579684385136-137af7513572?auto=format&fit=crop&w=800&q=80' }
];
const MOCK_CAROUSEL: CarouselItem[] = [
    { id: '1', title: 'Selamat Datang di PCC', subtitle: 'Province Command Center Sumatera Selatan', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80' }
];
const MOCK_OFFICERS: Officer[] = [
    { id: '1', email: 'admin@pcc.sumsel.go.id', name: 'Administrator', teamId: 'ADM-001', password: 'admin', role: 'admin' },
    { id: '2', email: 'petugas@pcc.sumsel.go.id', name: 'Budi Santoso', teamId: 'MED-001', password: 'user', role: 'petugas' }
];

interface AuthResponse {
  token: string;
  user: Officer;
}

interface AppContextType extends AppState {
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  // CRUD Actions
  addActivity: (a: Activity) => Promise<void>;
  updateActivity: (a: Activity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addPatient: (p: Patient) => Promise<void>;
  updatePatient: (p: Patient) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addOfficer: (o: Officer) => Promise<void>;
  updateOfficer: (o: Officer) => Promise<void>;
  deleteOfficer: (id: string) => Promise<void>;
  addNews: (n: News) => Promise<void>;
  updateNews: (n: News) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  
  // New Actions
  addICD10: (list: ICD10[]) => Promise<void>;
  updateICD10: (item: ICD10) => Promise<void>;
  deleteICD10: (code: string) => Promise<void>;
  addCarousel: (c: CarouselItem) => Promise<void>;
  deleteCarousel: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Officer | null>(() => {
    const saved = localStorage.getItem('pcc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('pcc_token'));

  // Helper to load Local Data
  const loadLocal = <T,>(key: string, defaultVal: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  };
  const saveLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const [activities, setActivities] = useState<Activity[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [icd10List, setIcd10List] = useState<ICD10[]>([]);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Helper for Headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  });

  // --- FETCH DATA ---
  const fetchPublicData = useCallback(async () => {
    try {
      // Quick check if backend is reachable with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); 
      // Use HEAD request to check availability
      await fetch(`${API_URL}/activities`, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);

      setIsOffline(false);
      const [resAct, resNews, resCarousel] = await Promise.all([
        fetch(`${API_URL}/activities`),
        fetch(`${API_URL}/content/news`),
        fetch(`${API_URL}/content/carousel`)
      ]);
      
      setActivities(await resAct.json());
      setNews(await resNews.json());
      setCarouselItems(await resCarousel.json());
    } catch (error) {
      console.warn("Backend unavailable or timeout. Switching to Offline Mode.", error);
      setIsOffline(true);
      setActivities(loadLocal('pcc_activities', MOCK_ACTIVITIES));
      setNews(loadLocal('pcc_news', MOCK_NEWS));
      setCarouselItems(loadLocal('pcc_carousel', MOCK_CAROUSEL));
    }
  }, []);

  const fetchProtectedData = useCallback(async () => {
    if (!token && !isOffline) return;
    
    if (isOffline) {
        setPatients(loadLocal('pcc_patients', []));
        setOfficers(loadLocal('pcc_officers', MOCK_OFFICERS));
        setIcd10List(loadLocal('pcc_icd10', []));
        return;
    }

    try {
      const headers = getHeaders();
      const [resPat, resOff, resIcd] = await Promise.all([
        fetch(`${API_URL}/patients`, { headers }),
        fetch(`${API_URL}/officers`, { headers }),
        fetch(`${API_URL}/icd10`, { headers })
      ]);
      
      if(resPat.ok) setPatients(await resPat.json());
      if(resOff.ok) setOfficers(await resOff.json());
      if(resIcd.ok) setIcd10List(await resIcd.json());
    } catch (error) {
      console.warn("Error fetching protected data, falling back local:", error);
      setPatients(loadLocal('pcc_patients', []));
      setOfficers(loadLocal('pcc_officers', MOCK_OFFICERS));
      setIcd10List(loadLocal('pcc_icd10', []));
    }
  }, [token, isOffline]);

  // Initial Load
  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  // Load protected data on login
  useEffect(() => {
    if (user) {
      fetchProtectedData();
    }
  }, [user, fetchProtectedData]);

  // --- ACTIONS ---

  const login = async (email: string, pass: string) => {
    if (isOffline) {
        // Mock Login
        const localOfficers = loadLocal('pcc_officers', MOCK_OFFICERS);
        const validUser = localOfficers.find(o => o.email === email && o.password === pass);
        if (validUser) {
            setUser(validUser);
            setToken('mock-token');
            localStorage.setItem('pcc_user', JSON.stringify(validUser));
            localStorage.setItem('pcc_token', 'mock-token');
            return true;
        }
        return false;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      
      if (res.ok) {
        const data: AuthResponse = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('pcc_user', JSON.stringify(data.user));
        localStorage.setItem('pcc_token', data.token);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login Error (Switching to offline check):", e);
      // Fallback to local check if fetch fails during login
      setIsOffline(true);
      const localOfficers = loadLocal('pcc_officers', MOCK_OFFICERS);
      const validUser = localOfficers.find(o => o.email === email && o.password === pass);
        if (validUser) {
            setUser(validUser);
            setToken('mock-token');
            localStorage.setItem('pcc_user', JSON.stringify(validUser));
            localStorage.setItem('pcc_token', 'mock-token');
            return true;
        }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pcc_user');
    localStorage.removeItem('pcc_token');
    // Clear sensitive data from state
    setPatients([]);
    setOfficers([]);
  };

  // Generic Helpers for CRUD with Offline Fallback
  const performAction = async (
    endpoint: string, 
    method: 'POST' | 'PUT' | 'DELETE', 
    body: any, 
    localKey: string, 
    localUpdater: (current: any[]) => any[]
  ) => {
    if (!isOffline) {
        try {
            const url = method === 'POST' ? `${API_URL}/${endpoint}` : `${API_URL}/${endpoint}/${body?.id || body?.code || body}`;
            const res = await fetch(url, { 
                method, 
                headers: getHeaders(), 
                body: method !== 'DELETE' ? JSON.stringify(body) : undefined 
            });
            if (!res.ok) throw new Error("API Action Failed");
            return;
        } catch(e) {
            console.warn("API Action Failed, falling back to local:", e);
            setIsOffline(true);
        }
    }
    
    // Local Update
    const current = loadLocal(localKey, []);
    const updated = localUpdater(current);
    saveLocal(localKey, updated);
  };

  // --- WRAPPERS ---
  
  // Activities
  const addActivity = async (item: Activity) => {
      await performAction('activities', 'POST', item, 'pcc_activities', (curr) => [...curr, item]);
      if(isOffline) setActivities(prev => [...prev, item]); else fetchPublicData();
  };
  const updateActivity = async (item: Activity) => {
      await performAction('activities', 'PUT', item, 'pcc_activities', (curr) => curr.map((x:Activity) => x.id === item.id ? item : x));
      if(isOffline) setActivities(prev => prev.map(x => x.id === item.id ? item : x)); else fetchPublicData();
  };
  const deleteActivity = async (id: string) => {
      await performAction('activities', 'DELETE', id, 'pcc_activities', (curr) => curr.filter((x:Activity) => x.id !== id));
      if(isOffline) setActivities(prev => prev.filter(x => x.id !== id)); else fetchPublicData();
  };

  // Patients
  const addPatient = async (item: Patient) => {
      await performAction('patients', 'POST', item, 'pcc_patients', (curr) => [...curr, item]);
      if(isOffline) setPatients(prev => [...prev, item]); else fetchProtectedData();
  };
  const updatePatient = async (item: Patient) => {
      await performAction('patients', 'PUT', item, 'pcc_patients', (curr) => curr.map((x:Patient) => x.id === item.id ? item : x));
      if(isOffline) setPatients(prev => prev.map(x => x.id === item.id ? item : x)); else fetchProtectedData();
  };
  const deletePatient = async (id: string) => {
      await performAction('patients', 'DELETE', id, 'pcc_patients', (curr) => curr.filter((x:Patient) => x.id !== id));
      if(isOffline) setPatients(prev => prev.filter(x => x.id !== id)); else fetchProtectedData();
  };

  // Officers
  const addOfficer = async (item: Officer) => {
      await performAction('officers', 'POST', item, 'pcc_officers', (curr) => [...curr, item]);
      if(isOffline) setOfficers(prev => [...prev, item]); else fetchProtectedData();
  };
  const updateOfficer = async (item: Officer) => {
      await performAction('officers', 'PUT', item, 'pcc_officers', (curr) => curr.map((x:Officer) => x.id === item.id ? item : x));
      if(isOffline) setOfficers(prev => prev.map(x => x.id === item.id ? item : x)); else fetchProtectedData();
  };
  const deleteOfficer = async (id: string) => {
      await performAction('officers', 'DELETE', id, 'pcc_officers', (curr) => curr.filter((x:Officer) => x.id !== id));
      if(isOffline) setOfficers(prev => prev.filter(x => x.id !== id)); else fetchProtectedData();
  };

  // News
  const addNews = async (item: News) => {
      await performAction('content/news', 'POST', item, 'pcc_news', (curr) => [item, ...curr]);
      if(isOffline) setNews(prev => [item, ...prev]); else fetchPublicData();
  };
  const updateNews = async (item: News) => {
      await performAction('content/news', 'PUT', item, 'pcc_news', (curr) => curr.map((x:News) => x.id === item.id ? item : x));
      if(isOffline) setNews(prev => prev.map(x => x.id === item.id ? item : x)); else fetchPublicData();
  };
  const deleteNews = async (id: string) => {
      await performAction('content/news', 'DELETE', id, 'pcc_news', (curr) => curr.filter((x:News) => x.id !== id));
      if(isOffline) setNews(prev => prev.filter(x => x.id !== id)); else fetchPublicData();
  };

  // Carousel
  const addCarousel = async (item: CarouselItem) => {
      await performAction('content/carousel', 'POST', item, 'pcc_carousel', (curr) => [...curr, item]);
      if(isOffline) setCarouselItems(prev => [...prev, item]); else fetchPublicData();
  };
  const deleteCarousel = async (id: string) => {
      await performAction('content/carousel', 'DELETE', id, 'pcc_carousel', (curr) => curr.filter((x:CarouselItem) => x.id !== id));
      if(isOffline) setCarouselItems(prev => prev.filter(x => x.id !== id)); else fetchPublicData();
  };

  // ICD10
  const addICD10 = async (list: ICD10[]) => {
      // API supports bulk, local we push spread
      if(!isOffline) {
          try {
             await fetch(`${API_URL}/icd10`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(list) });
             fetchProtectedData();
             return;
          } catch(e) { setIsOffline(true); }
      }
      const current = loadLocal('pcc_icd10', []);
      // dedupe basic check
      const newItems = list.filter(n => !current.find((e:ICD10) => e.code === n.code));
      const updated = [...current, ...newItems];
      saveLocal('pcc_icd10', updated);
      setIcd10List(updated);
  };
  const updateICD10 = async (item: ICD10) => {
      if(!isOffline) {
          try {
             await fetch(`${API_URL}/icd10/${item.code}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(item) });
             fetchProtectedData();
             return;
          } catch(e) { setIsOffline(true); }
      }
      const current = loadLocal('pcc_icd10', []);
      const updated = current.map((x:ICD10) => x.code === item.code ? item : x);
      saveLocal('pcc_icd10', updated);
      setIcd10List(updated);
  };
  const deleteICD10 = async (code: string) => {
      if(!isOffline) {
          try {
             await fetch(`${API_URL}/icd10/${code}`, { method: 'DELETE', headers: getHeaders() });
             fetchProtectedData();
             return;
          } catch(e) { setIsOffline(true); }
      }
      const current = loadLocal('pcc_icd10', []);
      const updated = current.filter((x:ICD10) => x.code !== code);
      saveLocal('pcc_icd10', updated);
      setIcd10List(updated);
  };

  return (
    <AppContext.Provider value={{
      user, activities, officers, news, patients, icd10List, carouselItems,
      login, logout,
      addActivity, updateActivity, deleteActivity,
      addPatient, updatePatient, deletePatient,
      addOfficer, updateOfficer, deleteOfficer,
      addNews, updateNews, deleteNews,
      addICD10, updateICD10, deleteICD10, addCarousel, deleteCarousel
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};