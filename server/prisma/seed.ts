import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for HackTracker...');

  // Clean existing records if any
  await prisma.emailNotification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.privacySetting.deleteMany();
  await prisma.skillEndorsement.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.userMilestone.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.project.deleteMany();
  await prisma.savedHackathon.deleteMany();
  await prisma.hackathonReview.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.teamInvite.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Skills
  const skillsData = [
    { name: 'Python', category: 'Programming' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'C++', category: 'Programming' },
    { name: 'Rust', category: 'Programming' },
    { name: 'React', category: 'Framework' },
    { name: 'Node.js', category: 'Framework' },
    { name: 'Next.js', category: 'Framework' },
    { name: 'FastAPI', category: 'Framework' },
    { name: 'Flutter', category: 'Framework' },
    { name: 'AI/ML', category: 'AI/ML' },
    { name: 'PyTorch', category: 'AI/ML' },
    { name: 'TensorFlow', category: 'AI/ML' },
    { name: 'OpenCV', category: 'AI/ML' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'Docker', category: 'Cloud' },
    { name: 'Kubernetes', category: 'Cloud' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Google Cloud', category: 'Cloud' },
    { name: 'Git', category: 'Tools' },
    { name: 'Cybersecurity', category: 'Security' },
    { name: 'Solidity', category: 'Blockchain' },
  ];

  const skillMap: Record<string, string> = {};
  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    skillMap[s.name] = created.id;
  }
  console.log(`✅ Seeded ${skillsData.length} skills`);

  // 2. Create Badges
  const badgesData = [
    {
      code: 'FIRST_STEP',
      name: 'First Step',
      description: 'Submit your very first hackathon project.',
      icon: 'Rocket',
      tier: 'Bronze',
      category: 'Projects',
      pointsAward: 30
    },
    {
      code: 'FIRST_WINNER',
      name: 'First Winner',
      description: 'Win 1st, 2nd, or 3rd place in any hackathon.',
      icon: 'Trophy',
      tier: 'Gold',
      category: 'Wins',
      pointsAward: 100
    },
    {
      code: 'PROJECT_MASTER',
      name: 'Project Master',
      description: 'Successfully submit 5 or more hackathon projects.',
      icon: 'Layers',
      tier: 'Silver',
      category: 'Projects',
      pointsAward: 80
    },
    {
      code: 'HACKATHON_CHAMPION',
      name: 'Hackathon Champion',
      description: 'Win 3 hackathons across multiple platforms.',
      icon: 'Crown',
      tier: 'Gold',
      category: 'Wins',
      pointsAward: 200
    },
    {
      code: 'LEGENDARY_HACKER',
      name: 'Legendary Hacker',
      description: 'Achieve 5+ hackathon podium finishes.',
      icon: 'Sparkles',
      tier: 'Platinum',
      category: 'Wins',
      pointsAward: 500
    },
    {
      code: 'PERFECT_TRUST',
      name: 'Perfect Trust',
      description: 'Maintain 95%+ Trust Score with multiple verified certificates.',
      icon: 'ShieldCheck',
      tier: 'Platinum',
      category: 'Trust',
      pointsAward: 150
    },
    {
      code: 'TEAM_PLAYER',
      name: 'Team Player',
      description: 'Create or join a team and submit a group project.',
      icon: 'Users',
      tier: 'Bronze',
      category: 'Team',
      pointsAward: 40
    },
    {
      code: 'TRUST_BUILDER',
      name: 'Trust Builder',
      description: 'Reach a Trust Score of 75% or higher via OCR verification.',
      icon: 'Award',
      tier: 'Silver',
      category: 'Trust',
      pointsAward: 60
    },
    {
      code: 'SKILL_SPECIALIST',
      name: 'Skill Specialist',
      description: 'Earn 5+ peer endorsements across your technical skills.',
      icon: 'CheckCircle2',
      tier: 'Silver',
      category: 'Skills',
      pointsAward: 50
    },
    {
      code: 'TRUST_GUARDIAN',
      name: 'Trust Guardian',
      description: 'Verify 3 consecutive certificates without rejection.',
      icon: 'BadgeCheck',
      tier: 'Gold',
      category: 'Trust',
      pointsAward: 120
    }
  ];

  const badgeMap: Record<string, string> = {};
  for (const b of badgesData) {
    const created = await prisma.badge.create({ data: b });
    badgeMap[b.code] = created.id;
  }
  console.log(`✅ Seeded ${badgesData.length} badges`);

  // 3. Create Milestones
  const milestonesData = [
    { code: 'FIRST_PROJECT', title: 'First Project Submitted', description: 'Started the hackathon journey', category: 'Projects', targetValue: 1, icon: 'FileCode' },
    { code: 'FIRST_WIN', title: 'First Podium Finish', description: 'Won first hackathon award', category: 'Wins', targetValue: 1, icon: 'Trophy' },
    { code: 'FIRST_TEAM', title: 'First Team Formed', description: 'Collaborated in a hackathon team', category: 'Team', targetValue: 1, icon: 'Users' },
    { code: 'FIRST_CERTIFICATE', title: 'First Certificate Verified', description: 'OCR verified credential proof', category: 'Trust', targetValue: 1, icon: 'FileCheck' },
    { code: 'POINTS_50', title: '50 Points Club', description: 'Accumulated 50 total platform points', category: 'Points', targetValue: 50, icon: 'Zap' },
    { code: 'POINTS_100', title: '100 Points Milestone', description: 'Crossed 100 points milestone', category: 'Points', targetValue: 100, icon: 'Flame' },
    { code: 'POINTS_500', title: '500 Points Elite', description: 'Reached 500 points master tier', category: 'Points', targetValue: 500, icon: 'Star' },
    { code: 'POINTS_1000', title: '1,000 Points Grandmaster', description: 'Entered four-digit points hall of fame', category: 'Points', targetValue: 1000, icon: 'Crown' },
    { code: 'RANK_TOP_100', title: 'Top 100 Leaderboard', description: 'Ranked in the top 100 students', category: 'Rank', targetValue: 100, icon: 'TrendingUp' },
    { code: 'RANK_TOP_10', title: 'Top 10 Superstar', description: 'Secured a spot in the Top 10 campus ranking', category: 'Rank', targetValue: 10, icon: 'Medal' },
    { code: 'RANK_NUM_ONE', title: 'Rank #1 Champion', description: 'Reached the undisputed #1 rank', category: 'Rank', targetValue: 1, icon: 'Award' },
    { code: 'STREAK_3_MONTH', title: '3 Projects in a Month', description: 'Submitted 3 projects within a single calendar month', category: 'Projects', targetValue: 3, icon: 'Calendar' }
  ];

  const milestoneMap: Record<string, string> = {};
  for (const m of milestonesData) {
    const created = await prisma.milestone.create({ data: m });
    milestoneMap[m.code] = created.id;
  }
  console.log(`✅ Seeded ${milestonesData.length} milestones`);

  // 4. Create Hackathons
  const hackathonsData = [
    // 1. Devpost Hackathons
    {
      title: 'Salesforce TDX Agentforce Innovation Challenge',
      slug: 'salesforce-tdx-agentforce-challenge',
      platform: 'Devpost',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
      description: 'Build autonomous multi-agent systems and customized AI actions on the Agentforce 360 platform for modern enterprises.',
      websiteUrl: 'https://tdx-2026.devpost.com',
      registrationUrl: 'https://tdx-2026.devpost.com',
      locationType: 'Online',
      city: null,
      country: 'Global',
      startDate: new Date('2026-09-01T00:00:00Z'),
      endDate: new Date('2026-09-15T23:59:59Z'),
      registrationDeadline: new Date('2026-08-30T18:00:00Z'),
      submissionDeadline: new Date('2026-09-15T23:59:59Z'),
      prizePool: '₹42,00,000 ($50,000)',
      prizePoolValue: 4200000,
      prizeBreakdown: JSON.stringify([
        { place: 'Grand Prize Winner', amount: '₹21,00,000 ($25,000)' },
        { place: '2nd Place', amount: '₹12,50,000 ($15,000)' },
        { place: '3rd Place', amount: '₹8,50,000 ($10,000)' }
      ]),
      theme: 'AI/ML',
      duration: '2 weeks',
      difficulty: 'Expert',
      department: 'AI & DS',
      teamSizeMin: 1,
      teamSizeMax: 4,
      participantCount: 3420,
      rating: 4.95,
      judgingCriteria: 'Agent Architecture (35%), Practical Business Impact (30%), Technical Execution (20%), User Experience (15%)',
      eligibility: 'Open to developers and students worldwide.',
      isFeatured: true
    },
    {
      title: 'HP x NVIDIA GenAI Developer Challenge',
      slug: 'hp-nvidia-genai-challenge',
      platform: 'Devpost',
      logoUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=400&fit=crop',
      description: 'Develop next-generation AI-powered applications utilizing HP AI Studio tooling and NVIDIA NGC acceleration libraries.',
      websiteUrl: 'https://hp-nvidia.devpost.com',
      registrationUrl: 'https://hp-nvidia.devpost.com',
      locationType: 'Online',
      city: null,
      country: 'Global',
      startDate: new Date('2026-09-05T00:00:00Z'),
      endDate: new Date('2026-09-25T23:59:59Z'),
      registrationDeadline: new Date('2026-09-02T18:00:00Z'),
      submissionDeadline: new Date('2026-09-25T23:59:59Z'),
      prizePool: '₹25,00,000 ($30,000)',
      prizePoolValue: 2500000,
      prizeBreakdown: JSON.stringify([
        { place: '1st Place', amount: '₹12,50,000' },
        { place: '2nd Place', amount: '₹7,50,000' },
        { place: '3rd Place', amount: '₹5,00,000' }
      ]),
      theme: 'AI/ML',
      duration: '3 weeks',
      difficulty: 'Expert',
      department: 'CSE',
      teamSizeMin: 1,
      teamSizeMax: 4,
      participantCount: 2890,
      rating: 4.9,
      judgingCriteria: 'GPU Acceleration, Model Efficiency, Creativity, Real-world Viability',
      eligibility: 'Open to college students and professional builders globally.',
      isFeatured: true
    },
    {
      title: 'Google Gemini Multimodal AI Sprint',
      slug: 'google-gemini-multimodal-sprint',
      platform: 'Devpost',
      logoUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=400&fit=crop',
      description: 'Build creative multimodal audio, visual, and code reasoning tools using the Gemini Live and Interactions APIs.',
      websiteUrl: 'https://gemini-sprint.devpost.com',
      registrationUrl: 'https://gemini-sprint.devpost.com',
      locationType: 'Online',
      city: null,
      country: 'Global',
      startDate: new Date('2026-09-12T00:00:00Z'),
      endDate: new Date('2026-09-26T23:59:59Z'),
      registrationDeadline: new Date('2026-09-10T23:59:59Z'),
      submissionDeadline: new Date('2026-09-26T23:59:59Z'),
      prizePool: '₹35,00,000 ($40,000)',
      prizePoolValue: 3500000,
      prizeBreakdown: JSON.stringify([
        { place: 'Grand Prize', amount: '₹18,00,000' },
        { place: 'Best Multimodal UX', amount: '₹10,00,000' },
        { place: 'Community Choice', amount: '₹7,00,000' }
      ]),
      theme: 'AI/ML',
      duration: '2 weeks',
      difficulty: 'Intermediate',
      department: 'AI & DS',
      teamSizeMin: 1,
      teamSizeMax: 4,
      participantCount: 4120,
      rating: 4.92,
      judgingCriteria: 'API Integration, Multimodal reasoning, Speed, Polish',
      eligibility: 'All students & researchers.',
      isFeatured: true
    },

    // 2. Unstop Hackathons
    {
      title: 'DataQuest 2026 — Megalith IIT Kharagpur',
      slug: 'dataquest-2026-iit-kharagpur',
      platform: 'Unstop',
      logoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop',
      description: 'National-level competitive Data Science and Predictive Analytics hackathon hosted by Megalith, IIT Kharagpur.',
      websiteUrl: 'https://unstop.com/hackathons/dataquest-2026-megalith-iit-kharagpur-1384024',
      registrationUrl: 'https://unstop.com/hackathons/dataquest-2026-megalith-iit-kharagpur-1384024',
      locationType: 'Online',
      city: 'Kharagpur',
      country: 'India',
      startDate: new Date('2026-09-18T10:00:00Z'),
      endDate: new Date('2026-09-20T20:00:00Z'),
      registrationDeadline: new Date('2026-09-16T23:59:59Z'),
      submissionDeadline: new Date('2026-09-20T20:00:00Z'),
      prizePool: '₹1,50,000',
      prizePoolValue: 150000,
      prizeBreakdown: JSON.stringify([
        { place: '1st Place Winner', amount: '₹75,000' },
        { place: '2nd Place Runner Up', amount: '₹45,000' },
        { place: '3rd Place', amount: '₹30,000' }
      ]),
      theme: 'Data Science',
      duration: '48 hours',
      difficulty: 'Intermediate',
      department: 'AI & DS',
      teamSizeMin: 1,
      teamSizeMax: 3,
      participantCount: 1850,
      rating: 4.88,
      judgingCriteria: 'F1 Score, Data Preprocessing, Model Explainability, Code Documentation',
      eligibility: 'Open to all undergraduate and postgraduate engineering students in India.',
      isFeatured: true
    },
    {
      title: 'Changethon — National Social Summit IIT Roorkee',
      slug: 'changethon-iit-roorkee',
      platform: 'Unstop',
      logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=400&fit=crop',
      description: 'Design impactful technology and software solutions addressing healthcare, education, and rural sustainability challenges.',
      websiteUrl: 'https://unstop.com/hackathons/changethon-national-social-summit-2026-iit-roorkee',
      registrationUrl: 'https://unstop.com/hackathons/changethon-national-social-summit-2026-iit-roorkee',
      locationType: 'Hybrid',
      city: 'Roorkee',
      country: 'India',
      startDate: new Date('2026-09-22T09:00:00Z'),
      endDate: new Date('2026-09-24T18:00:00Z'),
      registrationDeadline: new Date('2026-09-20T23:59:59Z'),
      submissionDeadline: new Date('2026-09-24T17:00:00Z'),
      prizePool: '₹2,00,000',
      prizePoolValue: 200000,
      prizeBreakdown: JSON.stringify([
        { place: 'Winner', amount: '₹1,00,000' },
        { place: '1st Runner Up', amount: '₹60,000' },
        { place: '2nd Runner Up', amount: '₹40,000' }
      ]),
      theme: 'Open Innovation',
      duration: '48 hours',
      difficulty: 'Beginner',
      department: 'CSE',
      teamSizeMin: 2,
      teamSizeMax: 4,
      participantCount: 2300,
      rating: 4.82,
      judgingCriteria: 'Social Impact, Usability, Technology Stack, Scalability',
      eligibility: 'All college students across departments.',
      isFeatured: true
    },
    {
      title: 'Hackwise 2026 — IEEE TEMS IIM Indore',
      slug: 'hackwise-2026-iim-indore',
      platform: 'Unstop',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=400&fit=crop',
      description: 'Fintech and Enterprise Product Hackathon hosted during IRIS at IIM Indore. Build products merging tech with business acumen.',
      websiteUrl: 'https://unstop.com/hackathons/hackwise-2026-ieee-iim-indore',
      registrationUrl: 'https://unstop.com/hackathons/hackwise-2026-ieee-iim-indore',
      locationType: 'Online',
      city: 'Indore',
      country: 'India',
      startDate: new Date('2026-10-02T10:00:00Z'),
      endDate: new Date('2026-10-04T20:00:00Z'),
      registrationDeadline: new Date('2026-09-28T23:59:59Z'),
      submissionDeadline: new Date('2026-10-04T18:00:00Z'),
      prizePool: '₹3,00,000',
      prizePoolValue: 300000,
      prizeBreakdown: JSON.stringify([
        { place: 'Grand Prize', amount: '₹1,50,000' },
        { place: '2nd Place', amount: '₹1,00,000' },
        { place: 'Best Business Model', amount: '₹50,000' }
      ]),
      theme: 'Fintech',
      duration: '48 hours',
      difficulty: 'Intermediate',
      department: 'IT',
      teamSizeMin: 2,
      teamSizeMax: 4,
      participantCount: 1950,
      rating: 4.86,
      judgingCriteria: 'Product Market Fit, Financial Architecture, Code Quality, Pitch',
      eligibility: 'B.Tech, MBA, and Dual-degree students.',
      isFeatured: false
    },
    {
      title: 'Vivitsu 2026 National Hackathon',
      slug: 'vivitsu-2026-national-hackathon',
      platform: 'Unstop',
      logoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop',
      description: 'National 24-hour hackathon focused on Smart Cities, IoT hardware integration, and embedded software architectures.',
      websiteUrl: 'https://unstop.com/hackathons/vivitsu-2026-national-level-hackathon',
      registrationUrl: 'https://unstop.com/hackathons/vivitsu-2026-national-level-hackathon',
      locationType: 'Hybrid',
      city: 'Hyderabad',
      country: 'India',
      startDate: new Date('2026-10-10T09:00:00Z'),
      endDate: new Date('2026-10-11T12:00:00Z'),
      registrationDeadline: new Date('2026-10-05T23:59:59Z'),
      submissionDeadline: new Date('2026-10-11T11:00:00Z'),
      prizePool: '₹2,50,000',
      prizePoolValue: 250000,
      prizeBreakdown: JSON.stringify([
        { place: '1st Prize', amount: '₹1,25,000' },
        { place: '2nd Prize', amount: '₹75,000' },
        { place: '3rd Prize', amount: '₹50,000' }
      ]),
      theme: 'IoT',
      duration: '24 hours',
      difficulty: 'Beginner',
      department: 'ECE',
      teamSizeMin: 2,
      teamSizeMax: 4,
      participantCount: 1400,
      rating: 4.78,
      judgingCriteria: 'Hardware-Software Interop, Working Prototype, Latency, Innovation',
      eligibility: 'Open to all engineering college students.',
      isFeatured: false
    },

    // 3. Kaggle Competitions
    {
      title: 'Kaggle LLM 20 Questions Game Challenge',
      slug: 'kaggle-llm-20-questions',
      platform: 'Kaggle',
      logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop',
      description: 'Build conversational language model agents that play the game of 20 Questions against each other in strategic multi-turn matches.',
      websiteUrl: 'https://www.kaggle.com/competitions/llm-20-questions',
      registrationUrl: 'https://www.kaggle.com/competitions/llm-20-questions',
      locationType: 'Online',
      city: null,
      country: 'Global',
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-09-30T23:59:59Z'),
      registrationDeadline: new Date('2026-09-20T23:59:59Z'),
      submissionDeadline: new Date('2026-09-30T23:59:59Z'),
      prizePool: '₹42,00,000 ($50,000)',
      prizePoolValue: 4200000,
      prizeBreakdown: JSON.stringify([
        { place: '1st Place (Gold Medal)', amount: '₹16,50,000 ($20,000)' },
        { place: '2nd Place (Silver Medal)', amount: '₹12,50,000 ($15,000)' },
        { place: '3rd Place (Bronze Medal)', amount: '₹8,50,000 ($10,000)' },
        { place: '4th & 5th Place', amount: '₹4,50,000 ($5,000)' }
      ]),
      theme: 'AI/ML',
      duration: 'Open-ended',
      difficulty: 'Expert',
      department: 'AI & DS',
      teamSizeMin: 1,
      teamSizeMax: 5,
      participantCount: 5200,
      rating: 4.96,
      judgingCriteria: 'Elo Rating Leaderboard, Strategic Guessing Efficiency, Model Pruning',
      eligibility: 'Open to all Kaggle participants worldwide.',
      isFeatured: true
    },
    {
      title: 'Kaggle Home Credit Risk Model Stability',
      slug: 'kaggle-home-credit-risk',
      platform: 'Kaggle',
      logoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop',
      description: 'Predict financial loan default probabilities and build models that maintain long-term stability across variable macroeconomic shifts.',
      websiteUrl: 'https://www.kaggle.com/competitions/home-credit-credit-risk-model-stability',
      registrationUrl: 'https://www.kaggle.com/competitions/home-credit-credit-risk-model-stability',
      locationType: 'Online',
      city: null,
      country: 'Global',
      startDate: new Date('2026-08-15T00:00:00Z'),
      endDate: new Date('2026-10-15T23:59:59Z'),
      registrationDeadline: new Date('2026-10-01T23:59:59Z'),
      submissionDeadline: new Date('2026-10-15T23:59:59Z'),
      prizePool: '₹85,00,000 ($105,000)',
      prizePoolValue: 8500000,
      prizeBreakdown: JSON.stringify([
        { place: '1st Place', amount: '₹35,00,000' },
        { place: '2nd Place', amount: '₹25,00,000' },
        { place: '3rd Place', amount: '₹15,00,000' },
        { place: '4th & 5th Place', amount: '₹10,00,000' }
      ]),
      theme: 'Data Science',
      duration: 'Open-ended',
      difficulty: 'Expert',
      department: 'AI & DS',
      teamSizeMin: 1,
      teamSizeMax: 5,
      participantCount: 3890,
      rating: 4.93,
      judgingCriteria: 'Gini Stability Index on Unseen Test Splits, Out-of-Time Validation',
      eligibility: 'Global data scientists and students.',
      isFeatured: true
    },

    // 4. MLH Hackathons
    {
      title: 'MLH Global Hack Week 2026',
      slug: 'mlh-global-hack-week-2026',
      platform: 'MLH',
      logoUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&h=400&fit=crop',
      description: 'Week-long worldwide celebration of hacking, beginner workshops, live coding challenges, and open-source contributions.',
      websiteUrl: 'https://ghw.mlh.io',
      registrationUrl: 'https://ghw.mlh.io',
      locationType: 'Online',
      city: null,
      country: 'Global',
      startDate: new Date('2026-09-25T18:00:00Z'),
      endDate: new Date('2026-10-02T18:00:00Z'),
      registrationDeadline: new Date('2026-09-24T23:59:59Z'),
      submissionDeadline: new Date('2026-10-02T17:00:00Z'),
      prizePool: '₹8,50,000 ($10,000 in Swag & Prizes)',
      prizePoolValue: 850000,
      prizeBreakdown: JSON.stringify([
        { place: 'Top Guild Winner', amount: '₹3,00,000' },
        { place: 'Best Beginner Project', amount: '₹2,50,000' },
        { place: 'Open Source MVP', amount: '₹3,00,000' }
      ]),
      theme: 'Open Innovation',
      duration: '1 week',
      difficulty: 'Beginner',
      department: 'CSE',
      teamSizeMin: 1,
      teamSizeMax: 4,
      participantCount: 6500,
      rating: 4.97,
      judgingCriteria: 'Creativity, Workshop Completion, Community Support, Technical Effort',
      eligibility: 'Open to all hackers worldwide, especially beginners.',
      isFeatured: true
    },
    {
      title: 'HackMIT 2026 — Global Collegiate Hackathon',
      slug: 'hackmit-2026',
      platform: 'MLH',
      logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop',
      description: 'MIT flagship annual collegiate hackathon bringing together 1,000+ top student builders for 24 hours of non-stop creation.',
      websiteUrl: 'https://hackmit.org',
      registrationUrl: 'https://hackmit.org',
      locationType: 'Hybrid',
      city: 'Cambridge, MA',
      country: 'USA / Online',
      startDate: new Date('2026-10-03T12:00:00Z'),
      endDate: new Date('2026-10-04T18:00:00Z'),
      registrationDeadline: new Date('2026-09-20T23:59:59Z'),
      submissionDeadline: new Date('2026-10-04T16:00:00Z'),
      prizePool: '₹25,00,000 ($30,000)',
      prizePoolValue: 2500000,
      prizeBreakdown: JSON.stringify([
        { place: 'Grand Prize Winner', amount: '₹10,00,000' },
        { place: 'Best Hardware Hack', amount: '₹5,00,000' },
        { place: 'Best Web3 Project', amount: '₹5,00,000' },
        { place: 'Best Social Good', amount: '₹5,00,000' }
      ]),
      theme: 'Web Development',
      duration: '24 hours',
      difficulty: 'Expert',
      department: 'CSE',
      teamSizeMin: 1,
      teamSizeMax: 4,
      participantCount: 2200,
      rating: 4.98,
      judgingCriteria: 'Technical Complexity, Originality, Design, Working Live Demo',
      eligibility: 'Undergraduate students currently enrolled in university.',
      isFeatured: true
    },
    {
      title: 'CalHacks 2026 — World Largest Collegiate Hackathon',
      slug: 'calhacks-2026',
      platform: 'MLH',
      logoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=400&fit=crop',
      description: 'UC Berkeley premier 36-hour hackathon bringing together global creators at San Francisco Palace of Fine Arts.',
      websiteUrl: 'https://calhacks.io',
      registrationUrl: 'https://calhacks.io',
      locationType: 'Hybrid',
      city: 'San Francisco, CA',
      country: 'USA / Online',
      startDate: new Date('2026-10-23T18:00:00Z'),
      endDate: new Date('2026-10-25T18:00:00Z'),
      registrationDeadline: new Date('2026-10-10T23:59:59Z'),
      submissionDeadline: new Date('2026-10-25T16:00:00Z'),
      prizePool: '₹50,00,000 ($60,000)',
      prizePoolValue: 5000000,
      prizeBreakdown: JSON.stringify([
        { place: 'Overall 1st Place', amount: '₹20,00,000' },
        { place: 'Overall 2nd Place', amount: '₹12,00,000' },
        { place: 'Best Venture Track', amount: '₹10,00,000' },
        { place: 'Best AI Frontier', amount: '₹8,00,000' }
      ]),
      theme: 'AI/ML',
      duration: '48 hours',
      difficulty: 'Expert',
      department: 'CSE',
      teamSizeMin: 1,
      teamSizeMax: 4,
      participantCount: 3100,
      rating: 4.96,
      judgingCriteria: 'Innovation, Venture Feasibility, Technical Depth, Demonstration',
      eligibility: 'All undergraduate and graduate students.',
      isFeatured: false
    },

    // 5. HackerEarth Challenges
    {
      title: 'HackerEarth International Women in Tech Hackathon',
      slug: 'hackerearth-women-in-tech',
      platform: 'HackerEarth',
      logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=400&fit=crop',
      description: 'Celebrating women engineers and creators building software solutions across Cloud, AI, and Cybersecurity.',
      websiteUrl: 'https://www.hackerearth.com/challenges/hackathon/international-womens-hackathon/',
      registrationUrl: 'https://www.hackerearth.com/challenges/hackathon/international-womens-hackathon/',
      locationType: 'Online',
      city: null,
      country: 'Global',
      startDate: new Date('2026-10-15T00:00:00Z'),
      endDate: new Date('2026-10-30T23:59:59Z'),
      registrationDeadline: new Date('2026-10-14T23:59:59Z'),
      submissionDeadline: new Date('2026-10-30T23:59:59Z'),
      prizePool: '₹5,00,000',
      prizePoolValue: 500000,
      prizeBreakdown: JSON.stringify([
        { place: '1st Prize', amount: '₹2,50,000' },
        { place: '2nd Prize', amount: '₹1,50,000' },
        { place: '3rd Prize', amount: '₹1,00,000' }
      ]),
      theme: 'Cybersecurity',
      duration: '2 weeks',
      difficulty: 'Intermediate',
      department: 'CSE',
      teamSizeMin: 1,
      teamSizeMax: 3,
      participantCount: 2400,
      rating: 4.89,
      judgingCriteria: 'Security Best Practices, Clean Code, Innovation, Architecture',
      eligibility: 'Women developers, engineers, and student coders worldwide.',
      isFeatured: false
    },
    {
      title: 'HackerEarth Smart Mobility & EV Innovation Hack',
      slug: 'hackerearth-smart-mobility',
      platform: 'HackerEarth',
      logoUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=400&fit=crop',
      description: 'Optimize electric vehicle battery telemetry, fleet routing algorithms, and smart grid energy distributions.',
      websiteUrl: 'https://www.hackerearth.com/challenges/hackathon/smart-mobility-hack/',
      registrationUrl: 'https://www.hackerearth.com/challenges/hackathon/smart-mobility-hack/',
      locationType: 'Online',
      city: null,
      country: 'India',
      startDate: new Date('2026-11-01T09:00:00Z'),
      endDate: new Date('2026-11-15T18:00:00Z'),
      registrationDeadline: new Date('2026-10-28T23:59:59Z'),
      submissionDeadline: new Date('2026-11-15T17:00:00Z'),
      prizePool: '₹3,50,000',
      prizePoolValue: 350000,
      prizeBreakdown: JSON.stringify([
        { place: 'Winner', amount: '₹1,75,000' },
        { place: 'Runner Up', amount: '₹1,00,000' },
        { place: 'Best Algorithm', amount: '₹75,000' }
      ]),
      theme: 'IoT',
      duration: '2 weeks',
      difficulty: 'Intermediate',
      department: 'ECE',
      teamSizeMin: 1,
      teamSizeMax: 4,
      participantCount: 1650,
      rating: 4.81,
      judgingCriteria: 'Telemetry Processing, Algorithm Optimization, Feasibility, UI Dashboard',
      eligibility: 'Open to all engineering students and professionals.',
      isFeatured: false
    }
  ];

  const hackathonMap: Record<string, string> = {};
  for (const h of hackathonsData) {
    const created = await prisma.hackathon.create({ data: h });
    hackathonMap[h.title] = created.id;
  }
  console.log(`✅ Seeded ${hackathonsData.length} hackathons`);

  // 5. Create Realistic Users
  const usersData = [
    {
      name: 'Arjun Sharma',
      username: 'arjunsharma',
      email: 'arjun@hacktracker.io',
      passwordHash,
      department: 'CSE',
      year: '4th',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      bio: 'Full-Stack Architect & Competitive Hacker. Love building high-performance distributed systems & AI agents.',
      college: 'Indian Institute of Technology, Madras',
      location: 'Chennai, India',
      githubUrl: 'https://github.com/arjunsharma',
      linkedinUrl: 'https://linkedin.com/in/arjunsharma',
      twitterUrl: 'https://twitter.com/arjun_dev',
      devpostUrl: 'https://devpost.com/arjunsharma',
      trustScore: 92.0,
      points: 850,
      finalScore: 782.0,
      currentRank: 1,
      rankChange: 0,
      winsCount: 3,
    },
    {
      name: 'Priya Nair',
      username: 'priyanair',
      email: 'priya@hacktracker.io',
      passwordHash,
      department: 'AI & DS',
      year: '3rd',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      bio: 'AI/ML Researcher & Kaggle Grandmaster. Building neural networks that think alongside humans.',
      college: 'National Institute of Technology, Karnataka',
      location: 'Mangalore, India',
      githubUrl: 'https://github.com/priyanair',
      linkedinUrl: 'https://linkedin.com/in/priyanair',
      twitterUrl: 'https://twitter.com/priya_ai',
      devpostUrl: 'https://devpost.com/priyanair',
      trustScore: 96.0,
      points: 790,
      finalScore: 758.4,
      currentRank: 2,
      rankChange: 1,
      winsCount: 3,
    },
    {
      name: 'Rahul Mehta',
      username: 'rahulmehta',
      email: 'rahul@hacktracker.io',
      passwordHash,
      department: 'IT',
      year: '3rd',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
      bio: 'Cloud Architect & Backend Ninja. Passionate about Kubernetes, Go, and low-latency microservices.',
      college: 'Delhi Technological University',
      location: 'New Delhi, India',
      githubUrl: 'https://github.com/rahulmehta',
      linkedinUrl: 'https://linkedin.com/in/rahulmehta',
      twitterUrl: 'https://twitter.com/rahul_cloud',
      trustScore: 84.0,
      points: 620,
      finalScore: 520.8,
      currentRank: 3,
      rankChange: -1,
      winsCount: 2,
    },
    {
      name: 'Ananya Krishnan',
      username: 'ananyakrishnan',
      email: 'ananya@hacktracker.io',
      passwordHash,
      department: 'ECE',
      year: '2nd',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      bio: 'Embedded Systems & IoT Developer. Bridging physical hardware with cloud intelligence.',
      college: 'BITS Pilani',
      location: 'Hyderabad, India',
      githubUrl: 'https://github.com/ananyakrishnan',
      linkedinUrl: 'https://linkedin.com/in/ananyakrishnan',
      trustScore: 78.0,
      points: 490,
      finalScore: 382.2,
      currentRank: 4,
      rankChange: 2,
      winsCount: 1,
    },
    {
      name: 'Karthik Raj',
      username: 'karthikraj',
      email: 'karthik@hacktracker.io',
      passwordHash,
      department: 'CSE',
      year: '2nd',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      bio: 'Frontend Craftsman & UI/UX Geek. Obsessed with micro-interactions, Tailwind, and React.',
      college: 'Vellore Institute of Technology',
      location: 'Vellore, India',
      githubUrl: 'https://github.com/karthikraj',
      linkedinUrl: 'https://linkedin.com/in/karthikraj',
      trustScore: 72.0,
      points: 380,
      finalScore: 273.6,
      currentRank: 5,
      rankChange: 0,
      winsCount: 1,
    }
  ];

  const userMap: Record<string, string> = {};
  for (const u of usersData) {
    const created = await prisma.user.create({
      data: {
        ...u,
        privacySettings: {
          create: {
            profileVisibility: 'PUBLIC',
            emailVisibility: true,
            projectsVisibility: true,
            achievementsVisibility: true,
            rankVisibility: true,
            skillsVisibility: true,
            shareWithRecruiters: true,
            shareWithOrganizers: true
          }
        },
        notificationPrefs: {
          createMany: {
            data: [
              { category: 'PROJECT_VERIFICATION', inApp: true, emailMode: 'INSTANT' },
              { category: 'RANK_CHANGES', inApp: true, emailMode: 'DAILY_DIGEST' },
              { category: 'ACHIEVEMENTS', inApp: true, emailMode: 'INSTANT' },
              { category: 'TEAM_UPDATES', inApp: true, emailMode: 'INSTANT' },
              { category: 'DEADLINES', inApp: true, emailMode: 'INSTANT' },
              { category: 'RECOMMENDATIONS', inApp: true, emailMode: 'WEEKLY_DIGEST' }
            ]
          }
        }
      }
    });
    userMap[u.username] = created.id;
  }
  console.log(`✅ Seeded ${usersData.length} core users with privacy and notification preferences`);

  // 6. Assign Skills to Users
  const userSkillMap: Record<string, string[]> = {
    arjunsharma: ['TypeScript', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'Python'],
    priyanair: ['Python', 'AI/ML', 'PyTorch', 'TensorFlow', 'OpenCV', 'FastAPI'],
    rahulmehta: ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Redis'],
    ananyakrishnan: ['C++', 'Python', 'AI/ML', 'Git', 'Google Cloud'],
    karthikraj: ['React', 'JavaScript', 'TypeScript', 'Next.js', 'Git']
  };

  for (const [username, skills] of Object.entries(userSkillMap)) {
    const userId = userMap[username];
    for (const skillName of skills) {
      const skillId = skillMap[skillName];
      if (skillId && userId) {
        const userSkill = await prisma.userSkill.create({
          data: {
            userId,
            skillId,
            proficiencyLevel: username === 'arjunsharma' || username === 'priyanair' ? 'Expert' : 'Intermediate',
            endorsementCount: 2
          }
        });

        // Add an endorsement from another user
        const otherUserId = username === 'arjunsharma' ? userMap['priyanair'] : userMap['arjunsharma'];
        if (otherUserId) {
          await prisma.skillEndorsement.create({
            data: {
              userSkillId: userSkill.id,
              endorserId: otherUserId
            }
          });
        }
      }
    }
  }

  // 7. Create Teams
  const teamsData = [
    {
      name: 'CodeMasters',
      slug: 'codemasters',
      description: 'Elite full-stack and distributed systems squad tackling complex engineering challenges.',
      logoUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop',
      leaderUsername: 'arjunsharma',
      department: 'CSE',
      totalPoints: 1470,
      averageTrust: 88.0,
      winsCount: 5,
      memberUsernames: ['arjunsharma', 'rahulmehta', 'karthikraj']
    },
    {
      name: 'InnovateLabs',
      slug: 'innovatelabs',
      description: 'Applied machine learning & neural intelligence research unit building agentic products.',
      logoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
      leaderUsername: 'priyanair',
      department: 'AI & DS',
      totalPoints: 1280,
      averageTrust: 87.0,
      winsCount: 4,
      memberUsernames: ['priyanair', 'ananyakrishnan']
    },
    {
      name: 'WebWizards',
      slug: 'webwizards',
      description: 'Frontend dynamos & Web3 architects crafting delightful interactive consumer experiences.',
      logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
      leaderUsername: 'karthikraj',
      department: 'CSE',
      totalPoints: 380,
      averageTrust: 72.0,
      winsCount: 1,
      memberUsernames: ['karthikraj']
    },
    {
      name: 'Agile Forces',
      slug: 'agile-forces',
      description: 'Cross-functional engineering crew specializing in IoT edge devices and rapid prototyping.',
      logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=200&fit=crop',
      leaderUsername: 'ananyakrishnan',
      department: 'ECE',
      totalPoints: 490,
      averageTrust: 78.0,
      winsCount: 1,
      memberUsernames: ['ananyakrishnan']
    }
  ];

  const teamMap: Record<string, string> = {};
  for (const t of teamsData) {
    const leaderId = userMap[t.leaderUsername];
    const createdTeam = await prisma.team.create({
      data: {
        name: t.name,
        slug: t.slug,
        description: t.description,
        logoUrl: t.logoUrl,
        leaderId,
        department: t.department,
        totalPoints: t.totalPoints,
        averageTrust: t.averageTrust,
        winsCount: t.winsCount
      }
    });
    teamMap[t.name] = createdTeam.id;

    for (const memberUsername of t.memberUsernames) {
      const memberUserId = userMap[memberUsername];
      await prisma.teamMember.create({
        data: {
          teamId: createdTeam.id,
          userId: memberUserId,
          role: memberUsername === t.leaderUsername ? 'LEADER' : 'MEMBER',
          status: 'ACTIVE'
        }
      });
    }
  }
  console.log(`✅ Seeded ${teamsData.length} teams with active rosters`);

  // 8. Create Realistic Projects with OCR Verified Certificates
  const projectsData = [
    {
      username: 'arjunsharma',
      hackathonTitle: 'Salesforce TDX Agentforce Innovation Challenge',
      title: 'NeuroFlow — Autonomous Multi-Agent Code Reviewer',
      tagline: 'Self-healing Git PR auditor with real-time architectural diff analysis.',
      description: 'NeuroFlow orchestrates specialized LLM agents to detect race conditions, security vulnerabilities, and memory leaks in pull requests before they merge. Built with Node.js, TypeScript, and Docker containerized sandbox runners.',
      projectUrl: 'https://neuroflow.dev',
      githubUrl: 'https://github.com/arjunsharma/neuroflow',
      techStack: JSON.stringify(['TypeScript', 'React', 'Node.js', 'Docker', 'AI/ML']),
      isSolo: false,
      teamName: 'CodeMasters',
      status: 'Winner',
      isVerified: true,
      verificationDate: new Date('2026-08-10T14:30:00Z'),
      certificate: {
        fileUrl: '/uploads/certificates/cert_neuroflow_arjun.png',
        rawOcrText: 'CERTIFICATE OF EXCELLENCE - Salesforce TDX Agentforce Innovation Challenge. This is to certify that Arjun Sharma has been awarded Grand Prize Winner for the project NeuroFlow.',
        extractedName: 'Arjun Sharma',
        extractedHackathon: 'Salesforce TDX Agentforce Innovation Challenge',
        extractedAchievement: 'Grand Prize Winner',
        extractedDate: '10 August 2026',
        confidenceScore: 98.5,
        status: 'VERIFIED'
      }
    },
    {
      username: 'priyanair',
      hackathonTitle: 'DataQuest 2026 — Megalith IIT Kharagpur',
      title: 'MedScribe AI — Multimodal Radiology Copilot',
      tagline: 'Instant X-Ray & MRI segmentation with clinical note generation.',
      description: 'MedScribe leverages fine-tuned Vision-Language Models to localize anomalies on medical scans and draft standardized EHR reports for radiologist review.',
      projectUrl: 'https://medscribe.ai',
      githubUrl: 'https://github.com/priyanair/medscribe',
      techStack: JSON.stringify(['Python', 'PyTorch', 'FastAPI', 'React', 'AI/ML']),
      isSolo: false,
      teamName: 'InnovateLabs',
      status: 'Winner',
      isVerified: true,
      verificationDate: new Date('2026-08-12T11:20:00Z'),
      certificate: {
        fileUrl: '/uploads/certificates/cert_medscribe_priya.png',
        rawOcrText: 'DATAQUEST 2026 IIT KHARAGPUR. Winner Trophy awarded to Priya Nair for extraordinary technical achievement with MedScribe AI.',
        extractedName: 'Priya Nair',
        extractedHackathon: 'DataQuest 2026 — Megalith IIT Kharagpur',
        extractedAchievement: '1st Place Winner',
        extractedDate: '12 August 2026',
        confidenceScore: 99.1,
        status: 'VERIFIED'
      }
    },
    {
      username: 'rahulmehta',
      hackathonTitle: 'Hackwise 2026 — IEEE TEMS IIM Indore',
      title: 'LedgerGuard — Zero-Knowledge Fraud Sentinel',
      tagline: 'Real-time transaction anomaly detection preserving customer financial privacy.',
      description: 'High-throughput payment stream engine calculating fraud risk scores in under 12ms using graph convolutional networks and zk-SNARKs.',
      projectUrl: 'https://ledgerguard.io',
      githubUrl: 'https://github.com/rahulmehta/ledgerguard',
      techStack: JSON.stringify(['Node.js', 'PostgreSQL', 'Redis', 'Docker']),
      isSolo: false,
      teamName: 'CodeMasters',
      status: 'Winner',
      isVerified: true,
      verificationDate: new Date('2026-08-05T09:15:00Z'),
      certificate: {
        fileUrl: '/uploads/certificates/cert_ledgerguard_rahul.png',
        rawOcrText: 'HACKWISE 2026 IIM INDORE. Certificate of Achievement presented to Rahul Mehta for 2nd Place with LedgerGuard.',
        extractedName: 'Rahul Mehta',
        extractedHackathon: 'Hackwise 2026 — IEEE TEMS IIM Indore',
        extractedAchievement: '2nd Place',
        extractedDate: '05 August 2026',
        confidenceScore: 96.8,
        status: 'VERIFIED'
      }
    },
    {
      username: 'ananyakrishnan',
      hackathonTitle: 'Vivitsu 2026 National Hackathon',
      title: 'EcoGrid — LoRaWAN Smart Campus Energy Optimizer',
      tagline: 'Autonomous HVAC and lighting throttling via ambient occupant sensors.',
      description: 'A mesh of microcontrollers measuring carbon intensity and occupancy across campus buildings to trim electricity waste by 34%.',
      projectUrl: 'https://ecogrid.campus',
      githubUrl: 'https://github.com/ananyakrishnan/ecogrid',
      techStack: JSON.stringify(['C++', 'Python', 'AI/ML', 'Google Cloud']),
      isSolo: true,
      status: 'Winner',
      isVerified: true,
      verificationDate: new Date('2026-07-28T16:45:00Z'),
      certificate: {
        fileUrl: '/uploads/certificates/cert_ecogrid_ananya.png',
        rawOcrText: 'VIVITSU 2026 NATIONAL HACKATHON. 1st Prize awarded to Ananya Krishnan for project EcoGrid.',
        extractedName: 'Ananya Krishnan',
        extractedHackathon: 'Vivitsu 2026 National Hackathon',
        extractedAchievement: '1st Prize',
        extractedDate: '28 July 2026',
        confidenceScore: 97.4,
        status: 'VERIFIED'
      }
    },
    {
      username: 'karthikraj',
      hackathonTitle: 'MLH Global Hack Week 2026',
      title: 'AuraUI — Accessible Glassmorphism Component Library',
      tagline: 'Zero-runtime modern Tailwind design system designed for keyboard accessibility.',
      description: 'Over 40+ accessible React components with WCAG AAA contrast, smooth spring physics, and built-in screen reader announcements.',
      projectUrl: 'https://auraui.dev',
      githubUrl: 'https://github.com/karthikraj/auraui',
      techStack: JSON.stringify(['React', 'TypeScript', 'Next.js', 'Git']),
      isSolo: true,
      status: 'Submitted',
      isVerified: false
    }
  ];

  for (const p of projectsData) {
    const userId = userMap[p.username];
    const hackathonId = hackathonMap[p.hackathonTitle];
    const teamId = p.teamName ? teamMap[p.teamName] : null;

    const createdProject = await prisma.project.create({
      data: {
        userId,
        hackathonId,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        projectUrl: p.projectUrl,
        githubUrl: p.githubUrl,
        techStack: p.techStack,
        isSolo: p.isSolo,
        teamId,
        status: p.status,
        isVerified: p.isVerified,
        verificationDate: p.verificationDate,
        certificateUrl: p.certificate?.fileUrl
      }
    });

    if (p.certificate) {
      await prisma.certificate.create({
        data: {
          projectId: createdProject.id,
          userId,
          fileUrl: p.certificate.fileUrl,
          rawOcrText: p.certificate.rawOcrText,
          extractedName: p.certificate.extractedName,
          extractedHackathon: p.certificate.extractedHackathon,
          extractedAchievement: p.certificate.extractedAchievement,
          extractedDate: p.certificate.extractedDate,
          confidenceScore: p.certificate.confidenceScore,
          status: p.certificate.status,
          verifiedAt: p.verificationDate
        }
      });
    }
  }
  console.log(`✅ Seeded ${projectsData.length} projects with OCR certificates`);

  // 9. Assign Badges and Milestones to Arjun Sharma & Priya Nair
  const arjunId = userMap['arjunsharma'];
  const priyaId = userMap['priyanair'];

  const arjunBadges = ['FIRST_STEP', 'FIRST_WINNER', 'PROJECT_MASTER', 'HACKATHON_CHAMPION', 'PERFECT_TRUST', 'TEAM_PLAYER', 'TRUST_BUILDER'];
  for (const bCode of arjunBadges) {
    const badgeId = badgeMap[bCode];
    if (badgeId && arjunId) {
      await prisma.userBadge.create({ data: { userId: arjunId, badgeId } });
    }
  }

  const priyaBadges = ['FIRST_STEP', 'FIRST_WINNER', 'HACKATHON_CHAMPION', 'PERFECT_TRUST', 'TRUST_GUARDIAN'];
  for (const bCode of priyaBadges) {
    const badgeId = badgeMap[bCode];
    if (badgeId && priyaId) {
      await prisma.userBadge.create({ data: { userId: priyaId, badgeId } });
    }
  }

  const arjunMilestones = ['FIRST_PROJECT', 'FIRST_WIN', 'FIRST_TEAM', 'FIRST_CERTIFICATE', 'POINTS_50', 'POINTS_100', 'POINTS_500', 'RANK_TOP_10', 'RANK_NUM_ONE'];
  for (const mCode of arjunMilestones) {
    const milestoneId = milestoneMap[mCode];
    if (milestoneId && arjunId) {
      await prisma.userMilestone.create({ data: { userId: arjunId, milestoneId } });
    }
  }

  // 10. Create Notifications & Email Logs
  await prisma.notification.createMany({
    data: [
      {
        userId: arjunId,
        type: 'PROJECT_VERIFIED',
        title: 'Certificate Verified via OCR',
        message: 'Your certificate for "AI Innovation Challenge 2026" was verified with 98.5% confidence. +8 Trust Score!',
        link: '/projects',
        isRead: false
      },
      {
        userId: arjunId,
        type: 'BADGE_UNLOCKED',
        title: 'New Badge Unlocked: Perfect Trust!',
        message: 'Congratulations! You maintained over 95% Trust Score across verified hackathons.',
        link: '/dashboard',
        isRead: true
      },
      {
        userId: arjunId,
        type: 'RANK_CHANGED',
        title: 'Rank Promotion!',
        message: 'You have ascended to Rank #1 on the Individual Leaderboard.',
        link: '/leaderboard',
        isRead: true
      },
      {
        userId: priyaId,
        type: 'PROJECT_VERIFIED',
        title: 'Certificate Verified',
        message: 'Your certificate for "Global GenAI Hackathon 2026" has been verified. +8 Trust Score!',
        link: '/projects',
        isRead: false
      }
    ]
  });

  await prisma.emailNotification.createMany({
    data: [
      {
        userId: arjunId,
        recipientEmail: 'arjun@hacktracker.io',
        subject: '🎉 Certificate Verified: AI Innovation Challenge 2026 (+8 Trust Score)',
        templateType: 'PROJECT_VERIFIED',
        contentHtml: '<p>Hi Arjun, your certificate for AI Innovation Challenge 2026 has been successfully verified!</p>',
        status: 'SENT'
      },
      {
        userId: arjunId,
        recipientEmail: 'arjun@hacktracker.io',
        subject: '🏆 Milestone Achieved: Rank #1 on HackTracker!',
        templateType: 'RANK_CHANGED',
        contentHtml: '<p>Hi Arjun, congratulations on climbing to Rank #1 on the leaderboard!</p>',
        status: 'SENT'
      }
    ]
  });

  console.log('🌟 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
