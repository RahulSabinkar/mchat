import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ScreeningSession, ChildInfo, FollowUpFlowState } from '@/types';
import { 
  saveSession, 
  loadSession, 
  clearSession, 
  createNewSession 
} from '@/utils/storage';
import { calculateInitialScore, getRiskItemsFromAnswers, calculateFollowUpScore } from '@/utils/scoring';

type ScreeningAction =
  | { type: 'INIT_SESSION'; payload: ScreeningSession }
  | { type: 'SET_CHILD_INFO'; payload: ChildInfo }
  | { type: 'SET_PHASE'; payload: ScreeningSession['phase'] }
  | { type: 'ANSWER_QUESTION'; payload: { questionNumber: number; answer: boolean } }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'COMPLETE_INITIAL_QUESTIONS' }
  | { type: 'INIT_FOLLOW_UP'; payload: { questionNumber: number; flowState: FollowUpFlowState } }
  | { type: 'UPDATE_FOLLOW_UP_FLOW'; payload: { questionNumber: number; flowState: FollowUpFlowState } }
  | { type: 'COMPLETE_FOLLOW_UP_QUESTION'; payload: { questionNumber: number; finalScore: 0 | 1; hearingTestResult?: string } }
  | { type: 'COMPLETE_FOLLOW_UP' }
  | { type: 'SET_FINAL_RESULT'; payload: ScreeningSession['finalResult'] }
  | { type: 'RESET_SESSION' }
  | { type: 'GO_BACK' };

function screeningReducer(state: ScreeningSession, action: ScreeningAction): ScreeningSession {
  switch (action.type) {
    case 'INIT_SESSION':
      return action.payload;
    
    case 'SET_CHILD_INFO': {
      return { ...state, childInfo: action.payload };
    }
    
    case 'SET_PHASE': {
      return { ...state, phase: action.payload };
    }
    
    case 'ANSWER_QUESTION': {
      const { questionNumber, answer } = action.payload;
      const newAnswers = { ...state.initialAnswers, [questionNumber]: answer };
      return { 
        ...state, 
        initialAnswers: newAnswers,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    }
    
    case 'SET_CURRENT_QUESTION': {
      return { ...state, currentQuestionIndex: action.payload };
    }
    
    case 'COMPLETE_INITIAL_QUESTIONS': {
      const initialScore = calculateInitialScore(state.initialAnswers);
      const riskItems = getRiskItemsFromAnswers(state.initialAnswers);
      const hasRiskItems = riskItems.length > 0;
      const isModerateRisk = initialScore >= 3 && initialScore <= 7;
      const isHighRisk = initialScore >= 8;
      
      // Follow-up is required for moderate risk (3-7), optional for high risk (8+)
      const followUpRequired = hasRiskItems && isModerateRisk;
      const followUpAvailable = hasRiskItems && (isModerateRisk || isHighRisk);
      
      return {
        ...state,
        initialScore,
        followUpRequired,
        followUpAvailable,
        phase: followUpRequired ? 'follow_up' : 'results',
        status: followUpRequired ? 'in_progress' : 'completed',
        finalResult: followUpRequired ? null : (initialScore <= 2 ? 'low' : 'high'),
      };
    }
    
    case 'INIT_FOLLOW_UP': {
      const { questionNumber, flowState } = action.payload;
      const newFollowUpAnswers = {
        ...state.followUpAnswers,
        [questionNumber]: {
          questionNumber,
          initialAnswer: state.initialAnswers[questionNumber],
          flowState,
          finalScore: 0 as const,
        },
      };
      return { ...state, followUpAnswers: newFollowUpAnswers };
    }
    
    case 'UPDATE_FOLLOW_UP_FLOW': {
      const { questionNumber, flowState } = action.payload;
      const existingResult = state.followUpAnswers[questionNumber];
      if (!existingResult) return state;
      
      const newFollowUpAnswers = {
        ...state.followUpAnswers,
        [questionNumber]: {
          ...existingResult,
          flowState,
        },
      };
      return { ...state, followUpAnswers: newFollowUpAnswers };
    }
    
    case 'COMPLETE_FOLLOW_UP_QUESTION': {
      const { questionNumber, finalScore, hearingTestResult } = action.payload;
      const existingResult = state.followUpAnswers[questionNumber];
      if (!existingResult) return state;
      
      const newFollowUpAnswers = {
        ...state.followUpAnswers,
        [questionNumber]: {
          ...existingResult,
          finalScore,
          hearingTestResult,
        },
      };
      return { ...state, followUpAnswers: newFollowUpAnswers };
    }
    
    case 'COMPLETE_FOLLOW_UP': {
      const followUpScore = calculateFollowUpScore(state.followUpAnswers);
      return {
        ...state,
        followUpScore,
        phase: 'results',
        status: 'completed',
        finalResult: followUpScore >= 2 ? 'moderate_positive' : 'moderate_negative',
      };
    }
    
    case 'SET_FINAL_RESULT': {
      return { ...state, finalResult: action.payload, status: 'completed' };
    }
    
    case 'RESET_SESSION': {
      return createNewSession();
    }
    
    case 'GO_BACK': {
      const newIndex = Math.max(0, state.currentQuestionIndex - 1);
      return { ...state, currentQuestionIndex: newIndex };
    }
    
    default:
      return state;
  }
}

interface ScreeningContextType {
  session: ScreeningSession;
  dispatch: React.Dispatch<ScreeningAction>;
  resetSession: () => void;
}

const ScreeningContext = createContext<ScreeningContextType | null>(null);

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(screeningReducer, null, () => {
    const stored = loadSession();
    return stored || createNewSession();
  });
  
  useEffect(() => {
    saveSession(session);
  }, [session]);
  
  const resetSession = () => {
    clearSession();
    dispatch({ type: 'RESET_SESSION' });
  };
  
  return (
    <ScreeningContext.Provider value={{ session, dispatch, resetSession }}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) {
    throw new Error('useScreening must be used within a ScreeningProvider');
  }
  return context;
}
