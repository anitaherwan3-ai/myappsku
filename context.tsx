import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Officer, Activity, News, Patient, ICD10, CarouselItem } from './types';

// Mock Data
const MOCK_OFFICERS: Officer[] = [
  { id: '1', email: 'admin@pcc.sumsel.go.id', name: 'Administrator', teamId: 'ADM-001', password: 'admin', role: 'admin' },
  { id: '2', email: 'dokter@pcc.sumsel.go.id', name: 'Dr. Budi Santoso', teamId: 'MED-001', password: '123', role: 'petugas' },
];

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', name: 'Pengobatan Masal Palembang', startDate: '2023-10-25', endDate: '2023-10-27', host: 'Dinkes Prov', location: 'Alun-alun', status: 'Done' },
  { id: '2', name: 'MCU Pejabat Pemprov', startDate: '2023-11-10', endDate: '2023-11-12', host: 'Gubernur', location: 'Kantor Gubernur', status: 'On Progress' },
  { id: '3', name: 'Posko Kesehatan Mudik', startDate: '2024-04-01', endDate: '2024-04-15', host: 'Polda Sumsel', location: 'Tol Palindra', status: 'To Do' },
];

const MOCK_ICD10: ICD10[] = [
  { code: 'A00', name: 'Cholera' },
  { code: 'A01', name: 'Typhoid and paratyphoid fevers' },
  { code: 'I10', name: 'Essential (primary) hypertension' },
  { code: 'E11', name: 'Type 2 diabetes mellitus' },
  { code: 'J06', name: 'Acute upper respiratory infections' },
  { code: 'K21', name: 'Gastro-esophageal reflux disease' },
  { code: 'R51', name: 'Headache' },
  { code: 'M54.5', name: 'Low back pain' },
];

const MOCK_CAROUSEL: CarouselItem[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070', title: 'Pelayanan Kesehatan Prima', subtitle: 'PCC Sumsel hadir untuk masyarakat' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053', title: 'Fasilitas Modern', subtitle: 'Didukung teknologi terkini' },
];

// Generate 20 Mock Patients for Dashboard Data
const generateMockPatients = (): Patient[] => {
  const basePatients: Patient[] = [
    {
      id: 'p1', mrn: 'RM-20231025-0001', activityId: '1', name: 'Ahmad Supri', age: 45, gender: 'L', address: 'Jl. Merdeka', phone: '08123', identityNo: '123', visitDate: '2023-10-25', category: 'Berobat',
      height: 170, weight: 70, bloodPressure: '120/80', pulse: 80, respiration: 20, bmi: 24.2, bmiStatus: 'Normal', historyOfIllness: 'Dispepsia',
      subjective: 'Sakit perut', diagnosisCode: 'K21', diagnosisName: 'Gastro-esophageal reflux disease', referralStatus: 'Tidak Rujuk'
    },
    {
      id: 'p2', mrn: 'RM-20231026-0002', activityId: '1', name: 'Siti Aminah', age: 55, gender: 'P', address: 'Jl. Sudirman', phone: '08124', identityNo: '124', visitDate: '2023-10-26', category: 'Berobat',
      height: 155, weight: 65, bloodPressure: '150/90', pulse: 88, respiration: 22, bmi: 27.0, bmiStatus: 'Overweight', historyOfIllness: 'Hipertensi',
      subjective: 'Pusing tengkuk', diagnosisCode: 'I10', diagnosisName: 'Essential (primary) hypertension', referralStatus: 'Rujuk', therapy: 'Amlodipine 5mg'
    },
    {
      id: 'p3', mrn: 'RM-20231026-0003', activityId: '1', name: 'Budi Santoso', age: 30, gender: 'L', address: 'Plaju', phone: '08125', identityNo: '125', visitDate: '2023-10-26', category: 'Berobat',
      height: 175, weight: 80, bloodPressure: '130/80', pulse: 82, respiration: 18, bmi: 26.1, bmiStatus: 'Overweight', historyOfIllness: '-',
      subjective: 'Demam', diagnosisCode: 'A01', diagnosisName: 'Typhoid and paratyphoid fevers', referralStatus: 'Tidak Rujuk'
    },
    {
      id: 'p4', mrn: 'RM-20231110-0004', activityId: '2', name: 'Ir. Joko', age: 50, gender: 'L', address: 'Komp. Pemprov', phone: '08126', identityNo: '126', visitDate: '2023-11-10', category: 'MCU',
      height: 168, weight: 75, bloodPressure: '120/80', pulse: 70, respiration: 18, bmi: 26.5, bmiStatus: 'Overweight', historyOfIllness: '-',
      visusOD: '6/6', visusOS: '6/6', colorBlind: 'Normal', mcuConclusion: 'Sehat', mcuRecommendation: 'Olahraga rutin'
    },
  ];

  for(let i=5; i<=20; i++) {
     const isMcu = i % 4 === 0;
     const date = i % 2 === 0 ? '20231025' : '20231111';
     const dateStr = i % 2 === 0 ? '2023-10-25' : '2023-11-11';
     basePatients.push({
        id: `p${i}`, mrn: `RM-${date}-00${i.toString().padStart(2, '0')}`,
        activityId: i % 2 === 0 ? '1' : '2',
        name: `Pasien ${i}`,
        age: 20 + Math.floor(Math.random() * 50),
        gender: i % 2 === 0 ? 'L' : 'P',
        address: 'Palembang', phone: '081xxx', identityNo: `ID-${i}`,
        visitDate: dateStr,
        category: isMcu ? 'MCU' : 'Berobat',
        height: 160 + (i%20), weight: 60 + (i%20), bloodPressure: '120/80', pulse: 80, respiration: 20, bmi: 22, bmiStatus: 'Normal', historyOfIllness: '-',
        subjective: isMcu ? undefined : 'Keluhan umum',
        diagnosisCode: isMcu ? undefined : (i%3===0 ? 'I10' : (i%3===1 ? 'J06' : 'E11')),
        diagnosisName: isMcu ? undefined : (i%3===0 ? 'Hypertension' : (i%3===1 ? 'ISPA' : 'Diabetes')),
        referralStatus: isMcu ? undefined : (i%5===0 ? 'Rujuk' : 'Tidak Rujuk'),
        mcuConclusion: isMcu ? 'Fit' : undefined
     });
  }

  return basePatients;
}

const MOCK_NEWS: News[] = [
  { id: '1', title: 'Peresmian PCC Sumsel', date: '2023-09-01', content: 'Gubernur meresmikan Province Command Center sebagai pusat data kesehatan terpadu. Acara ini dihadiri oleh berbagai pejabat daerah dan pusat. PCC diharapkan menjadi tolak ukur baru dalam manajemen kesehatan digital di Sumatera Selatan.', imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e3169?auto=format&fit=crop&q=80&w=1000' },
  { id: '2', title: 'Layanan Telemedicine Gratis', date: '2023-10-05', content: 'Masyarakat kini bisa mengakses dokter spesialis melalui aplikasi PCC tanpa dipungut biaya. Program ini bertujuan untuk memeratakan akses kesehatan hingga ke pelosok desa.', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2187d8002faa?auto=format&fit=crop&q=80&w=1000' },
  { id: '3', title: 'Kunjungan Menkes', date: '2023-11-20', content: 'Menteri Kesehatan memuji fasilitas PCC Sumsel yang modern dan terintegrasi.', imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1000' },
];

interface AppContextType extends AppState {
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  // CRUD Actions
  addActivity: (a: Activity) => void;
  updateActivity: (a: Activity) => void;
  deleteActivity: (id: string) => void;
  addPatient: (p: Patient) => void;
  updatePatient: (p: Patient) => void;
  deletePatient: (id: string) => void;
  addOfficer: (o: Officer) => void;
  updateOfficer: (o: Officer) => void;
  deleteOfficer: (id: string) => void;
  addNews: (n: News) => void;
  updateNews: (n: News) => void;
  deleteNews: (id: string) => void;
  
  // New Actions
  addICD10: (list: ICD10[]) => void;
  updateICD10: (item: ICD10) => void;
  deleteICD10: (code: string) => void;
  addCarousel: (c: CarouselItem) => void;
  deleteCarousel: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Officer | null>(() => {
    const saved = localStorage.getItem('pcc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('pcc_activities');
    return saved ? JSON.parse(saved) : MOCK_ACTIVITIES;
  });

  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem('pcc_officers');
    return saved ? JSON.parse(saved) : MOCK_OFFICERS;
  });

  const [news, setNews] = useState<News[]>(() => {
    const saved = localStorage.getItem('pcc_news');
    return saved ? JSON.parse(saved) : MOCK_NEWS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('pcc_patients');
    return saved ? JSON.parse(saved) : generateMockPatients();
  });

  const [icd10List, setIcd10List] = useState<ICD10[]>(() => {
     const saved = localStorage.getItem('pcc_icd10');
     return saved ? JSON.parse(saved) : MOCK_ICD10;
  });

  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>(() => {
     const saved = localStorage.getItem('pcc_carousel');
     return saved ? JSON.parse(saved) : MOCK_CAROUSEL;
  });

  // Persistence
  useEffect(() => localStorage.setItem('pcc_activities', JSON.stringify(activities)), [activities]);
  useEffect(() => localStorage.setItem('pcc_officers', JSON.stringify(officers)), [officers]);
  useEffect(() => localStorage.setItem('pcc_news', JSON.stringify(news)), [news]);
  useEffect(() => localStorage.setItem('pcc_patients', JSON.stringify(patients)), [patients]);
  useEffect(() => localStorage.setItem('pcc_icd10', JSON.stringify(icd10List)), [icd10List]);
  useEffect(() => localStorage.setItem('pcc_carousel', JSON.stringify(carouselItems)), [carouselItems]);

  useEffect(() => {
    if (user) localStorage.setItem('pcc_user', JSON.stringify(user));
    else localStorage.removeItem('pcc_user');
  }, [user]);

  // Actions
  const login = (email: string, pass: string) => {
    const found = officers.find(o => o.email.toLowerCase() === email.toLowerCase() && o.password === pass);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addActivity = (item: Activity) => setActivities([...activities, item]);
  const updateActivity = (item: Activity) => setActivities(activities.map(i => i.id === item.id ? item : i));
  const deleteActivity = (id: string) => setActivities(activities.filter(i => i.id !== id));

  const addPatient = (item: Patient) => setPatients([...patients, item]);
  const updatePatient = (item: Patient) => setPatients(patients.map(i => i.id === item.id ? item : i));
  const deletePatient = (id: string) => setPatients(patients.filter(i => i.id !== id));

  const addOfficer = (item: Officer) => setOfficers([...officers, item]);
  const updateOfficer = (item: Officer) => setOfficers(officers.map(i => i.id === item.id ? item : i));
  const deleteOfficer = (id: string) => setOfficers(officers.filter(i => i.id !== id));

  const addNews = (item: News) => setNews([...news, item]);
  const updateNews = (item: News) => setNews(news.map(i => i.id === item.id ? item : i));
  const deleteNews = (id: string) => setNews(news.filter(i => i.id !== id));

  const addICD10 = (list: ICD10[]) => {
      // Merge unique
      const existingCodes = new Set(icd10List.map(i => i.code));
      const newList = list.filter(i => !existingCodes.has(i.code));
      setIcd10List([...icd10List, ...newList]);
  };
  const updateICD10 = (item: ICD10) => setIcd10List(icd10List.map(i => i.code === item.code ? item : i));
  const deleteICD10 = (code: string) => setIcd10List(icd10List.filter(i => i.code !== code));

  const addCarousel = (c: CarouselItem) => setCarouselItems([...carouselItems, c]);
  const deleteCarousel = (id: string) => setCarouselItems(carouselItems.filter(i => i.id !== id));

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