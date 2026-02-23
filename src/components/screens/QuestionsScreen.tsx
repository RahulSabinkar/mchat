import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { QuestionCard, ProgressBar } from '@/components/questions';
import { useScreening } from '@/context/ScreeningContext';
import { 
  getQuestionByIndex, 
  getTotalQuestions, 
  personalizeQuestion 
} from '@/data/questions';

export function QuestionsScreen() {
  const navigate = useNavigate();
  const { session, dispatch, resetSession } = useScreening();
  const { currentQuestionIndex, initialAnswers, childInfo, phase } = session;
  
  console.log('[QuestionsScreen] Render - phase:', phase, 'currentQuestionIndex:', currentQuestionIndex);
  
  const totalQuestions = getTotalQuestions();
  const question = getQuestionByIndex(currentQuestionIndex);
  
  console.log('[QuestionsScreen] question:', question?.item_number, 'totalQuestions:', totalQuestions);
  
  useEffect(() => {
    console.log('[QuestionsScreen] useEffect - phase:', phase);
    if (phase === 'intro') {
      console.log('[QuestionsScreen] Navigating to /');
      navigate('/', { replace: true });
    } else if (phase === 'follow_up') {
      console.log('[QuestionsScreen] Navigating to /followup');
      navigate('/followup', { replace: true });
    } else if (phase === 'results') {
      console.log('[QuestionsScreen] Navigating to /results');
      navigate('/results', { replace: true });
    } else if (phase === 'initial_questions' && !question) {
      console.log('[QuestionsScreen] Invalid state - navigating to /');
      navigate('/', { replace: true });
    }
  }, [phase, question, navigate]);
  
  if (phase !== 'initial_questions') {
    console.log('[QuestionsScreen] Returning null - phase is not initial_questions');
    return null;
  }
  
  if (!question) {
    console.log('[QuestionsScreen] Returning null - no question found, useEffect will navigate');
    return null;
  }
  
  const questionText = personalizeQuestion(question.question, childInfo.name);
  const currentAnswer = initialAnswers[question.item_number];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  
  const handleAnswer = (answer: boolean) => {
    dispatch({ 
      type: 'ANSWER_QUESTION', 
      payload: { questionNumber: question.item_number, answer } 
    });
    
    if (isLastQuestion) {
      dispatch({ type: 'COMPLETE_INITIAL_QUESTIONS' });
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: currentQuestionIndex - 1 });
    } else {
      navigate('/info');
    }
  };
  
  return (
    <Layout showBackButton onBack={handleBack}>
      <div className="space-y-6">
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        
        <QuestionCard
          questionNumber={question.item_number}
          questionText={questionText}
          onAnswer={handleAnswer}
          answer={currentAnswer}
        />
        
        <div className="flex justify-center gap-6">
          <button
            onClick={() => dispatch({ type: 'SET_CURRENT_QUESTION', payload: currentQuestionIndex - 1 })}
            disabled={currentQuestionIndex === 0}
            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go to previous question
          </button>
          <button
            onClick={() => {
              resetSession();
              navigate('/');
            }}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Start Over
          </button>
        </div>
      </div>
    </Layout>
  );
}
