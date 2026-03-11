import type { 
  InitialQuestionNode,
  InstructionNode,
  ChecklistNode,
  TransientLogicNode,
  FollowupQuestionNode,
  MultipleChoiceNode,
  FlowNode
} from '@/types';
import { InitialQuestionNodeComponent } from './InitialQuestionNode';
import { InstructionNodeComponent } from './InstructionNode';
import { ChecklistNodeComponent } from './ChecklistNode';
import { TransientLogicNodeComponent } from './TransientLogicNode';
import { FollowUpQuestionNodeComponent } from './FollowUpQuestionNode';
import { MultipleChoiceNodeComponent } from './MultipleChoiceNode';
import type { FlowContext } from '@/utils/flow-engine';

interface FlowNodeRendererProps {
  node: FlowNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onScore: (score: 0 | 1) => void;
  onSelectOption: (key: string, value: string) => void;
  onNavigateWithItems: (nodeId: string, key: string, items: string[]) => void;
  onComplete: (hearingTestResult?: string) => void;
}

export function FlowNodeRenderer({
  node,
  context,
  onNavigate,
  onScore,
  onSelectOption,
  onNavigateWithItems,
  onComplete,
}: FlowNodeRendererProps) {
  switch (node.type) {
    case 'initial_question':
      return (
        <InitialQuestionNodeComponent
          node={node as InitialQuestionNode}
          context={context}
          onNavigate={onNavigate}
          onScore={onScore}
          onSelectOption={onSelectOption}
          onComplete={onComplete}
        />
      );
    
    case 'instruction':
      return (
        <InstructionNodeComponent
          node={node as InstructionNode}
          context={context}
          onNavigate={onNavigate}
          onComplete={onComplete}
        />
      );
    
    case 'checklist':
      return (
        <ChecklistNodeComponent
          node={node as ChecklistNode}
          context={context}
          onNavigateWithItems={onNavigateWithItems}
        />
      );
    
    case 'transient_logic':
      return (
        <TransientLogicNodeComponent
          node={node as TransientLogicNode}
          context={context}
          onNavigate={onNavigate}
          onScore={onScore}
          onComplete={onComplete}
        />
      );
    
    case 'followup_question':
      return (
        <FollowUpQuestionNodeComponent
          node={node as FollowupQuestionNode}
          context={context}
          onNavigate={onNavigate}
          onScore={onScore}
          onSelectOption={onSelectOption}
          onComplete={onComplete}
        />
      );
    
    case 'multiple_choice':
      return (
        <MultipleChoiceNodeComponent
          node={node as MultipleChoiceNode}
          context={context}
          onNavigate={onNavigate}
          onComplete={onComplete}
        />
      );
    
    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Unknown node type: {(node as FlowNode).type}</p>
        </div>
      );
  }
}
