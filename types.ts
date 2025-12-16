

export interface NoteItem {
  id: string;
  timestamp: string;
  text: string;
}

export interface MediaItem {
  id: string;
  timestamp: string;
  url: string;
  name: string;
}

export interface TranscriptSegment {
  id: string;
  timestamp: string;
  speaker: string;
  speakerColor: string;
  text: string;
  confidence?: number;
}

export interface Recording {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string; // Formatted string HH:MM:SS
  durationSeconds: number; // Raw seconds for calculations
  status: 'Completed' | 'Processing' | 'Live' | 'Draft';
  tags: string[];
  participants: number;
  audioUrl?: string; // The blob URL
  segments?: TranscriptSegment[]; // The saved transcript
  summary?: string; // The AI generated summary
  folderId?: string; // New field for filtering
  notes?: NoteItem[];
  media?: MediaItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface IntegrationState {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
  description: string;
  color: string;
}

export interface UserSubscription {
  planId: 'free' | 'pro' | 'business' | 'business_plus';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  minutesUsed: number;
  minutesLimit: number; // -1 for unlimited
  storageDaysLimit: number; // 7 for free, -1 for unlimited
}

export interface UserProfile {
  id?: string; // Added for Stripe/DB linking
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // New field
  phoneVerified: boolean; // New field
  avatarUrl: string | null;
  role: string;
  subscription: UserSubscription;
}

export interface Folder {
  id: string;
  name: string;
  type: 'system' | 'user';
  icon: string;
}

export enum AppRoute {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  RECORDING = 'recording',
  EDITOR = 'editor',
  INTEGRATIONS = 'integrations',
  SUBSCRIPTION = 'subscription',
  SETTINGS = 'settings',
  MANUAL = 'manual'
}