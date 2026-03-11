import type { FollowupQuestionNode, FlowOption } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { personalizeText, getScoreFromActions } from '@/utils/flow-engine';

interface FollowUpQuestionNodeComponentProps {
  node: FollowupQuestionNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onScore: (score: 0 | 1) => void;
  onSelectOption: (key: string, value: string) => void;
  onComplete: (hearingTestResult?: string) => void;
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

  const handleSelect = (option: FlowOption) => {
    onSelectOption(currentNodeId, option.label);
    
    const actions = option.actions || [];
    const score = getScoreFromActions(actions);
    
    if (score !== undefined) {
      onScore(score);
    }
    
    if (option.next && option.next !== 'completed') {
      onNavigate(option.next);
    } else {
      onComplete();
    }
  };

  const options = node.options;

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
            key={option.label}
            onClick={() => handleSelect(option)}
            className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all focus:ring-2 focus:ring-offset-2 ${
              selectedOption === option.label
                ? 'bg-primary-600 text-white ring-primary-500'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-slate-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}