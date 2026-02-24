import { AlertTriangle } from 'lucide-react';
import { getAllQuestions, personalizeQuestion } from '@/data/questions';

interface FlaggedItemsSectionProps {
  flaggedItems: number[];
  childName: string;
}

const riskItemExplanations: Record<number, string> = {
  1: 'Child may not respond to joint attention cues like pointing.',
  2: 'Child may show limited interest in other children.',
  3: 'Child may prefer solitary play over pretend play with others.',
  4: 'Child may not engage in imaginative or imitative play.',
  5: 'Child may show limited interest in interactive games.',
  6: 'Child may not point to request or share interest.',
  7: 'Child may not use gestures to comfort others.',
  8: 'Child may not share enjoyment or interests with others.',
  9: 'Child may not respond to their name consistently.',
  10: 'Child may not smile back when smiled at.',
  11: 'Child may show unusual sensitivity to everyday noises.',
  12: 'Child may not engage in reciprocal smiling or play.',
  13: 'Child may have difficulty with imitation.',
  14: 'Child may not show interest in other children.',
  15: 'Child may have limited response to pointing.',
  16: 'Child may not bring objects to show others.',
  17: 'Child may show limited eye contact.',
  18: 'Child may have difficulty understanding others\' emotions.',
  19: 'Child may not engage in pretend play.',
  20: 'Child may not respond to familiar voices consistently.',
};

export function FlaggedItemsSection({ flaggedItems, childName }: FlaggedItemsSectionProps) {
  if (flaggedItems.length === 0) {
    return null;
  }

  const questions = getAllQuestions();
  const flaggedQuestions = questions.filter(q => flaggedItems.includes(q.item_number));

  return (
    <div className="bg-red-50 rounded-xl border border-red-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-red-900">
          Flagged Items ({flaggedItems.length})
        </h3>
      </div>
      <p className="text-sm text-red-800">
        The following responses indicate behaviors that may warrant further evaluation:
      </p>
      <div className="space-y-3">
        {flaggedQuestions.map((question) => (
          <div
            key={question.item_number}
            className="bg-white rounded-lg border border-red-200 p-4"
          >
            <p className="text-sm font-medium text-slate-900 mb-1">
              Q{question.item_number}: {personalizeQuestion(question.question, childName)}
            </p>
            <p className="text-xs text-red-600">
              {riskItemExplanations[question.item_number] || 'This response indicates a potential developmental concern.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
