import { calculateAgeInMonths } from './date-helpers';

export function validateAge(dateOfBirth: string): { valid: boolean; ageInMonths: number; warning?: string } {
  const ageInMonths = calculateAgeInMonths(dateOfBirth);
  
  if (ageInMonths < 16) {
    return {
      valid: false,
      ageInMonths,
      warning: `This screening tool is designed for children aged 16-48 months. Your child is ${ageInMonths} month(s) old.`,
    };
  }
  
  if (ageInMonths > 48) {
    return {
      valid: true,
      ageInMonths,
      warning: `This screening tool is designed for children aged 16-48 months. Your child is ${Math.floor(ageInMonths / 12)} years old. Results may be less accurate.`,
    };
  }
  
  return { valid: true, ageInMonths };
}
