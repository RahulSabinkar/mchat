import type { FollowupQuestionNode, FlowTarget } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { personalizeText } from '@/utils/flow-engine';

interface FollowUpQuestionNodeComponentProps {
  node: FollowupQuestionNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onScore: (score: 0 | 1) => void;
  onSelectOption: (key: string, value: string) => void;
  onComplete: (hearingTestResult?: string) => void;
}

function hasScoreResult(target: FlowTarget): target is { result_score: 0 | 1; next?: string } {
  return 'result_score' in target;
}

export function FollowUpQuestionNodeComponent({
  node,
  context,
  onNavigate,
  onScore,
  onSelectOption,
  onComplete,
}: FollowUpQuestionNodeComponentProps) {
  const { childName } = context;
  const currentNodeId = context.state.currentNodeId;
  const selectedOption = context.state.selectedOptions[currentNodeId] as string | undefined;

  const handleSelect = (optionKey: string) => {
    onSelectOption(currentNodeId, optionKey);
    const result = node.options[optionKey];
    
    if (hasScoreResult(result)) {
      onScore(result.result_score);
      if (result.next && result.next !== 'end') {
        onNavigate(result.next);
      } else {
        onComplete();
      }
    } else {
      if (result.next && result.next !== 'end') {
        onNavigate(result.next);
      } else {
        onComplete();
      }
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
