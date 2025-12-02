// User types
export interface User {
  id: number;
  username: string;
  full_name?: string;
  phone: string;
  email?: string;
  role: 'creator' | 'student' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreatorProfile {
  id: number;
  user: User;
  bio?: string;
  referral_key: string;
  bot_link?: string;
  telegram_bot_token?: string;
  leads_count?: number;
  courses_count?: number;
  created_at: string;
}

// Tenant types
export interface Tenant {
  id: number;
  subdomain: string;
  name: string;
  description?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  border_radius: string;
  button_style: 'rounded' | 'pill' | 'square';
  custom_css?: string;
  custom_domain?: string;
  custom_domain_verified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  settings: Record<string, unknown>;
  created_at: string;
}

// Subscription types
export interface Plan {
  id: number;
  name: string;
  plan_type: 'starter' | 'pro' | 'business' | 'enterprise';
  price: number;
  max_courses: number;
  max_students: number;
  storage_gb: number;
  can_custom_logo: boolean;
  can_custom_colors: boolean;
  can_custom_fonts: boolean;
  can_custom_css: boolean;
  can_remove_branding: boolean;
  can_custom_domain: boolean;
  can_email_notifications: boolean;
  can_advanced_analytics: boolean;
  can_export_data: boolean;
  has_priority_support: boolean;
  is_active: boolean;
}

export interface Subscription {
  id: number;
  plan: Plan;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  started_at: string;
  expires_at?: string;
  auto_renew: boolean;
  is_active: boolean;
  days_remaining?: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUsage {
  subscription: Subscription;
  usage: {
    courses: { used: number; limit: number; unlimited: boolean };
    students: { used: number; limit: number; unlimited: boolean };
    storage: { used_gb: number; limit_gb: number };
  };
  features: {
    custom_logo: boolean;
    custom_colors: boolean;
    custom_fonts: boolean;
    custom_css: boolean;
    remove_branding: boolean;
    custom_domain: boolean;
    email_notifications: boolean;
    advanced_analytics: boolean;
    export_data: boolean;
    priority_support: boolean;
  };
}

export interface SubscriptionPayment {
  id: number;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  payment_url?: string;
  plan?: Plan;
  period_start: string;
  period_end: string;
  created_at: string;
  paid_at?: string;
}

// Manual Payment types (для ручной оплаты через скриншот)
export interface PaymentSettings {
  card_number_formatted: string;
  card_holder_name: string;
  manager_phone: string;
  manager_telegram?: string;
  instructions?: string;
}

export interface ManualPayment {
  id: number;
  plan: Plan;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  screenshot?: string;
  user_comment?: string;
  admin_comment?: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface ChangePlanResponse {
  message: string;
  subscription?: Subscription;
  new_plan?: Plan;
  payment_info?: PaymentSettings;
  amount?: number;
  instructions?: string;
}

// Course types
export interface Course {
  id: number;
  creator: User;
  title: string;
  description?: string;
  price: number;
  preview_video_url?: string;
  cover_url?: string;
  is_published: boolean;
  exam_enabled: boolean;
  exam_reset_progress: boolean;
  exam_passing_score: number;
  exam_time_limit?: number;
  installment_threshold?: number;
  trial_video_url?: string;
  trial_video_file_id?: string;
  trial_text?: string;
  lessons_count: number;
  students_count: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
}

export interface LessonMaterial {
  id: number;
  title: string;
  file: string;
  created_at: string;
}

export interface Lesson {
  id: number;
  course: number;
  order_index: number;
  title: string;
  description?: string;
  text_content?: string;
  video?: string;
  preview_video_url?: string;
  full_video_url?: string;
  homework_required: boolean;
  homework_description?: string;
  materials: LessonMaterial[];
  homework_submissions_count?: number;
  has_video?: boolean;
  materials_count?: number;
  created_at: string;
  updated_at?: string;
}

// Lead types
export interface BotLead {
  id: number;
  creator: number;
  creator_name: string;
  telegram_id: number;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  status: 'new' | 'contacted' | 'trial_sent' | 'purchased' | 'rejected';
  interested_course?: number;
  interested_course_title?: string;
  extra_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Payment types
export interface Purchase {
  id: number;
  student: User;
  course: Course;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_type: 'full' | 'installment';
  created_at: string;
}

// Progress types
export interface CourseProgress {
  id: number;
  student: number;
  course: number;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  last_lesson: number;
  started_at: string;
  completed_at?: string;
}

// Auth types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  phone?: string;
  username?: string;
  password: string;
}

export interface RegisterData {
  phone: string;
  password: string;
  role: 'creator' | 'student';
  username?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Dashboard stats
export interface CreatorStats {
  total_courses: number;
  total_students: number;
  total_revenue: number;
  total_leads: number;
  new_leads_today: number;
  courses_with_students: Course[];
}
