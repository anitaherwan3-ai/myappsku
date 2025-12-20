
export type Role = 'admin' | 'petugas';

export type ActivityStatus = 'To Do' | 'On Progress' | 'Done';

export type TriageLevel = 'Green' | 'Yellow' | 'Red';

export interface Activity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  host: string;
  location: string;
  status: ActivityStatus;
  latitude?: number;
  longitude?: number;
}

export interface Officer {
  id: string; 
  email: string; 
  name: string;
  teamId: string; 
  password?: string;
  role: Role;
}

export interface OfficerLog {
  id: string;
  officerId: string;
  officerName?: string;
  teamId?: string;
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
  content: string; 
  imageUrl: string; 
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
  mrn: string; 
  activityId: string; 
  name: string;
  
  // Audit Trail
  lastModifiedBy?: string;
  lastModifiedAt?: string;

  // Identity
  dateOfBirth?: string; 
  age: number; 
  gender: 'L' | 'P';
  address: string;
  phone: string;
  identityNo: string; 
  visitDate: string;
  category: PatientCategory;
  
  // Geospatial
  latitude?: number;
  longitude?: number;

  // Vital Signs
  triage: TriageLevel;
  bloodType?: 'A' | 'B' | 'AB' | 'O';
  allergies?: string;
  height: number; 
  weight: number; 
  bloodPressure: string;
  pulse: number;
  respiration: number;
  temperature: number; // Baru
  bmi: number; 
  bmiStatus: string; 

  // Berobat (SOAP)
  historyOfIllness?: string;
  subjective?: string; 
  physicalExam?: string;
  diagnosisCode?: string; 
  diagnosisName?: string; 
  therapy?: string;
  referralStatus?: 'Rujuk' | 'Tidak Rujuk';
  referralNotes?: string;

  // MCU (Detailed)
  visusOD?: string; 
  visusOS?: string; 
  colorBlind?: string; 
  rightEar?: string;
  leftEar?: string;
  nose?: string; 
  teeth?: string;
  tonsil?: string;
  thorax?: string; 
  abdomen?: string;
  varicocele?: string;
  hernia?: string;
  hemorrhoids?: string;
  varicose?: string; 
  extremityDeformity?: string; 
  reflexPupil?: string;
  reflexPatella?: string;
  reflexAchilles?: string;
  
  // Penunjang
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
