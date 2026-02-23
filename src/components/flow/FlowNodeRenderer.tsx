import type { 
  InitialQuestionNode,
  InstructionNode,
  ChecklistNode,
  DecisionLogicNode,
  FollowUpQuestionNode,
  MandatoryFollowupNode,
  MultipleChoiceNode,
  FlowNode
} from '@/types';
import { InitialQuestionNodeComponent } from './InitialQuestionNode';
import { InstructionNodeComponent } from './InstructionNode';
import { ChecklistNodeComponent } from './ChecklistNode';
import { DecisionLogicNodeComponent } from './DecisionLogicNode';
import { FollowUpQuestionNodeComponent } from './FollowUpQuestionNode';
import { MandatoryFollowupNodeComponent } from './MandatoryFollowupNode';
import { MultipleChoiceNodeComponent } from './MultipleChoiceNode';
import type { FlowContext } from '@/utils/flow-engine';

interface FlowNodeRendererProps {
  node: FlowNode;
  context: FlowContext;
  onNavigate: (nodeId: string) => void;
  onScore: (score: 0 | 1) => void;
  onSelectOption: (key: string, value: string) => void;
  onCheckItems: (key: string, items: string[]) => void;
  onComplete: (hearingTestResult?: string) => void;
}

export function FlowNodeRenderer({
  node,
  context,
  onNavigate,
  onScore,
  onSelectOption,
  onCheckItems,
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
        />
      );
    
    case 'instruction':
      return (
        <InstructionNodeComponent
          node={node as InstructionNode}
          context={context}
          onNavigate={onNavigate}
        />
      );
    
    case 'checklist':
      return (
        <ChecklistNodeComponent
          node={node as ChecklistNode}
          context={context}
          onNavigate={onNavigate}
          onCheckItems={onCheckItems}
        />
      );
    
    case 'decision_logic':
      return (
        <DecisionLogicNodeComponent
          node={node as DecisionLogicNode}
          context={context}
          onNavigate={onNavigate}
          onScore={onScore}
        />
      );
    
    case 'followup_question':
      return (
        <FollowUpQuestionNodeComponent
          node={node as FollowUpQuestionNode}
          context={context}
          onNavigate={onNavigate}
          onScore={onScore}
          onSelectOption={onSelectOption}
        />
      );
    
    case 'mandatory_followup':
      return (
        <MandatoryFollowupNodeComponent
          node={node as MandatoryFollowupNode}
          context={context}
          onNavigate={onNavigate}
          onComplete={onComplete}
          onSelectOption={onSelectOption}
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
