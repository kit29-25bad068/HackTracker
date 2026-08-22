export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  department: string;
  year: string;
  avatar?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  college?: string | null;
  location?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  portfolioUrl?: string | null;
  devpostUrl?: string | null;
  trustScore: number;
  points: number;
  finalScore: number;
  currentRank: number;
  rankChange: number;
  winsCount: number;
  twoFactorEnabled?: boolean;
  is2faEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
  privacySettings?: PrivacySetting;
}

export interface PrivacySetting {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | 'CAMPUS' | string;
  emailVisibility: boolean;
  projectsVisibility: boolean;
  achievementsVisibility: boolean;
  rankVisibility: boolean;
  skillsVisibility: boolean;
  shareWithRecruiters: boolean;
  shareWithOrganizers: boolean;
}

export interface Hackathon {
  id: string;
  title: string;
  slug: string;
  platform: 'Unstop' | 'Devpost' | 'HackerEarth' | 'MLH' | 'Kaggle' | string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  description: string;
  websiteUrl: string;
  registrationUrl: string;
  locationType: 'Online' | 'Offline' | 'Hybrid' | string;
  city?: string | null;
  country?: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  submissionDeadline: string;
  prizePool: string;
  prizePoolValue: number;
  prizeBreakdown?: string | null;
  theme: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert' | string;
  department: string;
  teamSizeMin: number;
  teamSizeMax: number;
  participantCount: number;
  rating: number;
  judgingCriteria?: string | null;
  eligibility?: string | null;
  isFeatured: boolean;
  isSaved?: boolean;
  reviews?: HackathonReview[];
}

export interface HackathonReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    username: string;
    avatar?: string | null;
  };
}

export interface Project {
  id: string;
  userId: string;
  hackathonId?: string | null;
  hackathonCustomName?: string | null;
  title: string;
  tagline?: string | null;
  description: string;
  projectUrl?: string | null;
  githubUrl?: string | null;
  techStack: string | string[];
  isSolo: boolean;
  teamId?: string | null;
  status: 'Registered' | 'Participated' | 'Submitted' | 'Winner' | string;
  certificateUrl?: string | null;
  isVerified: boolean;
  verificationDate?: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  hackathon?: Hackathon | null;
  team?: Team | null;
  certificate?: Certificate | null;
}

export interface Certificate {
  id: string;
  projectId: string;
  userId: string;
  fileUrl: string;
  rawOcrText?: string | null;
  extractedName?: string | null;
  extractedHackathon?: string | null;
  extractedAchievement?: string | null;
  extractedDate?: string | null;
  confidenceScore: number;
  status: 'VERIFIED' | 'UNVERIFIED' | 'REJECTED' | string;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  leaderId: string;
  department: string;
  totalPoints: number;
  averageTrust: number;
  winsCount: number;
  createdAt: string;
  leader?: User;
  members?: TeamMember[];
  projects?: Project[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'LEADER' | 'MEMBER' | 'Leader' | string;
  status: 'ACTIVE' | 'INVITED' | 'PENDING' | string;
  joinedAt: string;
  user: User;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Expert' | string;
  endorsementCount: number;
  skill: Skill;
  endorsements?: SkillEndorsement[];
}

export interface SkillEndorsement {
  id: string;
  userSkillId: string;
  endorserId: string;
  endorser: {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
  };
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | string;
  category: string;
  pointsAward: number;
  unlockedAt?: string;
}

export interface Milestone {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  icon: string;
  achievedAt?: string;
  isAchieved?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type Notification = NotificationItem;

export interface EmailLog {
  id: string;
  userId: string;
  recipientEmail: string;
  toEmail?: string;
  subject: string;
  templateType: string;
  contentHtml?: string;
  htmlContent?: string;
  status: string;
  sentAt: string;
}

export interface IntegrationStatus {
  platform: string;
  isConnected: boolean;
  profileUrl?: string | null;
  externalUsername?: string | null;
  lastSyncedAt?: string | null;
  syncedProjectsCount: number;
  metadata?: any;
}
