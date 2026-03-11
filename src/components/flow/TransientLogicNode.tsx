import { useEffect } from 'react';
import type { TransientLogicNode } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { evaluateTransientLogic, executeActions } from '@/utils/flow-engine';

interface TransientLogicNodeComponentProps {
  node: TransientLogicNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onScore: (score: 0 | 1) => void;
  onComplete: (hearingTestResult?: string) => void;
}

export function TransientLogicNodeComponent({
  node,
  context,
  onNavigate,
  onScore,
  onComplete,
}: TransientLogicNodeComponentProps) {
  useEffect(() => {
    const result = evaluateTransientLogic(node, context);
    
    if (result) {
      const { score } = executeActions(result.actions);
      
      if (score !== undefined) {
        onScore(score);
      }
      
      if (result.next && result.next !== 'completed') {
        onNavigate(result.next);
      } else {
        onComplete();
      }
    } else {
      onScore(0);
      onComplete();
    }
  }, [node, context, onNavigate, onScore, onComplete]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-slate-600">Evaluating response...</span>
      </div>
    </div>
  );
}
