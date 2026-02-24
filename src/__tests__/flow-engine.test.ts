import { describe, it, expect } from 'vitest';
import { 
  evaluateDecisionLogic, 
  isScoreResult,
  personalizeText,
  FlowContext 
} from '@/utils/flow-engine';
import type { 
  DecisionLogicNode, 
  FlowTarget,
  QuestionData,
  ChecklistNode 
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
        categories: {
          pass_examples: { items: ['pass item 1', 'pass item 2'] },
          risk_examples: { items: ['risk item 1', 'risk item 2'] },
        },
        options: ['Yes', 'No'],
        next: 'end',
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

describe('evaluateDecisionLogic', () => {
  describe('both_selected condition', () => {
    it('returns target when both pass and risk items are selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          both_selected: { next: 'both-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1', 'risk item 1'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toEqual({ next: 'both-result' });
    });

    it('does not return target when only pass items selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          both_selected: { next: 'both-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('only_pass_selected condition', () => {
    it('returns target when only pass items are selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          only_pass_selected: { next: 'pass-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toEqual({ next: 'pass-result' });
    });

    it('does not return target when risk items are also selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          only_pass_selected: { next: 'pass-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1', 'risk item 1'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('only_risk_selected condition', () => {
    it('returns target when only risk items are selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          only_risk_selected: { result_score: 1 },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['risk item 1'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toEqual({ result_score: 1 });
    });
  });

  describe('any_selected condition', () => {
    it('returns target when any items are selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          any_selected: { next: 'any-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['some item'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toEqual({ next: 'any-result' });
    });

    it('does not return target when no items selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          any_selected: { next: 'any-result' },
        },
      };
      const context = createMockContext('test-node', {});
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('none_selected condition', () => {
    it('returns target when no items are selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          none_selected: { result_score: 0 },
        },
      };
      const context = createMockContext('test-node', {});
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toEqual({ result_score: 0 });
    });

    it('does not return target when items are selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          none_selected: { result_score: 0 },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['some item'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('count_threshold condition', () => {
    it('returns target when count is within range', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          count_threshold: { min: 1, max: 3, next: 'threshold-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['item1', 'item2'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toEqual({ next: 'threshold-result' });
    });

    it('does not return target when count is below min', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          count_threshold: { min: 3, next: 'threshold-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['item1', 'item2'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toBeNull();
    });

    it('does not return target when count is above max', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          count_threshold: { max: 2, next: 'threshold-result' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['item1', 'item2', 'item3'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toBeNull();
    });
  });

  describe('priority of conditions', () => {
    it('checks both_selected before only_pass_selected', () => {
      const node: DecisionLogicNode = {
        type: 'decision_logic',
        conditions: {
          both_selected: { next: 'both' },
          only_pass_selected: { next: 'pass' },
        },
      };
      const context = createMockContext('test-node', {
        'test-node': ['pass item 1', 'risk item 1'],
      });
      
      const result = evaluateDecisionLogic(node, context);
      expect(result).toEqual({ next: 'both' });
    });
  });
});

describe('isScoreResult', () => {
  it('returns true for object with result_score', () => {
    const target: FlowTarget = { result_score: 1 };
    expect(isScoreResult(target)).toBe(true);
  });

  it('returns false for object with only next', () => {
    const target: FlowTarget = { next: 'some-node' };
    expect(isScoreResult(target)).toBe(false);
  });

  it('returns true for object with both result_score and next', () => {
    const target: FlowTarget = { result_score: 0, next: 'next-node' };
    expect(isScoreResult(target)).toBe(true);
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
