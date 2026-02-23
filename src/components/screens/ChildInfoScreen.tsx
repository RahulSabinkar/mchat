import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useScreening } from '@/context/ScreeningContext';
import { validateAge } from '@/utils/validation';
import { getTodayForInput } from '@/utils/date-helpers';

export function ChildInfoScreen() {
  const navigate = useNavigate();
  const { session, dispatch, resetSession } = useScreening();
  const { phase } = session;
  const [name, setName] = useState(session.childInfo.name);
  const [dateOfBirth, setDateOfBirth] = useState(session.childInfo.dateOfBirth);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  
  useEffect(() => {
    if (phase === 'initial_questions') {
      navigate('/screen', { replace: true });
    } else if (phase === 'follow_up') {
      navigate('/followup', { replace: true });
    } else if (phase === 'results') {
      navigate('/results', { replace: true });
    }
  }, [phase, navigate]);
  
  if (phase !== 'intro') {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarning(null);
    
    if (!name.trim()) {
      setError('Please enter your child\'s name.');
      return;
    }
    
    if (!dateOfBirth) {
      setError('Please enter your child\'s date of birth.');
      return;
    }
    
    const validation = validateAge(dateOfBirth);
    
    if (!validation.valid) {
      setError(validation.warning || 'Invalid date of birth.');
      return;
    }
    
    if (validation.warning) {
      setWarning(validation.warning);
      return;
    }
    
    dispatch({ 
      type: 'SET_CHILD_INFO', 
      payload: { name: name.trim(), dateOfBirth } 
    });
    dispatch({ type: 'SET_PHASE', payload: 'initial_questions' });
    navigate('/screen');
  };
  
  const handleContinueAnyway = () => {
    dispatch({ 
      type: 'SET_CHILD_INFO', 
      payload: { name: name.trim(), dateOfBirth } 
    });
    dispatch({ type: 'SET_PHASE', payload: 'initial_questions' });
    navigate('/screen');
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Child Information
          </h1>
          <p className="text-slate-600">
            Please enter your child's information to personalize the screening questions.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Child's Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your child's first name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                aria-describedby={error ? 'error-message' : undefined}
              />
            </div>
            
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={getTodayForInput()}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                aria-describedby={error ? 'error-message' : undefined}
              />
            </div>
            
            {error && (
              <div id="error-message" className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}
            
            {warning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm" role="alert">
                <p className="font-medium mb-2">{warning}</p>
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleContinueAnyway}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    Continue Anyway
                  </button>
                  <button
                    type="button"
                    onClick={() => setWarning(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Change Date
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {!warning && (
            <button
              type="submit"
              className="w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-xl shadow-sm hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Continue to Questions
            </button>
          )}
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                resetSession();
                navigate('/');
              }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Start Over
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
