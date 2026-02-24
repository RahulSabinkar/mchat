import { describe, it, expect } from 'vitest';
import { 
  calculateInitialScore, 
  getRiskCategory, 
  getRiskItemsFromAnswers,
  determineFinalResult 
} from '@/utils/scoring';
import { YES_RISK_ITEMS, NO_RISK_ITEMS } from '@/types';

describe('calculateInitialScore', () => {
  it('returns 0 for empty answers', () => {
    expect(calculateInitialScore({})).toBe(0);
  });

  it('counts YES answers for YES_RISK_ITEMS correctly', () => {
    const answers: Record<number, boolean> = {
      [YES_RISK_ITEMS[0]]: true,
      [YES_RISK_ITEMS[1]]: true,
      [YES_RISK_ITEMS[2]]: false,
    };
    expect(calculateInitialScore(answers)).toBe(2);
  });

  it('counts NO answers for NO_RISK_ITEMS correctly', () => {
    const answers: Record<number, boolean> = {
      [NO_RISK_ITEMS[0]]: false,
      [NO_RISK_ITEMS[1]]: false,
      [NO_RISK_ITEMS[2]]: true,
    };
    expect(calculateInitialScore(answers)).toBe(2);
  });

  it('does not count YES answers for NO_RISK_ITEMS', () => {
    const answers: Record<number, boolean> = {
      [NO_RISK_ITEMS[0]]: true,
      [NO_RISK_ITEMS[1]]: true,
    };
    expect(calculateInitialScore(answers)).toBe(0);
  });

  it('does not count NO answers for YES_RISK_ITEMS', () => {
    const answers: Record<number, boolean> = {
      [YES_RISK_ITEMS[0]]: false,
      [YES_RISK_ITEMS[1]]: false,
    };
    expect(calculateInitialScore(answers)).toBe(0);
  });

  it('calculates mixed answers correctly', () => {
    const answers: Record<number, boolean> = {
      [YES_RISK_ITEMS[0]]: true,
      [NO_RISK_ITEMS[0]]: false,
      [YES_RISK_ITEMS[1]]: false,
      [NO_RISK_ITEMS[1]]: true,
    };
    expect(calculateInitialScore(answers)).toBe(2);
  });

  it('ignores unknown question numbers', () => {
    const answers: Record<number, boolean> = {
      100: true,
      200: false,
    };
    expect(calculateInitialScore(answers)).toBe(0);
  });
});

describe('getRiskCategory', () => {
  it('returns "low" for score 0-2', () => {
    expect(getRiskCategory(0)).toBe('low');
    expect(getRiskCategory(1)).toBe('low');
    expect(getRiskCategory(2)).toBe('low');
  });

  it('returns "moderate" for score 3-7', () => {
    expect(getRiskCategory(3)).toBe('moderate');
    expect(getRiskCategory(5)).toBe('moderate');
    expect(getRiskCategory(7)).toBe('moderate');
  });

  it('returns "high" for score 8+', () => {
    expect(getRiskCategory(8)).toBe('high');
    expect(getRiskCategory(10)).toBe('high');
    expect(getRiskCategory(20)).toBe('high');
  });
});

describe('getRiskItemsFromAnswers', () => {
  it('returns empty array for empty answers', () => {
    expect(getRiskItemsFromAnswers({})).toEqual([]);
  });

  it('returns question numbers where YES_RISK_ITEMS answered true', () => {
    const answers: Record<number, boolean> = {
      [YES_RISK_ITEMS[0]]: true,
      [YES_RISK_ITEMS[1]]: true,
      [YES_RISK_ITEMS[2]]: false,
    };
    const result = getRiskItemsFromAnswers(answers);
    expect(result).toContain(YES_RISK_ITEMS[0]);
    expect(result).toContain(YES_RISK_ITEMS[1]);
    expect(result).not.toContain(YES_RISK_ITEMS[2]);
  });

  it('returns question numbers where NO_RISK_ITEMS answered false', () => {
    const answers: Record<number, boolean> = {
      [NO_RISK_ITEMS[0]]: false,
      [NO_RISK_ITEMS[1]]: false,
      [NO_RISK_ITEMS[2]]: true,
    };
    const result = getRiskItemsFromAnswers(answers);
    expect(result).toContain(NO_RISK_ITEMS[0]);
    expect(result).toContain(NO_RISK_ITEMS[1]);
    expect(result).not.toContain(NO_RISK_ITEMS[2]);
  });

  it('returns array of risk items (order matches iteration)', () => {
    const answers: Record<number, boolean> = {
      [NO_RISK_ITEMS[5]]: false,
      [NO_RISK_ITEMS[0]]: false,
      [YES_RISK_ITEMS[0]]: true,
    };
    const result = getRiskItemsFromAnswers(answers);
    expect(result.length).toBe(3);
    expect(result).toContain(YES_RISK_ITEMS[0]);
    expect(result).toContain(NO_RISK_ITEMS[0]);
    expect(result).toContain(NO_RISK_ITEMS[5]);
  });
});

describe('determineFinalResult', () => {
  describe('low risk (score 0-2)', () => {
    it('returns low category for score 0', () => {
      const result = determineFinalResult(0, null);
      expect(result.category).toBe('low');
      expect(result.followUpScore).toBeNull();
      expect(result.rescreenRecommended).toBe(false);
    });

    it('returns low category for score 2', () => {
      const result = determineFinalResult(2, null);
      expect(result.category).toBe('low');
    });

    it('recommends rescreen for children under 24 months', () => {
      const result = determineFinalResult(1, null, 18);
      expect(result.rescreenRecommended).toBe(true);
    });

    it('does not recommend rescreen for children 24+ months', () => {
      const result = determineFinalResult(1, null, 24);
      expect(result.rescreenRecommended).toBe(false);
    });
  });

  describe('high risk (score 8+)', () => {
    it('returns high category for score 8', () => {
      const result = determineFinalResult(8, null);
      expect(result.category).toBe('high');
      expect(result.followUpScore).toBeNull();
      expect(result.rescreenRecommended).toBe(false);
    });

    it('returns high category for score 20', () => {
      const result = determineFinalResult(20, null);
      expect(result.category).toBe('high');
    });
  });

  describe('moderate risk (score 3-7)', () => {
    it('returns moderate_positive when followUpScore is null', () => {
      const result = determineFinalResult(5, null);
      expect(result.category).toBe('moderate_positive');
      expect(result.followUpScore).toBeNull();
    });

    it('returns moderate_positive when followUpScore >= 2', () => {
      const result = determineFinalResult(5, 2);
      expect(result.category).toBe('moderate_positive');
      expect(result.followUpScore).toBe(2);
    });

    it('returns moderate_positive when followUpScore is 3', () => {
      const result = determineFinalResult(5, 3);
      expect(result.category).toBe('moderate_positive');
    });

    it('returns moderate_negative when followUpScore < 2', () => {
      const result = determineFinalResult(5, 0);
      expect(result.category).toBe('moderate_negative');
      expect(result.followUpScore).toBe(0);
      expect(result.rescreenRecommended).toBe(true);
    });

    it('returns moderate_negative when followUpScore is 1', () => {
      const result = determineFinalResult(5, 1);
      expect(result.category).toBe('moderate_negative');
      expect(result.rescreenRecommended).toBe(true);
    });
  });
});
