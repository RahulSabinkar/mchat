import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ScreeningSession, ChildInfo } from '@/types';
import { 
  saveSession, 
  loadSession, 
  clearSession, 
  createNewSession 
} from '@/utils/storage';
import { calculateInitialScore, getRiskItemsFromAnswers } from '@/utils/scoring';

type ScreeningAction =
  | { type: 'INIT_SESSION'; payload: ScreeningSession }
  | { type: 'SET_CHILD_INFO'; payload: ChildInfo }
  | { type: 'SET_PHASE'; payload: ScreeningSession['phase'] }
  | { type: 'ANSWER_QUESTION'; payload: { questionNumber: number; answer: boolean } }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'COMPLETE_INITIAL_QUESTIONS' }
  | { type: 'SET_FOLLOW_UP_RESULT'; payload: { questionNumber: number; finalScore: 0 | 1 } }
  | { type: 'COMPLETE_FOLLOW_UP'; payload: number }
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
      const followUpRequired = riskItems.length > 0 && initialScore >= 3 && initialScore <= 7;
      return {
        ...state,
        initialScore,
        followUpRequired,
        phase: followUpRequired ? 'follow_up' : 'results',
        status: followUpRequired ? 'in_progress' : 'completed',
        finalResult: followUpRequired ? null : (initialScore <= 2 ? 'low' : 'high'),
      };
    }
    
    case 'SET_FOLLOW_UP_RESULT': {
      const { questionNumber, finalScore } = action.payload;
      const newFollowUpAnswers = {
        ...state.followUpAnswers,
        [questionNumber]: {
          questionNumber,
          initialAnswer: state.initialAnswers[questionNumber],
          flowState: { currentNodeId: 'start', selectedOptions: {}, checkedItems: {} },
          finalScore,
        },
      };
      return { ...state, followUpAnswers: newFollowUpAnswers };
    }
    
    case 'COMPLETE_FOLLOW_UP': {
      return {
        ...state,
        followUpScore: action.payload,
        phase: 'results',
        status: 'completed',
        finalResult: action.payload >= 2 ? 'moderate_positive' : 'moderate_negative',
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
