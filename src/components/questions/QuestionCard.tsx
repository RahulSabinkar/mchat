import { getCopyright } from '@/data/questions';

interface QuestionCardProps {
  questionNumber: number;
  questionText: string;
  onAnswer: (answer: boolean) => void;
  answer?: boolean;
  disabled?: boolean;
}

export function QuestionCard({ 
  questionNumber, 
  questionText, 
  onAnswer, 
  answer,
  disabled 
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
          Question {questionNumber} of 20
        </span>
        <p className="text-lg text-slate-900 leading-relaxed">
          {questionText}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onAnswer(true)}
          disabled={disabled}
          className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all focus:ring-2 focus:ring-offset-2 ${
            answer === true
              ? 'bg-primary-600 text-white ring-primary-500'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-slate-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-pressed={answer === true}
        >
          Yes
        </button>
        <button
          onClick={() => onAnswer(false)}
          disabled={disabled}
          className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all focus:ring-2 focus:ring-offset-2 ${
            answer === false
              ? 'bg-primary-600 text-white ring-primary-500'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-slate-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-pressed={answer === false}
        >
          No
        </button>
      </div>
      
      <p className="text-xs text-slate-400 text-center">
        {getCopyright()}
      </p>
    </div>
  );
}
