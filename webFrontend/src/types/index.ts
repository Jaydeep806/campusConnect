export type UserRole = 'student' | 'club' | 'admin' | 'guest';

export interface UserProfile {
  id: string;
  role: UserRole;
  email?: string;
  fullName?: string;
  username?: string;
  clubName?: string;
  representative?: string;
  batchYear?: number;
  universityRollNumber?: string;
  phoneNumber?: string;
  foundedYear?: number;
  approvalStatus?: string;
  avatarUrl?: string;
}

export interface SocietyMember {
  name: string;
  role: string;
  batchYear?: number;
  department?: string;
  imageUrl?: string;
  linkedinUrl?: string;
}

export interface RecruitmentPosition {
  title: string;
  seats: number;
}

export interface SocietyRecruitment {
  id?: string;
  isOpen: boolean;
  title: string;
  description?: string;
  lastDate?: string;
  mode?: 'Google Form' | 'Internal Portal' | string;
  googleFormUrl?: string;
  positions: RecruitmentPosition[];
}

export interface SocietyItem {
  id: string;
  name: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Social' | 'Creative' | 'Startup' | 'Academic' | 'Other';
  tagline: string;
  about: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatWeDo?: string[];
  focusTags?: string[];
  memberCount: number;
  memberCountsByYear?: { batchYear: number; label: string; count: number }[];
  logoText: string;
  logoBg: string;
  verified: boolean;
  foundedYear: number;
  websiteUrl: string;
  socialLinks: { platform: string; url: string; icon?: string }[];
  currentHead?: {
    name: string;
    role: string;
    yearAndDept: string;
    avatarUrl?: string;
    email?: string;
    linkedin?: string;
    instagram?: string;
  };
  team?: SocietyMember[];
  recruitment?: SocietyRecruitment | null;
  hasOpenRecruitment?: boolean;
}

export interface EventItem {
  id: string;
  _id?: string;
  startsAt?: string;
  societyId: string;
  societyName: string;
  societyLogoText: string;
  title: string;
  summary: string;
  description: string;
  dateTime: string;
  location: string;
  mode: 'in-person' | 'online' | 'hybrid';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  registrationUrl?: string;
  participantsCount?: number;
  coverImageUrl?: string;
}

export interface ApplicationItem {
  id: string;
  studentId: string;
  studentName: string;
  departmentAndYear: string;
  societyId: string;
  societyName: string;
  positionTitle: string;
  status: 'pending' | 'shortlisted' | 'selected' | 'rejected';
  appliedDate: string;
  email: string;
  phone: string;
  decisionNote?: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  societyName?: string;
  isGlobal: boolean;
  publishedAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
