import { useScreening as useScreeningContext } from '@/context/ScreeningContext';

export function useScreening() {
  return useScreeningContext();
}
