
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
/* Added missing imports for PatientCategory and TriageLevel */
import { AppState, Officer, Activity, News, Patient, ICD10, CarouselItem, OfficerLog, PatientCategory, TriageLevel } from './types';
import axios from 'axios';

// KONFIGURASI API
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';

// --- MOCK DATA UNTUK MODE OFFLINE ---
const DEFAULT_ADMIN: Officer = {
  id: 'offline-admin',
  email: 'admin@pcc.sumsel.go.id',
  name: 'Administrator PCC',
  role: 'admin',
  teamId: 'WAR-ROOM-001'
};

const MOCK_ACTIVITIES: Activity[] = [
  { id: 'act-1', name: 'Simulasi Penanganan Karhutla Sumsel', startDate: '2024-05-01', endDate: '2024-05-31', host: 'BPBD Sumsel', location: 'Ogan Ilir', status: 'On Progress' },
  { id: 'act-2', name: 'Bakti Sosial Kesehatan Palembang', startDate: '2024-05-20', endDate: '2024-05-21', host: 'Dinkes Prov. Sumsel', location: 'Puskesmas Merdeka', status: 'On Progress' },
];

const MOCK_NEWS: News[] = [
  { id: 'n1', title: 'PCC Sumsel Tingkatkan Respon Emergency 24 Jam', date: '2024-05-18', content: 'Gubernur Sumatera Selatan menginstruksikan penguatan koordinasi Command Center untuk menghadapi musim kemarau.', imageUrl: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=1470&auto=format&fit=crop' },
];

const MOCK_CAROUSEL: CarouselItem[] = [
  { id: 'c1', title: 'Province Command Center', subtitle: 'Pusat Kendali Informasi & Respon Cepat Provinsi Sumatera Selatan', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=1470&auto=format&fit=crop' }
];

// DATA PASIEN UNTUK REVIEW (35 Records)
const MOCK_PATIENTS: Patient[] = [
  // BEROBAT - EMERGING/RED/YELLOW
  { id: 'p1', mrn: 'RM-20240501-001', activityId: 'act-1', name: 'Bambang Irawan', identityNo: '1671011212850001', gender: 'L', dateOfBirth: '1985-12-12', age: 38, address: 'Jl. Merdeka No. 10, Palembang', phone: '08127111000', visitDate: '2024-05-01', category: 'Berobat', triage: 'Red', bloodPressure: '180/110', pulse: 105, respiration: 28, temperature: 37.5, height: 168, weight: 80, bmi: 28.34, bmiStatus: 'Gemuk (Overweight)', diagnosisCode: 'I10', diagnosisName: 'Hypertension', subjective: 'Sakit kepala hebat, mual, pandangan kabur.', physicalExam: 'Kesadaran CM, Tekanan darah sangat tinggi.', therapy: 'Amlodipine 10mg, Rujuk Spesialis Jantung.', referralStatus: 'Rujuk' },
  { id: 'p2', mrn: 'RM-20240501-002', activityId: 'act-1', name: 'Siti Aminah', identityNo: '1671015505900002', gender: 'P', dateOfBirth: '1990-05-15', age: 34, address: 'Kenten Laut, Banyuasin', phone: '08127222000', visitDate: '2024-05-02', category: 'Berobat', triage: 'Yellow', bloodPressure: '130/80', pulse: 88, respiration: 22, temperature: 38.9, height: 155, weight: 50, bmi: 20.81, bmiStatus: 'Normal', diagnosisCode: 'A09', diagnosisName: 'Diarrhoea and gastroenteritis', subjective: 'Diare > 5x, lemas, demam.', physicalExam: 'Mata sedikit cekung, turgor kulit melambat.', therapy: 'Oralit, Zinc, Paracetamol.', referralStatus: 'Tidak Rujuk' },
  { id: 'p3', mrn: 'RM-20240501-003', activityId: 'act-2', name: 'Rahmat Hidayat', identityNo: '1671011010700003', gender: 'L', dateOfBirth: '1970-10-10', age: 53, address: 'Plaju, Palembang', phone: '08127333000', visitDate: '2024-05-03', category: 'Berobat', triage: 'Green', bloodPressure: '120/80', pulse: 72, respiration: 18, temperature: 36.6, height: 172, weight: 75, bmi: 25.35, bmiStatus: 'Gemuk (Overweight)', diagnosisCode: 'J00', diagnosisName: 'Common Cold', subjective: 'Batuk pilek sejak 3 hari.', physicalExam: 'Faring hiperemis (-).', therapy: 'Vitamin C, GG, CTM.', referralStatus: 'Tidak Rujuk' },
  { id: 'p4', mrn: 'RM-20240501-004', activityId: 'act-1', name: 'Dewi Sartika', identityNo: '1671014101950004', gender: 'P', dateOfBirth: '1995-01-01', age: 29, address: 'Indralaya, Ogan Ilir', phone: '08127444000', visitDate: '2024-05-04', category: 'Berobat', triage: 'Red', bloodPressure: '100/60', pulse: 110, respiration: 30, temperature: 36.0, height: 160, weight: 45, bmi: 17.58, bmiStatus: 'Kurus (Underweight)', diagnosisCode: 'A01', diagnosisName: 'Typhoid fever', subjective: 'Demam naik turun, nyeri perut hebat.', physicalExam: 'Abdomen supel, nyeri tekan (+).', therapy: 'IVFD RL, Rujuk RS.', referralStatus: 'Rujuk' },
  
  // MCU - VARIOUS RESULTS
  { id: 'p21', mrn: 'MCU-202405-001', activityId: 'act-2', name: 'Agus Setiawan', identityNo: '1601010101880001', gender: 'L', dateOfBirth: '1988-02-12', age: 36, address: 'Prabumulih Tengah', phone: '0813000111', visitDate: '2024-05-10', category: 'MCU', triage: 'Green', bloodPressure: '120/80', pulse: 80, respiration: 20, temperature: 36.5, height: 170, weight: 65, bmi: 22.49, bmiStatus: 'Normal', visusOD: '6/6', visusOS: '6/6', colorBlind: 'Normal', thorax: 'Normal', abdomen: 'Normal', mcuConclusion: 'FIT TO WORK', mcuRecommendation: 'Pertahankan gaya hidup sehat.' },
  { id: 'p22', mrn: 'MCU-202405-002', activityId: 'act-2', name: 'Lia Permata', identityNo: '1601015005920002', gender: 'P', dateOfBirth: '1992-05-20', age: 32, address: 'Sekayu, Musi Banyuasin', phone: '0813000222', visitDate: '2024-05-11', category: 'MCU', triage: 'Green', bloodPressure: '110/70', pulse: 76, respiration: 18, temperature: 36.4, height: 158, weight: 70, bmi: 28.04, bmiStatus: 'Gemuk (Overweight)', visusOD: '6/9', visusOS: '6/9', colorBlind: 'Normal', mcuConclusion: 'FIT WITH NOTE', mcuRecommendation: 'Diet rendah kalori, kacamata koreksi.' },
  { id: 'p23', mrn: 'MCU-202405-003', activityId: 'act-2', name: 'Hendra Wijaya', identityNo: '1601011508800003', gender: 'L', dateOfBirth: '1980-08-15', age: 44, address: 'Lahat City', phone: '0813000333', visitDate: '2024-05-12', category: 'MCU', triage: 'Yellow', bloodPressure: '150/95', pulse: 92, respiration: 22, temperature: 36.7, height: 165, weight: 90, bmi: 33.06, bmiStatus: 'Obesitas', ekgResult: 'LVH Suggestive', mcuConclusion: 'TEMPORARY UNFIT', mcuRecommendation: 'Konsul Jantung, Turunkan BB.' },
];

// Menambahkan data tambahan secara dinamis untuk mencapai 35-40
const generateMoreMocks = () => {
  const categories: PatientCategory[] = ['Berobat', 'MCU'];
  const triages: TriageLevel[] = ['Green', 'Yellow', 'Red'];
  const diagnoses = [
    { code: 'J00', name: 'Common Cold' },
    { code: 'I10', name: 'Hypertension' },
    { code: 'E11', name: 'Diabetes' },
    { code: 'K30', name: 'Dyspepsia' },
    { code: 'A09', name: 'Diarrhoea' }
  ];

  for (let i = 5; i <= 35; i++) {
    const isMcu = i > 15;
    const cat = isMcu ? 'MCU' : 'Berobat';
    const diag = diagnoses[i % diagnoses.length];
    
    MOCK_PATIENTS.push({
      id: `dyn-${i}`,
      mrn: `${isMcu ? 'MCU' : 'RM'}-202405-${String(i).padStart(3, '0')}`,
      activityId: i % 2 === 0 ? 'act-1' : 'act-2',
      name: `Pasien Review ${i}`,
      identityNo: `1671000000000${i}`,
      gender: i % 3 === 0 ? 'P' : 'L',
      dateOfBirth: '1990-01-01',
      age: 20 + (i % 30),
      address: 'Sumatera Selatan Area',
      phone: '0800112233',
      visitDate: `2024-05-${String((i % 25) + 1).padStart(2, '0')}`,
      category: cat as PatientCategory,
      triage: triages[i % 3],
      bloodPressure: '120/80',
      pulse: 70 + (i % 20),
      respiration: 16 + (i % 8),
      temperature: 36.5 + (i % 2),
      height: 160 + (i % 15),
      weight: 50 + (i % 40),
      bmi: 22.5,
      bmiStatus: 'Normal',
      diagnosisCode: isMcu ? undefined : diag.code,
      diagnosisName: isMcu ? undefined : diag.name,
      mcuConclusion: isMcu ? 'FIT' : undefined
    });
  }
};
generateMoreMocks();

interface AppContextType extends AppState {
  isOffline: boolean;
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
  const [isOffline, setIsOffline] = useState(false);

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

  const loadLocal = <T,>(key: string, defaultVal: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  };
  const saveLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

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
      setIsOffline(false);
    } catch (error) {
      console.warn("Koneksi Backend Gagal. Mengaktifkan Mode Demo Offline.");
      setIsOffline(true);
      setActivities(loadLocal('pcc_activities', MOCK_ACTIVITIES));
      setNews(loadLocal('pcc_news', MOCK_NEWS));
      setCarouselItems(loadLocal('pcc_carousel', MOCK_CAROUSEL));
    } finally {
        setIsLoading(false); 
    }
  }, []);

  const fetchProtectedData = useCallback(async () => {
    if (!token && !isOffline) return;
    
    if (isOffline) {
        setPatients(loadLocal('pcc_patients', MOCK_PATIENTS));
        setOfficers(loadLocal('pcc_officers', [DEFAULT_ADMIN]));
        setIcd10List(loadLocal('pcc_icd10', [
            {code: 'A09', name: 'Diarrhoea and gastroenteritis'},
            {code: 'I10', name: 'Essential (primary) hypertension'},
            {code: 'J00', name: 'Acute nasopharyngitis (common cold)'},
            {code: 'E11', name: 'Non-insulin-dependent diabetes mellitus'},
            {code: 'K30', name: 'Dyspepsia'}
        ]));
        setLogs(loadLocal('pcc_logs', []));
        return;
    }

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
      } else {
          setIsOffline(true);
      }
    }
  }, [token, isOffline]);

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
        setIsOffline(false);
        return true;
      }
    } catch (e) {
      if (email === 'admin@pcc.sumsel.go.id' && pass === 'admin123') {
        setUser(DEFAULT_ADMIN);
        setToken('offline-token');
        localStorage.setItem('pcc_user', JSON.stringify(DEFAULT_ADMIN));
        localStorage.setItem('pcc_token', 'offline-token');
        setIsOffline(true);
        return true;
      }
      alert("Login Gagal: Kredensial tidak valid.");
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

  const performAction = async (endpoint: string, method: 'post' | 'put' | 'delete', data: any, localKey: string, localUpdater: (current: any[]) => any[]) => {
    if (!isOffline) {
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
            if (['patients', 'officers', 'icd10', 'logs'].includes(endpoint)) {
                fetchProtectedData();
            } else {
                fetchPublicData();
            }
            return; 
        } catch(e) {
            console.error("API Error, fallback to local cache");
        }
    }
    const current = loadLocal(localKey, []);
    const updated = localUpdater(current);
    saveLocal(localKey, updated);
    
    if (localKey === 'pcc_patients') setPatients(updated as Patient[]);
    if (localKey === 'pcc_activities') setActivities(updated as Activity[]);
    if (localKey === 'pcc_news') setNews(updated as News[]);
    if (localKey === 'pcc_logs') setLogs(updated as OfficerLog[]);
    if (localKey === 'pcc_officers') setOfficers(updated as Officer[]);
    if (localKey === 'pcc_icd10') setIcd10List(updated as ICD10[]);
  };

  const addActivity = async (item: Activity) => performAction('activities', 'post', item, 'pcc_activities', (c) => [...c, item]);
  const updateActivity = async (item: Activity) => performAction('activities', 'put', item, 'pcc_activities', (c) => c.map((x:Activity) => x.id === item.id ? item : x));
  const deleteActivity = async (id: string) => performAction('activities', 'delete', {id}, 'pcc_activities', (c) => c.filter((x:Activity) => x.id !== id));

  const addPatient = async (item: Patient) => performAction('patients', 'post', item, 'pcc_patients', (c) => [...c, item]);
  const updatePatient = async (item: Patient) => performAction('patients', 'put', item, 'pcc_patients', (c) => c.map((x:Patient) => x.id === item.id ? item : x));
  const deletePatient = async (id: string) => performAction('patients', 'delete', {id}, 'pcc_patients', (c) => c.filter((x:Patient) => x.id !== id));

  const addOfficer = async (item: Officer) => performAction('officers', 'post', item, 'pcc_officers', (c) => [...c, item]);
  const updateOfficer = async (item: Officer) => performAction('officers', 'put', item, 'pcc_officers', (c) => c.map((x:Officer) => x.id === item.id ? item : x));
  const deleteOfficer = async (id: string) => performAction('officers', 'delete', {id}, 'pcc_officers', (c) => c.filter((x:Officer) => x.id !== id));

  const addNews = async (item: News) => performAction('news', 'post', item, 'pcc_news', (c) => [item, ...c]);
  const updateNews = async (item: News) => performAction('news', 'put', item, 'pcc_news', (c) => c.map((x:News) => x.id === item.id ? item : x));
  const deleteNews = async (id: string) => performAction('news', 'delete', {id}, 'pcc_news', (c) => c.filter((x:News) => x.id !== id));

  const addCarousel = async (item: CarouselItem) => performAction('carousel', 'post', item, 'pcc_carousel', (c) => [...c, item]);
  const deleteCarousel = async (id: string) => performAction('carousel', 'delete', {id}, 'pcc_carousel', (c) => c.filter((x:CarouselItem) => x.id !== id));

  const addICD10 = async (list: ICD10[]) => {
      if(!isOffline) {
          try { await axios.post('/icd10/batch', { list }); fetchProtectedData(); } catch(e) { 
              const current = loadLocal('pcc_icd10', []);
              saveLocal('pcc_icd10', [...current, ...list]);
          }
      }
  };
  const updateICD10 = async (item: ICD10) => performAction('icd10', 'put', item, 'pcc_icd10', (c) => c.map((x:ICD10) => x.code === item.code ? item : x));
  const deleteICD10 = async (code: string) => performAction('icd10', 'delete', {code}, 'pcc_icd10', (c) => c.filter((x:ICD10) => x.code !== code));

  const addLog = async (item: OfficerLog) => performAction('logs', 'post', item, 'pcc_logs', (c) => [...c, item]);
  const updateLog = async (item: OfficerLog) => performAction('logs', 'put', item, 'pcc_logs', (c) => c.map((x:OfficerLog) => x.id === item.id ? item : x));
  const deleteLog = async (id: string) => performAction('logs', 'delete', {id}, 'pcc_logs', (c) => c.filter((x:OfficerLog) => x.id !== id));

  return (
    <AppContext.Provider value={{
      user, activities, officers, news, patients, icd10List, carouselItems, logs, isOffline, isLoading,
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
