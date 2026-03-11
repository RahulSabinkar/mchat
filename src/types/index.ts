export interface ChildInfo {
  name: string;
  dateOfBirth: string;
}

export interface ScreeningSession {
  id: string;
  createdAt: string;
  childInfo: ChildInfo;
  status: 'in_progress' | 'completed';
  phase: 'intro' | 'initial_questions' | 'follow_up' | 'results';
  currentQuestionIndex: number;
  initialAnswers: Record<number, boolean>;
  initialScore: number | null;
  followUpRequired: boolean;
  followUpAvailable: boolean;
  followUpAnswers: Record<number, FollowUpResult>;
  followUpScore: number | null;
  finalResult: ScreeningResultCategory | null;
}

export type ScreeningResultCategory = 
  | 'low' 
  | 'moderate_negative' 
  | 'moderate_positive' 
  | 'high';

export interface ScreeningResult {
  category: ScreeningResultCategory;
  initialScore: number;
  followUpScore: number | null;
  recommendation: string;
  rescreenRecommended: boolean;
}

export interface FollowUpResult {
  questionNumber: number;
  initialAnswer: boolean;
  flowState: FollowUpFlowState;
  finalScore: 0 | 1;
  hearingTestResult?: string;
}

export interface FollowUpFlowState {
  currentNodeId: string;
  selectedOptions: Record<string, string | string[]>;
  checkedItems: Record<string, string[]>;
}

export interface FlowAction {
  type: 'set_score' | 'set_result' | 'navigate';
  value?: 0 | 1 | string;
}

export interface FlowCondition {
  type: 'category_selection' | 'selection_count' | 'semantic' | 'always' | 'fallback' | 'count_threshold';
  expression?: string;
  min?: number;
  max?: number;
  actions: FlowAction[];
  next?: string;
}

export interface FlowOption {
  label: string;
  next?: string;
  actions?: FlowAction[];
}

export type FlowNode = 
  | InitialQuestionNode
  | InstructionNode
  | ChecklistNode
  | TransientLogicNode
  | FollowupQuestionNode
  | MultipleChoiceNode;

export interface InitialQuestionNode {
  type: 'initial_question';
  options: FlowOption[];
}

export interface InstructionNode {
  type: 'instruction';
  text: string;
  next: string;
}

export interface ChecklistCategory {
  id: string;
  instruction?: string;
  items: { text: string }[];
}

export interface ChecklistNode {
  type: 'checklist';
  instruction?: string;
  categories?: ChecklistCategory[];
  items?: { text: string }[];
  options: FlowOption[];
  next: string;
}

export interface TransientLogicNode {
  type: 'transient_logic';
  conditions: FlowCondition[];
}

export interface FollowupQuestionNode {
  type: 'followup_question';
  text: string;
  options: FlowOption[];
}

export interface MultipleChoiceNode {
  type: 'multiple_choice';
  text: string;
  options: string[];
  next: string;
}

export interface QuestionData {
  item_number: number;
  question: string;
  flow: Record<string, FlowNode>;
  metadata: {
    copyright: string;
    version: string;
  };
}

export type RiskCategory = 'low' | 'moderate' | 'high';

export const YES_RISK_ITEMS = [2, 5, 12] as const;
export const NO_RISK_ITEMS = [1, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20] as const;

export const PLACEHOLDER_PATTERN = /_+/g;