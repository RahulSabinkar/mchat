import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useScreening } from '@/context/ScreeningContext';
import { getCopyright } from '@/data/questions';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { dispatch } = useScreening();
  
  const handleBegin = () => {
    dispatch({ type: 'SET_PHASE', payload: 'intro' });
    navigate('/info');
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">
            M-CHAT-R/F Screening
          </h1>
          <p className="text-lg text-slate-600">
            Modified Checklist for Autism in Toddlers, Revised with Follow-Up
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            About This Screening
          </h2>
          <p className="text-slate-600">
            The M-CHAT-R/F is a validated autism screening tool designed for children 
            between 16 and 30 months of age. It can be used for children up to 48 months.
          </p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Takes approximately 5-10 minutes to complete</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your answers are saved locally and never sent to a server</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Receive immediate results with recommendations</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-amber-800">
              <p className="font-medium">Important Disclaimers</p>
              <ul className="text-sm mt-1 space-y-1 text-amber-700">
                <li>This is a screening tool, not a diagnostic instrument.</li>
                <li>A positive screen does not mean your child has autism.</li>
                <li>Please consult your healthcare provider regardless of results.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500 text-center">
            {getCopyright()}
          </p>
        </div>
        
        <button
          onClick={handleBegin}
          className="w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-xl shadow-sm hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Begin Screening
        </button>
      </div>
    </Layout>
  );
}
