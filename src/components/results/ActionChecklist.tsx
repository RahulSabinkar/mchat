import { CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import type { ScreeningResultCategory } from '@/types';

interface ActionChecklistProps {
  category: ScreeningResultCategory;
}

const lowRiskActions = [
  'Continue monitoring developmental milestones',
  'Share results with your child\'s healthcare provider',
  'Schedule routine well-child visits',
  'Rescreen at future visits if under 24 months',
];

const moderateNegativeActions = [
  'Share results with your child\'s healthcare provider',
  'Continue monitoring developmental progress',
  'Rescreen at next well-child visit',
  'Discuss any concerns about development with your provider',
];

const moderatePositiveActions = [
  'Schedule diagnostic evaluation with specialist',
  'Contact early intervention services',
  'Share these results with your child\'s healthcare provider',
  'Begin gathering developmental history documentation',
];

const highRiskActions = [
  'Schedule diagnostic evaluation immediately',
  'Contact early intervention services today',
  'Request referral to developmental pediatrician or autism specialist',
  'Begin early intervention while waiting for evaluation',
  'Share these results with your child\'s healthcare provider urgently',
];

export function ActionChecklist({ category }: ActionChecklistProps) {
  const getIcon = () => {
    switch (category) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'moderate_negative':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'moderate_positive':
      case 'high':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getActions = () => {
    switch (category) {
      case 'low':
        return lowRiskActions;
      case 'moderate_negative':
        return moderateNegativeActions;
      case 'moderate_positive':
        return moderatePositiveActions;
      case 'high':
        return highRiskActions;
    }
  };

  const getHeaderColor = () => {
    switch (category) {
      case 'low':
        return 'bg-green-50 border-green-200';
      case 'moderate_negative':
        return 'bg-yellow-50 border-yellow-200';
      case 'moderate_positive':
      case 'high':
        return 'bg-red-50 border-red-200';
    }
  };

  const getTitle = () => {
    switch (category) {
      case 'low':
        return 'Recommended Next Steps';
      case 'moderate_negative':
        return 'Continued Monitoring Steps';
      case 'moderate_positive':
        return 'Referral Action Items';
      case 'high':
        return 'Urgent Action Required';
    }
  };

  return (
    <div className={`rounded-xl border-2 ${getHeaderColor()} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        {getIcon()}
        <h3 className="font-semibold text-slate-900">{getTitle()}</h3>
      </div>
      <ul className="space-y-2">
        {getActions().map((action, index) => (
          <li key={index} className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-700">{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
