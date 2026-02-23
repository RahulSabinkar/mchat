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
}

export interface FollowUpFlowState {
  currentNodeId: string;
  selectedOptions: Record<string, string | string[]>;
  checkedItems: Record<string, string[]>;
}

export type FlowNode = 
  | InitialQuestionNode
  | InstructionNode
  | ChecklistNode
  | DecisionLogicNode
  | FollowUpQuestionNode
  | MandatoryFollowupNode
  | MultipleChoiceNode;

export interface InitialQuestionNode {
  type: 'initial_question';
  options: Record<string, string | ScoreResult>;
}

export interface InstructionNode {
  type: 'instruction';
  text: string;
  next: string;
}

export interface ChecklistNode {
  type: 'checklist';
  instruction?: string;
  items?: string[];
  categories?: ChecklistCategories;
  options?: string[];
  next?: string;
}

export interface ChecklistCategories {
  [categoryName: string]: string[] | CategoryWithInstruction;
}

export interface CategoryWithInstruction {
  instruction: string;
  items: string[];
}

export interface DecisionLogicNode {
  type: 'decision_logic';
  conditions: Record<string, ConditionResult>;
}

export type ConditionResult = ScoreResult | NextNodeResult;

export interface ScoreResult {
  result_score: 0 | 1;
  next?: string;
}

export interface NextNodeResult {
  next: string;
  result_score?: 0 | 1;
}

export interface FollowUpQuestionNode {
  type: 'followup_question';
  text: string;
  options: Record<string, string | ScoreResult>;
}

export interface MandatoryFollowupNode {
  type: 'mandatory_followup';
  instruction?: string;
  text: string;
  options: Record<string, string>;
}

export interface MultipleChoiceNode {
  type: 'multiple_choice';
  text: string;
  options: string[];
  next?: string;
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
