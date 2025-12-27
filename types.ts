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
  LANDING = 'landing',
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  RECORDING = 'recording',
  EDITOR = 'editor',
  INTEGRATIONS = 'integrations',
  SUBSCRIPTION = 'subscription',
  SETTINGS = 'settings',
  MANUAL = 'manual',
  RESET_PASSWORD = 'reset-password',
  TERMS = 'terms',
  PRIVACY = 'privacy',
  // Admin routes
  ADMIN_OVERVIEW = 'admin-overview',
  ADMIN_USERS = 'admin-users',
  ADMIN_FINANCIALS = 'admin-financials',
  ADMIN_PLANS = 'admin-plans' // <--- NUEVA RUTA AGREGADA
}

// ========== ADMIN TYPES ==========

export interface AdminStats {
  mrr: number;  // Monthly Recurring Revenue
  totalUsers: number;
  activeUsers: number;
  totalMinutesUsed: number;
  estimatedCost: number;
  grossProfit: number;
  mrrGrowth: number; // % vs last month
  userGrowth: number; // % vs last month
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string;
  phoneVerified: boolean;
  planId: 'free' | 'pro' | 'business' | 'business_plus';
  status: 'active' | 'past_due' | 'canceled' | 'banned';
  minutesUsed: number;
  minutesLimit: number;
  usagePercentage: number;
  createdAt: string;
}

export interface PhoneCall {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  from: string;
  to: string;
  duration: string;
  durationSeconds: number;
  cost: number;
  date: string;
}

// ========== DYNAMIC PLANS TYPES (NUEVOS) ==========

export interface PlanLimits {
  transcription_minutes: number;
  call_minutes?: number;
  storage_gb?: number;
  users?: number;
}

export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  stripe_price_id_monthly: string;
  stripe_price_id_annual: string;
  features: string[];
  limits: PlanLimits;
  highlight: boolean;
  badge_text?: string | null;
  is_active: boolean;
  updated_at?: string;
}

export interface AppSetting {
  key: string;
  value: string;
  description?: string;
}