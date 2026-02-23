import type { MandatoryFollowupNode } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { personalizeText } from '@/utils/flow-engine';

interface MandatoryFollowupNodeComponentProps {
  node: MandatoryFollowupNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onComplete: (hearingTestResult?: string) => void;
  onSelectOption: (key: string, value: string) => void;
}

export function MandatoryFollowupNodeComponent({
  node,
  context,
  onNavigate,
  onComplete,
  onSelectOption,
}: MandatoryFollowupNodeComponentProps) {
  const { childName } = context;
  const currentNodeId = context.state.currentNodeId;
  const selectedOption = context.state.selectedOptions[currentNodeId] as string | undefined;

  const handleSelect = (optionKey: string) => {
    onSelectOption(currentNodeId, optionKey);
    const nextNodeId = node.options[optionKey];
    
    if (nextNodeId === 'end') {
      onComplete(optionKey === 'Yes' ? 'Tested' : 'Not tested');
    } else {
      onNavigate(nextNodeId);
    }
  };

  const options = Object.keys(node.options);

  return (
    <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6 space-y-6">
      {node.instruction && (
        <div className="bg-amber-100 px-3 py-2 rounded-lg">
          <p className="text-amber-800 font-medium text-sm">
            {node.instruction}
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
          Required Question
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
                ? 'bg-amber-600 text-white ring-amber-500'
                : 'bg-white text-slate-700 hover:bg-amber-100 ring-amber-400 border border-amber-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
