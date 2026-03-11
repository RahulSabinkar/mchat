import { describe, it, expect } from 'vitest';
import { 
  evaluateTransientLogic, 
  executeActions,
  getScoreFromActions,
  personalizeText,
  FlowContext 
} from '@/utils/flow-engine';
import type { 
  TransientLogicNode, 
  FlowCondition,
  QuestionData,
  ChecklistNode,
  FlowNode
} from '@/types';

function createMockContext(
  currentNodeId: string,
  checkedItems: Record<string, string[]> = {},
  selectedOptions: Record<string, string | string[]> = {}
): FlowContext {
  const mockQuestionData: QuestionData = {
    item_number: 1,
    question: 'Test question',
    flow: {
      'test-node': {
        type: 'checklist',
        instruction: 'Test instruction',
        categories: [
          {
            id: 'pass_examples',
            items: [
              { text: 'pass item 1' },
              { text: 'pass item 2' }
            ]
          },
          {
            id: 'risk_examples',
            items: [
              { text: 'risk item 1' },
              { text: 'risk item 2' }
            ]
          }
        ],
        options: [
          { label: 'Yes' },
          { label: 'No' }
        ],
        next: 'completed',
      } as ChecklistNode,
    },
    metadata: {
      copyright: 'test',
      version: '1.0',
    },
  };

  return {
    questionData: mockQuestionData,
    state: {
      currentNodeId,
      checkedItems,
      selectedOptions,
    },
    childName: 'Test',
  };
}

function createMockContextWithFlatChecklist(
  currentNodeId: string,
  checkedItems: Record<string, string[]> = {}
): FlowContext {
  const mockQuestionData: QuestionData = {
    item_number: 1,
    question: 'Test question',
    flow: {
      'test-node': {
        type: 'checklist',
        instruction: 'Test instruction',
        items: [
          { text: 'item 1' },
          { text: 'item 2' },
          { text: 'item 3' }
        ],
        options: [
          { label: 'Yes' },
          { label: 'No' }
        ],
        next: 'completed',
      } as FlowNode,
    },
    metadata: {
      copyright: 'test',
      version: '1.0',
    },
  };

  return {
    questionData: mockQuestionData,
    state: {
      currentNodeId,
      checkedItems,
      selectedOptions: {},
    },
    childName: 'Test',
  };
}

describe('evaluateTransientLogic', () => {
  describe('both_selected condition', () => {
    it('returns result when both pass and risk items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'both_selected',
            actions: [],
            next: 'both-result',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1', 'risk item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ next: 'both-result', actions: [] });
    });

    it('does not return result when only pass items selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'both_selected',
            actions: [],
            next: 'both-result',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('only_pass_selected condition', () => {
    it('returns result when only pass items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'only_pass_selected',
            actions: [{ type: 'set_score', value: 0 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 0 }] 
      });
    });

    it('does not return result when risk items are also selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'only_pass_selected',
            actions: [],
            next: 'pass-result',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1', 'risk item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('only_risk_selected condition', () => {
    it('returns result when only risk items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'only_risk_selected',
            actions: [{ type: 'set_score', value: 1 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['risk item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 1 }] 
      });
    });
  });

  describe('any_selected condition', () => {
    it('returns result when any items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'any_selected',
            actions: [],
            next: 'any-result',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['some item'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ next: 'any-result', actions: [] });
    });

    it('does not return result when no items selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'any_selected',
            actions: [],
            next: 'any-result',
          },
        ],
      };
      const context = createMockContext('test-node', {});
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('none_selected condition', () => {
    it('returns result when no items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'none_selected',
            actions: [{ type: 'set_score', value: 0 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContext('test-node', {});
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 0 }] 
      });
    });

    it('does not return result when items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'none_selected',
            actions: [],
            next: 'none-result',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['some item'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('priority of conditions', () => {
    it('checks both_selected before only_pass_selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'both_selected',
            actions: [],
            next: 'both',
          },
          {
            type: 'category_selection',
            expression: 'only_pass_selected',
            actions: [],
            next: 'pass',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1', 'risk item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ next: 'both', actions: [] });
    });
  });
});

describe('executeActions', () => {
  it('returns score from set_score action', () => {
    const actions = [{ type: 'set_score' as const, value: 1 as const }];
    const result = executeActions(actions);
    expect(result.score).toBe(1);
  });

  it('returns undefined score when no set_score action', () => {
    const actions: FlowCondition['actions'] = [];
    const result = executeActions(actions);
    expect(result.score).toBeUndefined();
  });
});

describe('getScoreFromActions', () => {
  it('returns score value from set_score action', () => {
    const actions = [{ type: 'set_score' as const, value: 0 as const }];
    expect(getScoreFromActions(actions)).toBe(0);
  });

  it('returns undefined when no set_score action', () => {
    expect(getScoreFromActions([])).toBeUndefined();
  });
});

describe('personalizeText', () => {
  it('replaces underscores with child name', () => {
    expect(personalizeText('Does ___ like toys?', 'Emma')).toBe('Does Emma like toys?');
  });

  it('replaces multiple underscore groups', () => {
    expect(personalizeText('___ plays with ___ toys', 'John')).toBe('John plays with John toys');
  });

  it('handles empty child name', () => {
    expect(personalizeText('___ plays', '')).toBe(' plays');
  });

  it('returns original text when no underscores', () => {
    expect(personalizeText('Simple text', 'Emma')).toBe('Simple text');
  });
});

describe('new condition types', () => {
  describe('always condition', () => {
    it('always matches regardless of selection state', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'always',
            actions: [{ type: 'set_score', value: 1 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContext('test-node', {});
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 1 }] 
      });
    });

    it('matches even when items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'always',
            actions: [{ type: 'set_score', value: 0 }],
            next: 'done',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1', 'risk item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'done', 
        actions: [{ type: 'set_score', value: 0 }] 
      });
    });
  });

  describe('fallback condition', () => {
    it('acts as catch-all when no other conditions match', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'only_pass_selected',
            actions: [],
            next: 'pass',
          },
          {
            type: 'fallback',
            actions: [{ type: 'set_score', value: 0 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContext('test-node', {});
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 0 }] 
      });
    });

    it('does not match if earlier condition matches', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'category_selection',
            expression: 'only_pass_selected',
            actions: [{ type: 'set_score', value: 0 }],
            next: 'pass',
          },
          {
            type: 'fallback',
            actions: [{ type: 'set_score', value: 1 }],
            next: 'fallback-result',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'pass', 
        actions: [{ type: 'set_score', value: 0 }] 
      });
    });
  });

  describe('count_threshold condition', () => {
    it('matches when count is within min/max range', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'count_threshold',
            min: 2,
            max: 5,
            actions: [{ type: 'set_score', value: 0 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['item 1', 'item 2', 'item 3'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 0 }] 
      });
    });

    it('does not match when count is below min', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'count_threshold',
            min: 3,
            max: 10,
            actions: [],
            next: 'threshold-met',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });

    it('does not match when count exceeds max', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'count_threshold',
            min: 1,
            max: 2,
            actions: [],
            next: 'within-range',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['item 1', 'item 2', 'item 3', 'item 4'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });

    it('uses default min of 0 when not specified', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'count_threshold',
            max: 2,
            actions: [],
            next: 'low-count',
          },
        ],
      };
      const context = createMockContext('test-node', {});
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ next: 'low-count', actions: [] });
    });

    it('uses default max of Infinity when not specified', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'count_threshold',
            min: 1,
            actions: [],
            next: 'at-least-one',
          },
        ],
      };
      const context = createMockContext('test-node', {
        'test-node': ['item 1', 'item 2', 'item 3'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ next: 'at-least-one', actions: [] });
    });
  });

  describe('selection_count with any_selected/none_selected', () => {
    it('any_selected matches when items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'selection_count',
            expression: 'any_selected',
            actions: [{ type: 'set_score', value: 0 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContextWithFlatChecklist('test-node', {
        'test-node': ['item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 0 }] 
      });
    });

    it('any_selected does not match when no items selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'selection_count',
            expression: 'any_selected',
            actions: [],
            next: 'has-items',
          },
        ],
      };
      const context = createMockContextWithFlatChecklist('test-node', {});
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });

    it('none_selected matches when no items selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'selection_count',
            expression: 'none_selected',
            actions: [{ type: 'set_score', value: 1 }],
            next: 'completed',
          },
        ],
      };
      const context = createMockContextWithFlatChecklist('test-node', {});
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toEqual({ 
        next: 'completed', 
        actions: [{ type: 'set_score', value: 1 }] 
      });
    });

    it('none_selected does not match when items are selected', () => {
      const node: TransientLogicNode = {
        type: 'transient_logic',
        conditions: [
          {
            type: 'selection_count',
            expression: 'none_selected',
            actions: [],
            next: 'no-items',
          },
        ],
      };
      const context = createMockContextWithFlatChecklist('test-node', {
        'test-node': ['item 1'],
      });
      
      const result = evaluateTransientLogic(node, context);
      expect(result).toBeNull();
    });
  });
});
