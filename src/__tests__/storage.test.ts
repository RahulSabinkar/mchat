import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  saveSession, 
  loadSession, 
  clearSession, 
  createNewSession,
  hasStoredSession,
  generateSessionId
} from '@/utils/storage';
import type { ScreeningSession } from '@/types';

const STORAGE_KEY = 'mchat_session';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('saveSession', () => {
    it('saves session to localStorage', () => {
      const session: ScreeningSession = {
        id: 'test-id',
        createdAt: '2024-01-15T10:30:00.000Z',
        childInfo: { name: 'Test Child', dateOfBirth: '2022-01-01' },
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

      saveSession(session);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(session);
    });

    it('handles localStorage errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      const session: ScreeningSession = createNewSession();
      expect(() => saveSession(session)).not.toThrow();
    });
  });

  describe('loadSession', () => {
    it('returns null when no session stored', () => {
      expect(loadSession()).toBeNull();
    });

    it('returns stored session', () => {
      const session: ScreeningSession = {
        id: 'test-id',
        createdAt: '2024-01-15T10:30:00.000Z',
        childInfo: { name: 'Test Child', dateOfBirth: '2022-01-01' },
        status: 'in_progress',
        phase: 'initial_questions',
        currentQuestionIndex: 5,
        initialAnswers: { 1: true, 2: false },
        initialScore: null,
        followUpRequired: false,
        followUpAvailable: false,
        followUpAnswers: {},
        followUpScore: null,
        finalResult: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      
      expect(loadSession()).toEqual(session);
    });

    it('returns null and logs error for invalid JSON', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      expect(loadSession()).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'some data');
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      clearSession();
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('handles localStorage errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearSession()).not.toThrow();
    });
  });

  describe('hasStoredSession', () => {
    it('returns false when no session stored', () => {
      expect(hasStoredSession()).toBe(false);
    });

    it('returns true when session exists', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'test' }));
      expect(hasStoredSession()).toBe(true);
    });
  });

  describe('generateSessionId', () => {
    it('returns a string', () => {
      expect(typeof generateSessionId()).toBe('string');
    });

    it('returns unique ids', () => {
      const id1 = generateSessionId();
      vi.advanceTimersByTime(1);
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });

    it('contains timestamp', () => {
      const expectedTimestamp = new Date('2024-01-15T10:30:00.000Z').getTime();
      const id = generateSessionId();
      const timestamp = id.split('-')[0];
      expect(parseInt(timestamp)).toBe(expectedTimestamp);
    });
  });

  describe('createNewSession', () => {
    it('creates session with default values', () => {
      const session = createNewSession();

      expect(session).toMatchObject({
        childInfo: { name: '', dateOfBirth: '' },
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
      });
    });

    it('creates session with unique id', () => {
      const session1 = createNewSession();
      vi.advanceTimersByTime(1);
      const session2 = createNewSession();
      expect(session1.id).not.toBe(session2.id);
    });

    it('creates session with current timestamp', () => {
      const session = createNewSession();
      expect(session.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
