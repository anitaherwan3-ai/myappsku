
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppState, Officer, Activity, News, Patient, ICD10, CarouselItem, OfficerLog } from './types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
axios.defaults.baseURL = API_BASE_URL;

// --- MOCK DATA UNTUK DEMO ---
const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', name: 'Vaksinasi Massal Gelora Sriwijaya', startDate: '2024-03-20', endDate: '2024-03-22', host: 'Dinkes Prov Sumsel', location: 'Stadion Jakabaring', status: 'On Progress' },
  { id: '2', name: 'Pemeriksaan Kesehatan Driver Ojek Online', startDate: '2024-03-25', endDate: '2024-03-25', host: 'PCC Sumsel', location: 'Kantor Gubernur', status: 'To Do' }
];

const MOCK_NEWS: News[] = [
  { id: '1', title: 'PCC Sumsel Siagakan Ambulans 24 Jam di Jalur Mudik', date: '15 Mar 2024', imageUrl: 'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?q=80&w=1632&auto=format&fit=crop', content: 'Provincial Command Center Sumatera Selatan meningkatkan kesiapsiagaan menghadapi arus mudik lebaran...' },
  { id: '2', title: 'Sosialisasi Pencegahan Stunting di OKI', date: '10 Mar 2024', imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1632&auto=format&fit=crop', content: 'Tim medis PCC bersama relawan melakukan kunjungan ke pelosok desa untuk memberikan edukasi gizi...' }
];

const MOCK_CAROUSEL: CarouselItem[] = [
  { id: '1', title: 'WAR ROOM INTELIJEN KESEHATAN', subtitle: 'Monitoring Data Kesehatan Masyarakat Sumatera Selatan Secara Real-Time', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=1470&auto=format&fit=crop' },
  { id: '2', title: 'LAYANAN GAWAT DARURAT 24/7', subtitle: 'Respon Cepat Tim Medis Command Center Untuk Keselamatan Warga', imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1470&auto=format&fit=crop' }
];

const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', mrn: 'RM-202403-001', activityId: '1', name: 'Budi Santoso', age: 45, gender: 'L', triage: 'Green', category: 'Berobat', visitDate: '2024-03-20', address: 'Palembang', phone: '0812', identityNo: '1671', height: 170, weight: 70, bloodPressure: '120/80', pulse: 80, respiration: 20, temperature: 36.5, bmi: 24.22, bmiStatus: 'Normal', diagnosisName: 'Hipertensi Primer', referralStatus: 'Selesai' },
  { id: 'p2', mrn: 'RM-202403-002', activityId: '1', name: 'Siti Aminah', age: 32, gender: 'P', triage: 'Red', category: 'Berobat', visitDate: '2024-03-20', address: 'Ogan Ilir', phone: '0813', identityNo: '1672', height: 155, weight: 85, bloodPressure: '160/100', pulse: 110, respiration: 24, temperature: 37.8, bmi: 35.38, bmiStatus: 'Obesitas', diagnosisName: 'Krisis Hipertensi', referralStatus: 'Rujuk' }
];

interface AppContextType extends AppState {
  isLoading: boolean;
  isOffline: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  
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
  
  addICD10: (list: ICD10[]) => Promise<void>;
  updateICD10: (item: ICD10) => Promise<void>;
  deleteICD10: (code: string) => Promise<void>;
  
  addCarousel: (c: CarouselItem) => Promise<void>;
  deleteCarousel: (id: string) => Promise<void>;
  
  addLog: (l: OfficerLog) => Promise<void>;
  updateLog: (l: OfficerLog) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Officer | null>(() => {
    const saved = localStorage.getItem('pcc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('pcc_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // States data dengan cache lokal awal
  const [activities, setActivities] = useState<Activity[]>(() => JSON.parse(localStorage.getItem('cache_activities') || JSON.stringify(MOCK_ACTIVITIES)));
  const [officers, setOfficers] = useState<Officer[]>(() => JSON.parse(localStorage.getItem('cache_officers') || '[]'));
  const [news, setNews] = useState<News[]>(() => JSON.parse(localStorage.getItem('cache_news') || JSON.stringify(MOCK_NEWS)));
  const [patients, setPatients] = useState<Patient[]>(() => JSON.parse(localStorage.getItem('cache_patients') || JSON.stringify(MOCK_PATIENTS)));
  const [icd10List, setIcd10List] = useState<ICD10[]>(() => JSON.parse(localStorage.getItem('cache_icd10') || '[]'));
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>(() => JSON.parse(localStorage.getItem('cache_carousel') || JSON.stringify(MOCK_CAROUSEL)));
  const [logs, setLogs] = useState<OfficerLog[]>(() => JSON.parse(localStorage.getItem('cache_logs') || '[]'));

  const [syncQueue, setSyncQueue] = useState<any[]>(() => JSON.parse(localStorage.getItem('sync_queue') || '[]'));

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); processSyncQueue(); };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token]);

  const updateLocalCache = (key: string, data: any) => {
    localStorage.setItem(`cache_${key}`, JSON.stringify(data));
  };

  const fetchPublicData = useCallback(async () => {
    if (!navigator.onLine) { setIsLoading(false); return; }
    try {
      const [resAct, resNews, resCarousel] = await Promise.all([
        axios.get('/activities').catch(() => ({ data: activities })),
        axios.get('/news').catch(() => ({ data: news })), 
        axios.get('/carousel').catch(() => ({ data: carouselItems }))
      ]);
      setActivities(resAct.data); updateLocalCache('activities', resAct.data);
      setNews(resNews.data); updateLocalCache('news', resNews.data);
      setCarouselItems(resCarousel.data); updateLocalCache('carousel', resCarousel.data);
    } catch (e) {
      console.warn("Using offline mock data.");
    } finally {
      setIsLoading(false);
    }
  }, [activities, news, carouselItems]);

  const fetchProtectedData = useCallback(async () => {
    if (!token || !navigator.onLine) return;
    try {
      const [resPat, resOff, resIcd, resLogs] = await Promise.all([
        axios.get('/patients').catch(() => ({ data: patients })),
        axios.get('/officers').catch(() => ({ data: officers })),
        axios.get('/icd10').catch(() => ({ data: icd10List })),
        axios.get('/logs').catch(() => ({ data: logs }))
      ]);
      setPatients(resPat.data); updateLocalCache('patients', resPat.data);
      setOfficers(resOff.data); updateLocalCache('officers', resOff.data);
      setIcd10List(resIcd.data); updateLocalCache('icd10', resIcd.data);
      setLogs(resLogs.data); updateLocalCache('logs', resLogs.data);
    } catch (e) {
      console.warn("Using offline mock data.");
    }
  }, [token, patients, officers, icd10List, logs]);

  useEffect(() => {
    fetchPublicData();
    if (token) fetchProtectedData();
  }, [fetchPublicData, fetchProtectedData, token]);

  const processSyncQueue = async () => {
    const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    if (queue.length === 0) return;
    for (const item of queue) {
        try {
            if (item.method === 'post') await axios.post(item.url, item.data);
            if (item.method === 'put') await axios.put(item.url, item.data);
            if (item.method === 'delete') await axios.delete(item.url);
        } catch (e) {}
    }
    localStorage.setItem('sync_queue', '[]');
    setSyncQueue([]);
  };

  const performAction = async (endpoint: string, method: 'post' | 'put' | 'delete', data: any) => {
    const url = method === 'delete' ? `/${endpoint}/${data.id || data.code}` : (method === 'put' ? `/${endpoint}/${data.id || data.code}` : `/${endpoint}`);
    
    // UPDATE STATE OPTIMISTICALLY FOR PREVIEW
    if (endpoint === 'patients') {
        if (method === 'post') setPatients(prev => [data, ...prev]);
        if (method === 'delete') setPatients(prev => prev.filter(p => p.id !== data.id));
        if (method === 'put') setPatients(prev => prev.map(p => p.id === data.id ? data : p));
    }
    if (endpoint === 'activities') {
        if (method === 'post') setActivities(prev => [data, ...prev]);
        if (method === 'delete') setActivities(prev => prev.filter(p => p.id !== data.id));
    }

    if (!navigator.onLine) {
        const newQueue = [...syncQueue, { endpoint, method, data, url }];
        setSyncQueue(newQueue);
        localStorage.setItem('sync_queue', JSON.stringify(newQueue));
        alert("Offline: Data disimpan secara lokal.");
        return;
    }

    try {
        await axios[method](url, method === 'delete' ? undefined : data);
        fetchProtectedData();
    } catch(e) {
        console.warn("API Error, data cached locally only.");
        updateLocalCache(endpoint, endpoint === 'patients' ? patients : activities);
    }
  };

  const login = async (email: string, pass: string) => {
    // FALLBACK DEMO LOGIN
    if (email === 'admin@pcc.sumsel.go.id' && pass === 'admin123') {
        const demoUser: Officer = {
            id: 'demo-admin',
            email: 'admin@pcc.sumsel.go.id',
            name: 'Administrator PCC',
            teamId: 'ADM-SUMSEL-01',
            role: 'admin'
        };
        setUser(demoUser);
        setToken('demo-token');
        localStorage.setItem('pcc_user', JSON.stringify(demoUser));
        localStorage.setItem('pcc_token', 'demo-token');
        return true;
    }

    try {
      const res = await axios.post('/login', { email, password: pass });
      const data = res.data;
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('pcc_user', JSON.stringify(data.user));
      localStorage.setItem('pcc_token', data.token);
      return true;
    } catch (e) { 
        return false; 
    }
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('pcc_user'); localStorage.removeItem('pcc_token');
  };

  return (
    <AppContext.Provider value={{
      user, activities, officers, news, patients, icd10List, carouselItems, logs, isLoading, isOffline,
      login, logout,
      addActivity: (a) => performAction('activities', 'post', a),
      updateActivity: (a) => performAction('activities', 'put', a),
      deleteActivity: (id) => performAction('activities', 'delete', {id}),
      addPatient: (p) => performAction('patients', 'post', p),
      updatePatient: (p) => performAction('patients', 'put', p),
      deletePatient: (id) => performAction('patients', 'delete', {id}),
      addOfficer: (o) => performAction('officers', 'post', o),
      updateOfficer: (o) => performAction('officers', 'put', o),
      deleteOfficer: (id) => performAction('officers', 'delete', {id}),
      addNews: (n) => performAction('news', 'post', n),
      updateNews: (n) => performAction('news', 'put', n),
      deleteNews: (id) => performAction('news', 'delete', {id}),
      addICD10: async (list) => { 
        setIcd10List(prev => [...prev, ...list]);
        axios.post('/icd10/batch', { list }).catch(() => {});
      },
      updateICD10: (i) => performAction('icd10', 'put', i),
      deleteICD10: (code) => performAction('icd10', 'delete', {code}),
      addCarousel: (c) => performAction('carousel', 'post', c),
      deleteCarousel: (id) => performAction('carousel', 'delete', {id}),
      addLog: (l) => performAction('logs', 'post', l),
      updateLog: (l) => performAction('logs', 'put', l),
      deleteLog: (id) => performAction('logs', 'delete', {id}),
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
