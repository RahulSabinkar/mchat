import type { 
  FlowNode, 
  QuestionData, 
  FollowUpFlowState,
  DecisionLogicNode,
  ConditionResult,
  ScoreResult,
  ChecklistCategories
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
): ConditionResult | null {
  const { conditions } = node;
  const { checkedItems, selectedOptions } = context.state;

  for (const [conditionText, result] of Object.entries(conditions)) {
    if (evaluateCondition(conditionText, checkedItems, selectedOptions, context)) {
      return result;
    }
  }

  return null;
}

function evaluateCondition(
  conditionText: string,
  checkedItems: Record<string, string[]>,
  selectedOptions: Record<string, string | string[]>,
  context: FlowContext
): boolean {
  const currentNodeId = context.state.currentNodeId;
  const currentChecked = checkedItems[currentNodeId] || [];

  const lowerCondition = conditionText.toLowerCase();

  if (lowerCondition.includes('yes to any') && !lowerCondition.includes('no to all')) {
    if (lowerCondition.includes('without any 1 items')) {
      const zeroItems = getItemsForCategory(context.questionData, currentNodeId, '0') || [];
      const oneItems = getItemsForCategory(context.questionData, currentNodeId, '1') || [];
      const hasZero = zeroItems.some(item => currentChecked.includes(item));
      const hasOne = oneItems.some(item => currentChecked.includes(item));
      return hasZero && !hasOne;
    }
    return currentChecked.length > 0;
  }

  if (lowerCondition === 'yes to any' || lowerCondition.includes('yes to any of the above')) {
    return currentChecked.length > 0;
  }

  if (lowerCondition.includes('no to all')) {
    return currentChecked.length === 0;
  }

  if (lowerCondition.includes('yes to one or none')) {
    return currentChecked.length <= 1;
  }

  if (lowerCondition.includes('yes to two or more')) {
    return currentChecked.length >= 2;
  }

  if (lowerCondition.match(/^yes only to (\d+) example/)) {
    const match = lowerCondition.match(/^yes only to (\d+) example/);
    if (match) {
      const targetCategory = match[1];
      const categories = getCategories(context.questionData, currentNodeId);
      if (categories) {
        const categoryKeys = Object.keys(categories);
        const targetItems = getItemsForCategory(context.questionData, currentNodeId, targetCategory) || [];
        const otherCategory = categoryKeys.find(k => k.startsWith(targetCategory === '0' ? '1' : '0'));
        const otherItems = otherCategory ? getItemsForCategory(context.questionData, currentNodeId, otherCategory) || [] : [];
        
        const hasTarget = targetItems.some(item => currentChecked.includes(item));
        const hasOther = otherItems.some(item => currentChecked.includes(item));
        
        return hasTarget && !hasOther;
      }
    }
    return false;
  }

  if (lowerCondition.includes('yes to both')) {
    const match = lowerCondition.match(/yes to both (\d+) and (\d+) example/);
    if (match) {
      const cat1 = match[1];
      const cat2 = match[2];
      const items1 = getItemsForCategory(context.questionData, currentNodeId, cat1) || [];
      const items2 = getItemsForCategory(context.questionData, currentNodeId, cat2) || [];
      
      const has1 = items1.some(item => currentChecked.includes(item));
      const has2 = items2.some(item => currentChecked.includes(item));
      
      return has1 && has2;
    }
    return false;
  }

  if (lowerCondition.includes('no to both')) {
    return currentChecked.length === 0;
  }

  if (lowerCondition.includes('yes to either')) {
    return currentChecked.length >= 1;
  }

  if (conditionText.startsWith('If ')) {
    return evaluateSemanticCondition(conditionText, selectedOptions, currentChecked);
  }

  if (selectedOptions[currentNodeId]) {
    const selectedValue = selectedOptions[currentNodeId];
    if (typeof selectedValue === 'string') {
      return conditionText.includes(selectedValue) || selectedValue.includes(conditionText);
    }
  }

  return false;
}

function evaluateSemanticCondition(
  conditionText: string,
  _selectedOptions: Record<string, string | string[]>,
  currentChecked: string[]
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

  return false;
}

function getCategories(questionData: QuestionData, nodeId: string): ChecklistCategories | undefined {
  const node = questionData.flow[nodeId];
  if (node?.type === 'checklist' && 'categories' in node) {
    return node.categories;
  }
  return undefined;
}

function getItemsForCategory(
  questionData: QuestionData, 
  nodeId: string, 
  categoryPrefix: string
): string[] | undefined {
  const categories = getCategories(questionData, nodeId);
  if (!categories) return undefined;

  const matchingKey = Object.keys(categories).find(k => k.startsWith(categoryPrefix));
  if (!matchingKey) return undefined;

  const category = categories[matchingKey];
  if (Array.isArray(category)) {
    return category;
  }
  return category.items;
}

export function isScoreResult(result: ConditionResult): result is ScoreResult {
  return 'result_score' in result;
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
