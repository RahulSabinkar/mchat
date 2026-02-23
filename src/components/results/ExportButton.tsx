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
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Print / Save as PDF
    </button>
  );
}
