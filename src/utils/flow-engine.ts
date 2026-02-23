import type { 
  FlowNode, 
  QuestionData, 
  FollowUpFlowState,
  DecisionLogicNode,
  FlowTarget,
  ChecklistNode
} from '@/types';

export interface FlowContext {
  questionData: QuestionData;
  state: FollowUpFlowState;
  childName: string;
}

export interface FlowResult {
  completed: boolean;
  finalScore?: 0 | 1;
  nextNodeId?: string;
  state: FollowUpFlowState;
  hearingTestResult?: string;
}

export function getCurrentNode(context: FlowContext): FlowNode | undefined {
  const { questionData, state } = context;
  return questionData.flow[state.currentNodeId];
}

export function advanceToNode(context: FlowContext, nodeId: string): FlowContext {
  return {
    ...context,
    state: {
      ...context.state,
      currentNodeId: nodeId,
    },
  };
}

export function setSelectedOption(
  context: FlowContext, 
  key: string, 
  value: string
): FlowContext {
  return {
    ...context,
    state: {
      ...context.state,
      selectedOptions: {
        ...context.state.selectedOptions,
        [key]: value,
      },
    },
  };
}

export function setCheckedItems(
  context: FlowContext,
  key: string,
  items: string[]
): FlowContext {
  return {
    ...context,
    state: {
      ...context.state,
      checkedItems: {
        ...context.state.checkedItems,
        [key]: items,
      },
    },
  };
}

export function evaluateDecisionLogic(
  node: DecisionLogicNode,
  context: FlowContext
): FlowTarget | null {
  const { conditions, semantic_conditions } = node;
  const { checkedItems, selectedOptions } = context.state;
  const currentNodeId = context.state.currentNodeId;
  const currentChecked = checkedItems[currentNodeId] || [];

  const passItems = getItemsForCategory(context.questionData, currentNodeId, 'pass_examples') || [];
  const riskItems = getItemsForCategory(context.questionData, currentNodeId, 'risk_examples') || [];

  const hasPass = passItems.some(item => currentChecked.includes(item));
  const hasRisk = riskItems.some(item => currentChecked.includes(item));
  const count = currentChecked.length;

  if (conditions.both_selected && hasPass && hasRisk) {
    return conditions.both_selected;
  }
  
  if (conditions.only_pass_selected && hasPass && !hasRisk) {
    return conditions.only_pass_selected;
  }
  
  if (conditions.only_risk_selected && hasRisk && !hasPass) {
    return conditions.only_risk_selected;
  }
  
  if (conditions.count_threshold) {
    const threshold = conditions.count_threshold;
    const min = threshold.min ?? 0;
    const max = threshold.max ?? Infinity;
    if (count >= min && count <= max) {
      const { min: _, max: __, ...target } = threshold;
      return target as FlowTarget;
    }
  }
  
  if (conditions.any_selected && count > 0) {
    return conditions.any_selected;
  }
  
  if (conditions.none_selected && count === 0) {
    return conditions.none_selected;
  }

  if (semantic_conditions) {
    for (const [conditionText, result] of Object.entries(semantic_conditions)) {
      if (evaluateSemanticCondition(conditionText, selectedOptions, currentChecked, currentNodeId)) {
        return result;
      }
    }
  }

  return null;
}

function evaluateSemanticCondition(
  conditionText: string,
  selectedOptions: Record<string, string | string[]>,
  currentChecked: string[],
  currentNodeId: string
): boolean {
  const lowerCondition = conditionText.toLowerCase();

  if (lowerCondition.includes('example indicates that child can understand')) {
    return currentChecked.some(item => 
      item.toLowerCase().includes('shoe') ||
      item.toLowerCase().includes('blanket') ||
      item.toLowerCase().includes('book') ||
      item.toLowerCase().includes('command') ||
      item.toLowerCase().includes('understand')
    );
  }

  if (lowerCondition.includes('example does not indicate that child can understand')) {
    return !currentChecked.some(item => 
      item.toLowerCase().includes('shoe') ||
      item.toLowerCase().includes('blanket') ||
      item.toLowerCase().includes('book') ||
      item.toLowerCase().includes('command') ||
      item.toLowerCase().includes('understand')
    );
  }

  if (selectedOptions[currentNodeId]) {
    const selectedValue = selectedOptions[currentNodeId];
    if (typeof selectedValue === 'string') {
      return conditionText.includes(selectedValue) || selectedValue.includes(conditionText);
    }
  }

  return false;
}

function getCategories(questionData: QuestionData, nodeId: string): ChecklistNode['categories'] | undefined {
  const node = questionData.flow[nodeId];
  if (node?.type === 'checklist' && 'categories' in node) {
    return node.categories;
  }
  return undefined;
}

function getItemsForCategory(
  questionData: QuestionData, 
  nodeId: string, 
  categoryName: string
): string[] | undefined {
  const categories = getCategories(questionData, nodeId);
  if (!categories) return undefined;

  const category = categories[categoryName as keyof typeof categories];
  if (!category) return undefined;

  return category.items;
}

export function isScoreResult(target: FlowTarget): target is { result_score: 0 | 1 } {
  return 'result_score' in target;
}

export function getFlowProgress(context: FlowContext): { current: number; total: number } {
  const nodeIds = Object.keys(context.questionData.flow);
  const currentIndex = nodeIds.indexOf(context.state.currentNodeId);
  return {
    current: currentIndex + 1,
    total: nodeIds.length,
  };
}

export function personalizeText(text: string, childName: string): string {
  return text.replace(/_+/g, childName);
}
