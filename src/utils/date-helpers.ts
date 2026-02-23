export function calculateAgeInMonths(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getTodayForInput(): string {
  return formatDateForInput(new Date());
}
