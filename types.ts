
export type Role = 'admin' | 'petugas';

export type ActivityStatus = 'To Do' | 'On Progress' | 'Done';

export interface Activity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  host: string;
  location: string;
  status: ActivityStatus;
}

export interface Officer {
  id: string; // Internal UUID
  email: string; // Login Credential
  name: string;
  teamId: string; // Badge ID / NIP
  password: string; // Plaintext for simulation
  role: Role;
}

export interface OfficerLog {
  id: string;
  officerId: string;
  officerName?: string; // Filled via join/logic
  teamId?: string; // Filled via join
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
}

export interface News {
  id: string;
  title: string;
  date: string;
  content: string; // Keterangan Berita
  imageUrl: string; // Dokumentasi
}

export interface CarouselItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export interface ICD10 {
  code: string;
  name: string;
}

export type PatientCategory = 'Berobat' | 'MCU';

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number (Auto generated)
  activityId: string; // Link to Activity
  name: string;
  
  // Audit Trail
  lastModifiedBy?: string;
  lastModifiedAt?: string;

  // New Identity Fields
  dateOfBirth?: string; // YYYY-MM-DD
  age: number; // Calculated
  gender: 'L' | 'P';
  address: string;
  phone: string;
  identityNo: string; // KTP/ID
  visitDate: string;
  category: PatientCategory;
  
  // Vitals (Common)
  height: number; // cm
  weight: number; // kg
  bloodPressure: string;
  pulse: number;
  respiration: number;
  bmi: number; // Auto
  bmiStatus: string; // Auto
  historyOfIllness: string;

  // Berobat Specific
  subjective?: string; // Anamnesis
  physicalExam?: string;
  diagnosisCode?: string; // Link to ICD10 code
  diagnosisName?: string; // Redundant but easier for display
  therapy?: string;
  referralStatus?: 'Rujuk' | 'Tidak Rujuk';

  // MCU Specific
  visusOD?: string; // Mata Kanan
  visusOS?: string; // Mata Kiri
  colorBlind?: string; // Buta Warna
  rightEar?: string;
  leftEar?: string;
  nose?: string; // Hidung
  teeth?: string;
  tonsil?: string;
  
  // MCU Internal
  thorax?: string; // Jantung & Paru
  abdomen?: string;

  // MCU Surgical/Genital
  varicocele?: string;
  hernia?: string;
  hemorrhoids?: string;
  
  // MCU Extremities & Neuro
  varicose?: string; // Varises
  extremityDeformity?: string; // Deformitas Alat Gerak
  reflexPupil?: string;
  reflexPatella?: string;
  reflexAchilles?: string;
  
  // MCU Supporting
  ekgResult?: string;
  xrayResult?: string;
  labSummary?: string;
  mcuConclusion?: string;
  mcuRecommendation?: string;
}

export interface AppState {
  user: Officer | null;
  activities: Activity[];
  officers: Officer[];
  news: News[];
  patients: Patient[];
  icd10List: ICD10[];
  carouselItems: CarouselItem[];
  logs: OfficerLog[];
}