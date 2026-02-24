import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, Info, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { 
  ExportButton, 
  ScoreBreakdownChart, 
  ActionChecklist, 
  QuestionsSummary, 
  FlaggedItemsSection 
} from '@/components/results';
import { useScreening } from '@/context/ScreeningContext';
import { determineFinalResult, getResultMessage, getRiskItemsFromAnswers } from '@/utils/scoring';
import { formatDateForDisplay, calculateAgeInMonths } from '@/utils/date-helpers';

export function ResultsScreen() {
  const navigate = useNavigate();
  const { session, dispatch, resetSession } = useScreening();
  const { childInfo, initialScore, followUpScore, followUpRequired, followUpAvailable, phase } = session;
  
  useEffect(() => {
    if (phase === 'intro') {
      navigate('/', { replace: true });
    } else if (phase === 'initial_questions') {
      navigate('/screen', { replace: true });
    } else if (phase === 'follow_up') {
      navigate('/followup', { replace: true });
    }
  }, [phase, navigate]);
  
  if (phase !== 'results') {
    return null;
  }
  
  if (!childInfo.name || initialScore === null) {
    navigate('/');
    return null;
  }
  
  const ageInMonths = calculateAgeInMonths(childInfo.dateOfBirth);
  const result = determineFinalResult(initialScore, followUpScore, ageInMonths);
  const flaggedItems = getRiskItemsFromAnswers(session.initialAnswers);
  
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
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'moderate_negative':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'moderate_positive':
      case 'high':
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getScoreBasedContent = () => {
    switch (result.category) {
      case 'low':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900">Reassurance</h4>
                  <p className="text-sm text-green-800">
                    Your child's screening results show low risk for autism spectrum disorder. 
                    This is a positive result and no immediate follow-up is required.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Developmental Milestones</h4>
              </div>
              <p className="text-sm text-blue-800">
                Continue monitoring your child's development. Key milestones to watch for 
                include using 2-word phrases, following simple instructions, and engaging 
                in pretend play.
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">What to Watch For</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Loss of previously acquired language or social skills</li>
                <li>• Lack of response to name by 12 months</li>
                <li>• Limited eye contact or social smiling</li>
                <li>• Repetitive behaviors or intense interests</li>
              </ul>
            </div>
          </div>
        );
      
      case 'moderate_negative':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Follow-Up Results: Screen Negative</h4>
                  <p className="text-sm text-yellow-800">
                    The follow-up interview indicates your child is currently at moderate risk, 
                    but the detailed questions suggest no immediate concern. Continued monitoring 
                    is recommended.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Continued Monitoring</h4>
              <p className="text-sm text-blue-800">
                Rescreen at future well-child visits. If you notice any changes in your child's 
                development or have concerns, contact your healthcare provider.
              </p>
            </div>
          </div>
        );
      
      case 'moderate_positive':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900">Concern Identified</h4>
                  <p className="text-sm text-red-800">
                    The screening indicates behaviors that may warrant further evaluation. 
                    Please discuss these results with your child's healthcare provider.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">Referral Pathway</h4>
              <p className="text-sm text-amber-800">
                Your healthcare provider may recommend a referral to a developmental pediatrician, 
                psychologist, or early intervention program for a comprehensive evaluation.
              </p>
            </div>
            
            <FlaggedItemsSection flaggedItems={flaggedItems} childName={childInfo.name} />
          </div>
        );
      
      case 'high':
        return (
          <div className="space-y-4">
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-700" />
                <h4 className="font-bold text-red-900">Urgent Referral Recommended</h4>
              </div>
              <p className="text-sm text-red-800">
                The screening results strongly suggest the need for immediate diagnostic 
                evaluation. Please contact your healthcare provider as soon as possible.
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Early Intervention Resources</h4>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• Contact your state's early intervention program</li>
                <li>• Request a developmental evaluation from your pediatrician</li>
                <li>• Ask about local autism specialty clinics</li>
                <li>• Begin gathering developmental history for evaluation</li>
              </ul>
            </div>
            
            <FlaggedItemsSection flaggedItems={flaggedItems} childName={childInfo.name} />
          </div>
        );
    }
  };
  
  const handleNewScreening = () => {
    resetSession();
    navigate('/');
  };
  
  const handleProceedToFollowUp = () => {
    dispatch({ type: 'SET_PHASE', payload: 'follow_up' });
    navigate('/followup');
  };
  
  const canDoFollowUp = followUpAvailable && followUpScore === null;
  
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
          {ageInMonths && (
            <p className="text-sm text-slate-500">
              Age at screening: {ageInMonths} months
            </p>
          )}
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
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Score Breakdown</h3>
          <ScoreBreakdownChart score={initialScore} />
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
        
        <ActionChecklist category={result.category} />
        
        {getScoreBasedContent()}
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Important Information</h3>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
              <span>This screening tool does not provide a diagnosis.</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
              <span>False positives are common. A positive screen does not mean your child has autism.</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
              <span>Please share these results with your child's healthcare provider.</span>
            </li>
          </ul>
        </div>
        
        <QuestionsSummary 
          answers={session.initialAnswers} 
          childName={childInfo.name} 
          flaggedItems={flaggedItems}
        />
        
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
        
        {canDoFollowUp && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-900">Optional: Follow-Up Questions</h3>
                <p className="text-sm text-amber-800">
                  Your child has a high initial score. While it is acceptable to skip follow-up and refer immediately, 
                  you may optionally complete the follow-up questions to gather additional information.
                </p>
              </div>
            </div>
            <button
              onClick={handleProceedToFollowUp}
              className="w-full py-3 px-6 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Proceed with Follow-Up Questions (Optional)
            </button>
          </div>
        )}
        
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
