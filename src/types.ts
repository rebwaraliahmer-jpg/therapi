export type Role = 'client' | 'therapist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  languages?: string[];
  avatar?: string;
  registeredAt: string;
}

export type Specialization = 'anxiety' | 'depression' | 'family' | 'marriage';

export interface Therapist {
  id: string;
  name: string;
  specialty: Specialization;
  languages: string[];
  experience: string;
  onlineStatus: 'online' | 'offline';
  priceSession: number;
  photo: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  isFeatured?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: 'client' | 'therapist';
  text: string;
  timestamp: string;
  seen: boolean;
  fileUrl?: string;
  fileName?: string;
}

export interface Chat {
  id: string;
  clientId: string;
  therapistId: string;
  isPaid: boolean;
  unlockedAt?: string;
  messages: Message[];
  typing?: boolean;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  therapistId?: string;
  therapistName?: string;
  amount: number;
  type: 'session' | 'subscription';
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: 'stripe' | 'paypal';
  timestamp: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface KurdishSoraniTranslations {
  // Navigation & General
  brandName: string;
  tagline: string;
  navHome: string;
  navLogin: string;
  navRegister: string;
  navDashboard: string;
  navAdmin: string;
  navLogout: string;
  langEN: string;
  langKU: string;
  langAR: string;

  // Home Screen
  heroTitle: string;
  heroSub: string;
  heroBtn: string;
  searchTherapists: string;
  searchPlaceholder: string;
  featuredTherapists: string;
  categories: string;
  catAnxiety: string;
  catDepression: string;
  catFamily: string;
  catMarriage: string;
  experienceYears: string;
  sessionPrice: string;
  online: string;
  offline: string;
  startChat: string;
  allSpecialties: string;

  // Pricing
  pricingTitle: string;
  pricingSub: string;
  pricingSession: string;
  pricingSessionDetail: string;
  pricingSubscribe: string;
  pricingSubscribeDetail: string;
  pricingBtn: string;

  // FAQ
  faqTitle: string;
  faqSub: string;

  // Contact
  contactTitle: string;
  contactSub: string;
  contactName: string;
  contactEmail: string;
  contactMsg: string;
  contactSend: string;
  contactSuccess: string;

  // Authentication
  loginTitle: string;
  registerTitle: string;
  usernameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  loginBtn: string;
  registerBtn: string;
  fastDemoSignUp: string;
  haveAccount: string;
  noAccount: string;

  // Dashboard
  welcomeUser: string;
  myChats: string;
  myDoctors: string;
  payments: string;
  settings: string;
  noChatsYet: string;
  noDoctorsYet: string;
  chatUnlocked: string;
  chatLocked: string;
  unlockNow: string;
  lastMessage: string;

  // Chat Panel
  whatsappThemeLabel: string;
  typingIndicator: string;
  messagePlaceholder: string;
  sessionPurchasedTitle: string;
  sessionPurchasedSub: string;
  paymentTitle: string;
  paymentSub: string;
  payStripe: string;
  payPaypal: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  completePayment: string;

  // Extras
  trustTitle: string;
  trustDesc: string;
  securityNotice: string;
}
