import type { QuestionData } from '@/types';

const questionModules = import.meta.glob<{ default: QuestionData }>('/data/q*.json', { eager: true });

const questions: QuestionData[] = Object.entries(questionModules)
  .map(([, module]) => module.default)
  .sort((a, b) => a.item_number - b.item_number);

export function getAllQuestions(): QuestionData[] {
  return questions;
}

export function getQuestionByNumber(num: number): QuestionData | undefined {
  return questions.find(q => q.item_number === num);
}

export function getQuestionByIndex(index: number): QuestionData | undefined {
  return questions[index];
}

export function getTotalQuestions(): number {
  return questions.length;
}

export function personalizeQuestion(question: string, childName: string): string {
  return question.replace(/_+/g, childName);
}

export function getCopyright(): string {
  return '© 2009 Diana Robins, Deborah Fein, & Marianne Barton';
}
