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
  const { session, dispatch } = useScreening();
  const { currentQuestionIndex, initialAnswers, childInfo } = session;
  
  const totalQuestions = getTotalQuestions();
  const question = getQuestionByIndex(currentQuestionIndex);
  
  if (!question) {
    navigate('/results');
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
      navigate('/results');
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
        
        <div className="flex justify-center">
          <button
            onClick={() => dispatch({ type: 'SET_CURRENT_QUESTION', payload: currentQuestionIndex - 1 })}
            disabled={currentQuestionIndex === 0}
            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go to previous question
          </button>
        </div>
      </div>
    </Layout>
  );
}
