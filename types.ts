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
  size?: number;
}

export interface TemporalSegmentMetadata {
  originalFile: string;
  recordedAt: string; // ISO timestamp of when this specific audio was recorded
  speaker: string;
  segmentStartIndex: number; // Index where this audio's segments start
  segmentEndIndex: number; // Index where this audio's segments end
}

export interface RecordingMetadata {
  type?: 'single' | 'multi-audio' | 'continuous';
  segments?: TemporalSegmentMetadata[]; // For multi-audio recordings
  pauses?: Array<{ // For future Phase 2
    pausedAt: string;
    resumedAt: string;
    durationSeconds: number;
  }>;
  attachments?: Array<{
    path: string;
    timestamp: number;
    url: string;
  }>;
  speakers?: string[]; // NEW: Unique list of speaker names for Isabella Context
  audioFileSize?: number; // Size in bytes for storage tracking
}

export interface Folder {
  id: string;
  name: string;
  type: 'system' | 'user';
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptSegment {
  id: string;
  timestamp: string;
  speaker: string;
  speakerProfileId?: string; // Link to a person identity
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
  folderId?: string | null; // Optional link to a folder
  tags: string[];
  participants: number;
  audioUrl?: string; // The blob URL
  segments?: TranscriptSegment[]; // The saved transcript
  summary?: string; // The AI generated summary
  notes?: NoteItem[];
  media?: MediaItem[];
  metadata?: RecordingMetadata; // Temporal metadata for multi-audio and pauses
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MinutePack {
  id: string;
  name: string;
  minutes: number;
  price: number;
  checkout_url: string;
  is_active: boolean;
  order: number;
  created_at?: string;
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
  storageUsed?: number; // bytes
  storageLimit?: number; // bytes
  trialEndsAt?: string; // Manual trial expiration
  usageResetDate?: string; // Next reset date
  extraMinutes?: number; // One-time purchased minutes
}

export interface UserProfile {
  id?: string; // Added for Stripe/DB linking
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // New field
  phoneVerified: boolean; // New field
  timezone?: string; // New field
  language?: 'en' | 'es'; // Interface language persistence
  transcriptionLanguage?: string; // Default transcription language persistence
  integrations?: IntegrationState[]; // NEW: Moved here for unified state
  notificationSettings?: {
    email: {
      newRecording: boolean;
      weeklyDigest: boolean;
      marketing: boolean;
    };
    browser: {
      push: boolean;
    };
  };
  avatarUrl: string | null;
  activeSupportAgentId?: string; // Global assistant persistence
  hasCompletedTour?: boolean; // Global onboarding status

  // ZAPIER INTEGRATION
  zapier_webhook_url?: string | null;
  auto_sync_enabled?: boolean;

  role: string;
  subscription: UserSubscription;
  createdAt?: string; // Account creation date for usage cycle calculation
  lastLoginAt?: string; // ISO timestamp
  lastDeviceType?: string; // Mobile, Desktop, Tablet, etc.
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
  ADMIN_MINUTE_PACKS = 'admin-minute-packs', // NEW
  ADMIN_PLANS = 'admin-plans',
  ADMIN_ANALYTICS = 'admin-analytics',
  INTELLIGENCE = 'intelligence', // NEW: Intelligence Dashboard (testing)
  TRUST = 'trust',
  COOKIES = 'cookies',
  PRICING_COMPARISON = 'pricing-comparison', // NEW
  CONTACT = 'contact', // NEW
  ABOUT = 'about',
  ROADMAP = 'roadmap',
  BLOG = 'blog',
  BLOG_POST = 'blog-post',
  AFFILIATES = 'affiliates', // NEW
  CONFIRM_SUBSCRIPTION = 'confirm-subscription'
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
  // Analytics data (merged from Analytics page)
  revenue?: {
    mrr: number;
    balance: number;
    currency: string;
  };
  costs?: {
    twilio: number;
    google: number;
  };
  planDistribution?: Array<{ name: string; value: number; percentage: number }>;
  deviceDistribution?: Array<{ name: string; value: number }>;
  featureAdoption?: {
    extensionUsage: number;
    multiAudioUsage: number;
    liveUsage: number;
    uploadUsage: number;
    totalRecordings: number;
  };
  usageMetrics?: {
    totalMinutes: number;
    totalStorageGB: number;
    activeRecorders: number;
  };
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
  minutesLimit: number;
  usagePercentage: number;
  minutesUsed: number; // Restored
  storageUsed?: number;
  storageLimit?: number;
  trialEndsAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  lastDeviceType?: string;
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
  description_en?: string | null; // Multilingual support
  price_monthly: number;
  price_annual: number;
  stripe_price_id_monthly: string;
  stripe_price_id_annual: string;
  features: string[];
  features_en?: string[] | null; // Multilingual support
  limits: PlanLimits;
  highlight: boolean;
  badge_text?: string | null;
  is_active: boolean;
  updated_at?: string;
}

export interface AppSetting {
  key: string;
  value: string;
  value_en?: string | null; // Multilingual support
  description?: string;
}

export interface SpeakerProfile {
  id: string;
  userId: string;
  name: string;
  description?: string;
  avatarUrl?: string | null;
  color?: string;
  voiceSignature?: number[]; // Vector embedding for voice (future)
  createdAt: string;
  updatedAt: string;
}
