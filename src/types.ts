export type UserRole = 'student' | 'admin';

export interface UserStats {
  totalStudyTime: number;
  quizCount: number;
  streak: number;
  velocity: number;
  xp: number;
  level: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  authorId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  date: string;
}

export interface StudyRoom {
  id: string;
  name: string;
  creatorId: string;
  participants: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
