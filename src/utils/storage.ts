import type { ScreeningSession } from '@/types';

const STORAGE_KEY_PREFIX = 'mchat_';
const SESSION_KEY = `${STORAGE_KEY_PREFIX}session`;

export function saveSession(session: ScreeningSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSession(): ScreeningSession | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored) as ScreeningSession;
    }
  } catch (error) {
    console.error('Failed to load session:', error);
  }
  return null;
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

export function hasStoredSession(): boolean {
  return localStorage.getItem(SESSION_KEY) !== null;
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function createNewSession(): ScreeningSession {
  return {
    id: generateSessionId(),
    createdAt: new Date().toISOString(),
    childInfo: {
      name: '',
      dateOfBirth: '',
    },
    status: 'in_progress',
    phase: 'intro',
    currentQuestionIndex: 0,
    initialAnswers: {},
    initialScore: null,
    followUpRequired: false,
    followUpAvailable: false,
    followUpAnswers: {},
    followUpScore: null,
    finalResult: null,
  };
}
