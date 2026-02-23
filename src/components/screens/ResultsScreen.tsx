import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ExportButton } from '@/components/results';
import { useScreening } from '@/context/ScreeningContext';
import { determineFinalResult, getResultMessage } from '@/utils/scoring';
import { formatDateForDisplay, calculateAgeInMonths } from '@/utils/date-helpers';

export function ResultsScreen() {
  const navigate = useNavigate();
  const { session, resetSession } = useScreening();
  const { childInfo, initialScore, followUpScore, followUpRequired } = session;
  
  if (!childInfo.name || initialScore === null) {
    navigate('/');
    return null;
  }
  
  const ageInMonths = calculateAgeInMonths(childInfo.dateOfBirth);
  const result = determineFinalResult(initialScore, followUpScore, ageInMonths);
  
  const getCategoryColor = () => {
    switch (result.category) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate_negative':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate_positive':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };
  
  const getCategoryIcon = () => {
    switch (result.category) {
      case 'low':
        return (
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'moderate_negative':
        return (
          <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'moderate_positive':
      case 'high':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  const handleNewScreening = () => {
    resetSession();
    navigate('/');
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Screening Results
          </h1>
          <p className="text-slate-600">
            For {childInfo.name}, screened on {formatDateForDisplay(session.createdAt)}
          </p>
        </div>
        
        <div className={`rounded-xl border-2 p-6 space-y-4 ${getCategoryColor()}`}>
          <div className="flex items-center gap-3">
            {getCategoryIcon()}
            <div>
              <h2 className="text-xl font-bold">
                {getResultMessage(result.category)}
              </h2>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>Initial Score:</strong> {initialScore} out of 20</p>
            {followUpRequired && followUpScore !== null && (
              <p><strong>Follow-Up Score:</strong> {followUpScore}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Recommendation</h3>
          <p className="text-slate-600">{result.recommendation}</p>
          
          {result.rescreenRecommended && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
              <strong>Rescreen recommended</strong> at future well-child visits or after your child's 2nd birthday if currently under 24 months.
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Important Information</h3>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              <span>This screening tool does not provide a diagnosis.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              <span>False positives are common. A positive screen does not mean your child has autism.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              <span>Please share these results with your child's healthcare provider.</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
          <ul className="space-y-3">
            <li>
              <a 
                href="https://mchatscreen.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                mchatscreen.com - Official M-CHAT-R/F Information
              </a>
            </li>
            <li>
              <a 
                href="https://www.cdc.gov/ncbddd/autism/screening.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                CDC Autism Screening Information
              </a>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <ExportButton />
          <button
            onClick={handleNewScreening}
            className="flex-1 py-4 px-6 bg-primary-600 text-white font-semibold rounded-xl shadow-sm hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Start New Screening
          </button>
        </div>
      </div>
    </Layout>
  );
}
