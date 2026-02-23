import type { RiskCategory, ScreeningResult, ScreeningResultCategory } from '@/types';
import { YES_RISK_ITEMS, NO_RISK_ITEMS } from '@/types';

export function calculateInitialScore(answers: Record<number, boolean>): number {
  let score = 0;
  
  for (const item of YES_RISK_ITEMS) {
    if (answers[item] === true) score++;
  }
  
  for (const item of NO_RISK_ITEMS) {
    if (answers[item] === false) score++;
  }
  
  return score;
}

export function getRiskCategory(score: number): RiskCategory {
  if (score <= 2) return 'low';
  if (score <= 7) return 'moderate';
  return 'high';
}

export function calculateFollowUpScore(
  followUpAnswers: Record<number, { finalScore: 0 | 1 }>
): number {
  return Object.values(followUpAnswers).reduce(
    (sum, answer) => sum + answer.finalScore, 
    0
  );
}

export function determineFinalResult(
  initialScore: number,
  followUpScore: number | null,
  childAgeInMonths?: number
): ScreeningResult {
  if (initialScore <= 2) {
    return {
      category: 'low',
      initialScore,
      followUpScore: null,
      recommendation: 'No further action required unless surveillance indicates elevated likelihood of ASD.',
      rescreenRecommended: childAgeInMonths !== undefined && childAgeInMonths < 24,
    };
  }
  
  if (initialScore >= 8) {
    return {
      category: 'high',
      initialScore,
      followUpScore: null,
      recommendation: 'Refer immediately for diagnostic evaluation and early intervention eligibility.',
      rescreenRecommended: false,
    };
  }
  
  if (followUpScore === null) {
    return {
      category: 'moderate_positive',
      initialScore,
      followUpScore: null,
      recommendation: 'Follow-up questions are required to complete the screening.',
      rescreenRecommended: false,
    };
  }
  
  if (followUpScore >= 2) {
    return {
      category: 'moderate_positive',
      initialScore,
      followUpScore,
      recommendation: 'Refer for diagnostic evaluation and early intervention eligibility.',
      rescreenRecommended: false,
    };
  }
  
  return {
    category: 'moderate_negative',
    initialScore,
    followUpScore,
    recommendation: 'No further action required unless surveillance indicates elevated likelihood of ASD. Rescreen at future visits.',
    rescreenRecommended: true,
  };
}

export function getRiskItemsFromAnswers(answers: Record<number, boolean>): number[] {
  const riskItems: number[] = [];
  
  for (const item of YES_RISK_ITEMS) {
    if (answers[item] === true) riskItems.push(item);
  }
  
  for (const item of NO_RISK_ITEMS) {
    if (answers[item] === false) riskItems.push(item);
  }
  
  return riskItems;
}

export function getResultMessage(category: ScreeningResultCategory): string {
  switch (category) {
    case 'low':
      return 'Low Risk';
    case 'moderate_negative':
      return 'Moderate Risk - Screen Negative';
    case 'moderate_positive':
      return 'Moderate Risk - Screen Positive';
    case 'high':
      return 'High Risk - Screen Positive';
  }
}
