import { useEffect } from 'react';
import type { DecisionLogicNode } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { evaluateDecisionLogic, isScoreResult } from '@/utils/flow-engine';

interface DecisionLogicNodeComponentProps {
  node: DecisionLogicNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onScore: (score: 0 | 1) => void;
}

export function DecisionLogicNodeComponent({
  node,
  context,
  onNavigate,
  onScore,
}: DecisionLogicNodeComponentProps) {
  useEffect(() => {
    const result = evaluateDecisionLogic(node, context);
    
    if (result) {
      if (isScoreResult(result) && result.result_score !== undefined) {
        if (result.next) {
          onNavigate(result.next);
        } else {
          onScore(result.result_score);
        }
      } else if ('next' in result && result.next) {
        onNavigate(result.next);
      }
    } else {
      onScore(0);
    }
  }, [node, context, onNavigate, onScore]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-slate-600">Evaluating response...</span>
      </div>
    </div>
  );
}
