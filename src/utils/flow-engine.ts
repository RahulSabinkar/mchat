import type { 
  FlowNode, 
  QuestionData, 
  FollowUpFlowState,
  TransientLogicNode,
  FlowAction,
  FlowCondition,
  ChecklistCategory
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

export interface EvaluationResult {
  next?: string;
  actions: FlowAction[];
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

export function evaluateTransientLogic(
  node: TransientLogicNode,
  context: FlowContext
): EvaluationResult | null {
  const { conditions } = node;
  const { checkedItems } = context.state;
  const currentNodeId = context.state.currentNodeId;
  const currentChecked = checkedItems[currentNodeId] || [];

  const passItems = getItemsForCategory(context.questionData, currentNodeId, 'pass_examples');
  const riskItems = getItemsForCategory(context.questionData, currentNodeId, 'risk_examples');

  const hasPass = passItems.some(item => currentChecked.includes(item));
  const hasRisk = riskItems.some(item => currentChecked.includes(item));
  const count = currentChecked.length;

  for (const condition of conditions) {
    if (evaluateCondition(condition, { hasPass, hasRisk, count, currentChecked, checkedItems, currentNodeId })) {
      return {
        next: condition.next,
        actions: condition.actions || [],
      };
    }
  }

  return null;
}

interface ConditionContext {
  hasPass: boolean;
  hasRisk: boolean;
  count: number;
  currentChecked: string[];
  checkedItems: Record<string, string[]>;
  currentNodeId: string;
}

function evaluateCondition(condition: FlowCondition, ctx: ConditionContext): boolean {
  const { type, expression } = condition;

  if (type === 'always') {
    return true;
  }

  if (type === 'fallback') {
    return true;
  }

  if (type === 'count_threshold') {
    const min = condition.min ?? 0;
    const max = condition.max ?? Infinity;
    return ctx.count >= min && ctx.count <= max;
  }

  if (type === 'category_selection') {
    switch (expression) {
      case 'both_selected':
        return ctx.hasPass && ctx.hasRisk;
      case 'only_pass_selected':
        return ctx.hasPass && !ctx.hasRisk;
      case 'only_risk_selected':
        return ctx.hasRisk && !ctx.hasPass;
      case 'any_selected':
        return ctx.count > 0;
      case 'none_selected':
        return ctx.count === 0;
      default:
        return false;
    }
  }

  if (type === 'selection_count') {
    switch (expression) {
      case 'any_selected':
        return ctx.count > 0;
      case 'none_selected':
        return ctx.count === 0;
      default:
        break;
    }
    
    const match = expression?.match(/^count(?:_(\d+))?(?:_(\d+))?$/);
    if (match) {
      const min = match[1] ? parseInt(match[1], 10) : 0;
      const max = match[2] ? parseInt(match[2], 10) : Infinity;
      return ctx.count >= min && ctx.count <= max;
    }
    
    const rangeMatch = expression?.match(/^(gte|gt|lte|lt|eq)_(\d+)$/);
    if (rangeMatch) {
      const [, op, valStr] = rangeMatch;
      const val = parseInt(valStr, 10);
      switch (op) {
        case 'gte': return ctx.count >= val;
        case 'gt': return ctx.count > val;
        case 'lte': return ctx.count <= val;
        case 'lt': return ctx.count < val;
        case 'eq': return ctx.count === val;
        default: return false;
      }
    }
  }

  return false;
}

export function executeActions(actions: FlowAction[]): { score?: 0 | 1 } {
  let score: 0 | 1 | undefined;
  
  for (const action of actions) {
    if (action.type === 'set_score' && action.value !== undefined) {
      score = action.value as 0 | 1;
    }
  }
  
  return { score };
}

function getCategories(questionData: QuestionData, nodeId: string): ChecklistCategory[] | undefined {
  const node = questionData.flow[nodeId];
  if (node?.type === 'checklist' && 'categories' in node) {
    return node.categories;
  }
  return undefined;
}

function getItemsForCategory(
  questionData: QuestionData, 
  nodeId: string, 
  categoryId: string
): string[] {
  const categories = getCategories(questionData, nodeId);
  if (!categories) return [];

  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];

  return category.items.map(item => item.text);
}

export function hasSetScoreAction(actions: FlowAction[]): boolean {
  return actions.some(action => action.type === 'set_score');
}

export function getScoreFromActions(actions: FlowAction[]): 0 | 1 | undefined {
  const setScoreAction = actions.find(action => action.type === 'set_score');
  return setScoreAction?.value as 0 | 1 | undefined;
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
