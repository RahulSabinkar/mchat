import { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { getAllQuestions, personalizeQuestion } from '@/data/questions';

interface QuestionsSummaryProps {
  answers: Record<number, boolean>;
  childName: string;
  flaggedItems: number[];
}

export function QuestionsSummary({ answers, childName, flaggedItems }: QuestionsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const questions = getAllQuestions();

  const isFlagged = (questionNum: number) => flaggedItems.includes(questionNum);

  const getAnswerIcon = (questionNum: number) => {
    const isRisk = isFlagged(questionNum);
    return isRisk ? (
      <X className="w-5 h-5 text-red-600" />
    ) : (
      <Check className="w-5 h-5 text-green-600" />
    );
  };

  const getAnswerLabel = (answer: boolean) => answer ? 'Yes' : 'No';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          All Questions ({questions.length})
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isExpanded && (
        <div className="border-t border-slate-200 divide-y divide-slate-100">
          {questions.map((question) => {
            const answer = answers[question.item_number];
            const flagged = isFlagged(question.item_number);
            
            return (
              <div
                key={question.item_number}
                className={`p-4 flex items-start gap-3 ${flagged ? 'bg-red-50' : ''}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAnswerIcon(question.item_number)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    {personalizeQuestion(question.question, childName)}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-xs font-medium ${flagged ? 'text-red-600' : 'text-slate-500'}`}>
                      Answer: {getAnswerLabel(answer)}
                    </span>
                    {flagged && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        At-risk response
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
