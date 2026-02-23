import type { FollowUpQuestionNode, ScoreResult } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { personalizeText } from '@/utils/flow-engine';

interface FollowUpQuestionNodeComponentProps {
  node: FollowUpQuestionNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onScore: (score: 0 | 1) => void;
  onSelectOption: (key: string, value: string) => void;
}

function isScoreResult(value: unknown): value is ScoreResult {
  return typeof value === 'object' && value !== null && 'result_score' in value;
}

export function FollowUpQuestionNodeComponent({
  node,
  context,
  onNavigate,
  onScore,
  onSelectOption,
}: FollowUpQuestionNodeComponentProps) {
  const { childName } = context;
  const currentNodeId = context.state.currentNodeId;
  const selectedOption = context.state.selectedOptions[currentNodeId] as string | undefined;

  const handleSelect = (optionKey: string) => {
    onSelectOption(currentNodeId, optionKey);
    const result = node.options[optionKey];
    
    if (typeof result === 'string') {
      onNavigate(result);
    } else if (isScoreResult(result)) {
      if (result.next) {
        onNavigate(result.next);
      }
      onScore(result.result_score);
    }
  };

  const options = Object.keys(node.options);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
          Follow-Up
        </span>
        <p className="text-lg text-slate-900 leading-relaxed">
          {personalizeText(node.text, childName)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all focus:ring-2 focus:ring-offset-2 ${
              selectedOption === option
                ? 'bg-primary-600 text-white ring-primary-500'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-slate-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
