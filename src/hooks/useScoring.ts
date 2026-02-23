import { useMemo } from 'react';
import { useScreening } from './useScreening';
import { calculateInitialScore, getRiskCategory, getRiskItemsFromAnswers } from '@/utils/scoring';

export function useScoring() {
  const { session } = useScreening();
  
  const initialScore = useMemo(() => {
    return calculateInitialScore(session.initialAnswers);
  }, [session.initialAnswers]);
  
  const riskCategory = useMemo(() => {
    return getRiskCategory(initialScore);
  }, [initialScore]);
  
  const riskItems = useMemo(() => {
    return getRiskItemsFromAnswers(session.initialAnswers);
  }, [session.initialAnswers]);
  
  return {
    initialScore,
    riskCategory,
    riskItems,
    needsFollowUp: riskCategory === 'moderate' && riskItems.length > 0,
  };
}
