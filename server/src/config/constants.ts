export const TRUST_SCORE_CONFIG = {
  BASE_SCORE: 50.0,
  OCR_VERIFIED_BONUS: 8.0,
  MANUAL_PROJECT_BONUS: 1.0,
  WINNER_BONUS: 5.0,
  CONSECUTIVE_VERIFIED_BONUS: 3.0,
  MAX_SCORE: 100.0,
  MIN_SCORE: 0.0,
};

export const POINTS_CONFIG = {
  PROJECT_SUBMISSION: 50,
  PROJECT_WIN: 200,
  BADGE_EARNED: 30,
  SKILL_ENDORSEMENT: 10,
  TEAM_PROJECT_BONUS: 20,
};

export const DEPARTMENTS = ['CSE', 'ECE', 'IT', 'AI & DS', 'Others'] as const;
export const YEARS = ['1st', '2nd', '3rd', '4th', 'Postgraduate'] as const;
export const PLATFORMS = ['Unstop', 'Devpost', 'HackerEarth', 'MLH', 'Kaggle'] as const;
