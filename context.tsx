
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppState, Officer, Activity, News, Patient, ICD10, CarouselItem, OfficerLog, PatientCategory, TriageLevel } from './types';
import axios from 'axios';

// KONFIGURASI API - Mengambil dari environment variable atau default ke /api
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';

interface AppContextType extends AppState {
  isLoading: boolean;
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

  const [activities, setActivities] = useState<Activity[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [icd10List, setIcd10List] = useState<ICD10[]>([]);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [logs, setLogs] = useState<OfficerLog[]>([]);

  useEffect(() => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchPublicData = useCallback(async () => {
    try {
      const [resAct, resNews, resCarousel] = await Promise.all([
        axios.get('/activities'),
        axios.get('/news'), 
        axios.get('/carousel')
      ]);
      
      setActivities(resAct.data.data || resAct.data);
      setNews(resNews.data.data || resNews.data);
      setCarouselItems(resCarousel.data.data || resCarousel.data);
    } catch (error) {
      console.error("Gagal memuat data publik dari server.");
    } finally {
        setIsLoading(false); 
    }
  }, []);

  const fetchProtectedData = useCallback(async () => {
    if (!token) return;

    try {
      const [resPat, resOff, resIcd, resLogs] = await Promise.all([
        axios.get('/patients'),
        axios.get('/officers'),
        axios.get('/icd10'),
        axios.get('/logs')
      ]);
      
      setPatients(resPat.data.data || resPat.data);
      setOfficers(resOff.data.data || resOff.data);
      setIcd10List(resIcd.data.data || resIcd.data);
      setLogs(resLogs.data.data || resLogs.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
      }
      console.error("Gagal memuat data terproteksi.");
    }
  }, [token]);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  useEffect(() => {
    if (user) {
      fetchProtectedData();
    }
  }, [user, fetchProtectedData]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await axios.post('/login', { email, password: pass });
      if (res.status === 200 && res.data.token) {
        const data = res.data;
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('pcc_user', JSON.stringify(data.user));
        localStorage.setItem('pcc_token', data.token);
        return true;
      }
    } catch (e) {
      console.error("Login Error:", e);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pcc_user');
    localStorage.removeItem('pcc_token');
    delete axios.defaults.headers.common['Authorization'];
    setPatients([]);
  };

  const performAction = async (endpoint: string, method: 'post' | 'put' | 'delete', data: any) => {
    try {
        let url = `/${endpoint}`;
        const id = data?.id || data?.code; 
        if (method === 'put' && id) url = `/${endpoint}/${id}`;
        if (method === 'delete') {
            url = `/${endpoint}/${data.id || data.code}`;
            await axios.delete(url);
        } else {
            await axios[method](url, data);
        }
        
        // Refresh data setelah aksi berhasil
        if (['patients', 'officers', 'icd10', 'logs'].includes(endpoint)) {
            fetchProtectedData();
        } else {
            fetchPublicData();
        }
    } catch(e) {
        console.error(`Gagal melakukan aksi ${method} pada ${endpoint}:`, e);
        throw e;
    }
  };

  const addActivity = async (item: Activity) => performAction('activities', 'post', item);
  const updateActivity = async (item: Activity) => performAction('activities', 'put', item);
  const deleteActivity = async (id: string) => performAction('activities', 'delete', {id});

  const addPatient = async (item: Patient) => performAction('patients', 'post', item);
  const updatePatient = async (item: Patient) => performAction('patients', 'put', item);
  const deletePatient = async (id: string) => performAction('patients', 'delete', {id});

  const addOfficer = async (item: Officer) => performAction('officers', 'post', item);
  const updateOfficer = async (item: Officer) => performAction('officers', 'put', item);
  const deleteOfficer = async (id: string) => performAction('officers', 'delete', {id});

  const addNews = async (item: News) => performAction('news', 'post', item);
  const updateNews = async (item: News) => performAction('news', 'put', item);
  const deleteNews = async (id: string) => performAction('news', 'delete', {id});

  const addCarousel = async (item: CarouselItem) => performAction('carousel', 'post', item);
  const deleteCarousel = async (id: string) => performAction('carousel', 'delete', {id});

  const addICD10 = async (list: ICD10[]) => {
      try { 
        await axios.post('/icd10/batch', { list }); 
        fetchProtectedData(); 
      } catch(e) { 
        console.error("Batch ICD10 Error", e);
      }
  };
  const updateICD10 = async (item: ICD10) => performAction('icd10', 'put', item);
  const deleteICD10 = async (code: string) => performAction('icd10', 'delete', {code});

  const addLog = async (item: OfficerLog) => performAction('logs', 'post', item);
  const updateLog = async (item: OfficerLog) => performAction('logs', 'put', item);
  const deleteLog = async (id: string) => performAction('logs', 'delete', {id});

  return (
    <AppContext.Provider value={{
      user, activities, officers, news, patients, icd10List, carouselItems, logs, isLoading,
      login, logout,
      addActivity, updateActivity, deleteActivity,
      addPatient, updatePatient, deletePatient,
      addOfficer, updateOfficer, deleteOfficer,
      addNews, updateNews, deleteNews,
      addICD10, updateICD10, deleteICD10, addCarousel, deleteCarousel,
      addLog, updateLog, deleteLog
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
