export type UserRole = 'radiologist' | 'physician' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export type CaseStatus = 'critical' | 'review' | 'normal';

export interface Finding {
  id: string;
  label: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  coordinates?: { x: number; y: number; width: number; height: number }; // Percentage based
  explanation: string;
}

export interface TechnicalMetrics {
  exposure: 'Normal' | 'Overexposed' | 'Underexposed';
  sharpness: number; // 0-100
  contrast: number; // 0-100
  snr: number; // Signal to Noise Ratio
  artifactsDetected: boolean;
}

export interface PatientCase {
  id: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Uploaded Image';
  bodyPart: string;
  date: string;
  status: CaseStatus;
  imageUrl: string;
  heatmapUrl?: string; // Simulated heatmap overlay
  findings: Finding[];
  history: string[];
  technicalMetrics?: TechnicalMetrics;
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Sarah Chen', role: 'radiologist', avatar: 'SC' },
  { id: 'u2', name: 'Dr. James Wilson', role: 'physician', avatar: 'JW' },
  { id: 'u3', name: 'Admin', role: 'admin', avatar: 'AD' },
];

export const MOCK_CASES: PatientCase[] = [
  {
    id: 'c1',
    patientName: 'John Doe',
    patientId: 'P-10245',
    age: 45,
    gender: 'M',
    modality: 'X-Ray',
    bodyPart: 'Chest',
    date: '2023-10-25',
    status: 'critical',
    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=1000', // Placeholder X-ray
    heatmapUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=1000&blur=50', // Simulated heatmap (blurred version)
    findings: [
      {
        id: 'f1',
        label: 'Pneumonia',
        confidence: 0.98,
        severity: 'high',
        coordinates: { x: 30, y: 40, width: 25, height: 30 },
        explanation: 'High opacity detected in right lower lobe consistent with consolidation.',
      },
      {
        id: 'f2',
        label: 'Pleural Effusion',
        confidence: 0.85,
        severity: 'medium',
        coordinates: { x: 60, y: 65, width: 20, height: 15 },
        explanation: 'Blunting of costophrenic angle observed.',
      },
    ],
    history: ['2023-01-10: Normal Chest X-Ray', '2022-05-15: Bronchitis'],
  },
  {
    id: 'c2',
    patientName: 'Jane Smith',
    patientId: 'P-10246',
    age: 62,
    gender: 'F',
    modality: 'MRI',
    bodyPart: 'Brain',
    date: '2023-10-24',
    status: 'review',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1000', // Placeholder MRI
    findings: [
      {
        id: 'f3',
        label: 'Mass Effect',
        confidence: 0.72,
        severity: 'medium',
        coordinates: { x: 45, y: 35, width: 15, height: 15 },
        explanation: 'Slight midline shift detected.',
      },
    ],
    history: ['2023-09-01: Headaches reported'],
  },
  {
    id: 'c3',
    patientName: 'Robert Brown',
    patientId: 'P-10247',
    age: 28,
    gender: 'M',
    modality: 'X-Ray',
    bodyPart: 'Chest',
    date: '2023-10-24',
    status: 'normal',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1000', // Another X-ray
    findings: [],
    history: [],
  },
];
