import { Download } from 'lucide-react';
import { useScreening } from '@/context/ScreeningContext';
import { determineFinalResult } from '@/utils/scoring';
import { generateResultsPDF } from '@/utils/pdf-generator';
import { calculateAgeInMonths } from '@/utils/date-helpers';

export function ExportButton() {
  const { session } = useScreening();
  
  const handleExport = () => {
    if (session.initialScore === null) return;
    
    const ageInMonths = calculateAgeInMonths(session.childInfo.dateOfBirth);
    const result = determineFinalResult(session.initialScore, session.followUpScore, ageInMonths);
    
    generateResultsPDF(session, result);
  };
  
  return (
    <button
      onClick={handleExport}
      className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
    >
      <Download className="w-5 h-5" />
      Print / Save as PDF
    </button>
  );
}
