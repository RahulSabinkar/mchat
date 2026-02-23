import { useState } from 'react';
import type { MultipleChoiceNode } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { personalizeText } from '@/utils/flow-engine';

interface MultipleChoiceNodeComponentProps {
  node: MultipleChoiceNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onComplete: (hearingTestResult?: string) => void;
}

export function MultipleChoiceNodeComponent({
  node,
  context,
  onNavigate,
  onComplete,
}: MultipleChoiceNodeComponentProps) {
  const { childName } = context;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = () => {
    if (!selectedOption) return;
    
    if (node.next === 'end' || !node.next) {
      onComplete(selectedOption);
    } else {
      onNavigate(node.next);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          Select One
        </span>
        <p className="text-lg text-slate-900 leading-relaxed">
          {personalizeText(node.text, childName)}
        </p>
      </div>

      <div className="space-y-2">
        {node.options.map((option, idx) => (
          <label
            key={idx}
            className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
              selectedOption === option
                ? 'bg-primary-50 border-2 border-primary-500'
                : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="multiple-choice"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
              className="h-5 w-5 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-slate-700">{option}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSelect}
          disabled={!selectedOption}
          className={`py-3 px-8 font-medium rounded-xl transition-all focus:ring-2 focus:ring-offset-2 ${
            selectedOption
              ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
