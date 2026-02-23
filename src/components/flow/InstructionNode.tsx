import type { InstructionNode } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { personalizeText } from '@/utils/flow-engine';

interface InstructionNodeComponentProps {
  node: InstructionNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onComplete: () => void;
}

export function InstructionNodeComponent({
  node,
  context,
  onNavigate,
  onComplete,
}: InstructionNodeComponentProps) {
  const { childName } = context;

  const handleContinue = () => {
    if (node.next && node.next !== 'end') {
      onNavigate(node.next);
    } else {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          Instruction
        </span>
        <p className="text-lg text-slate-900 leading-relaxed whitespace-pre-line">
          {personalizeText(node.text, childName)}
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          className="py-3 px-8 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
