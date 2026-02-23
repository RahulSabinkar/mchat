import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ProgressBar } from '@/components/questions';
import { FlowNodeRenderer } from '@/components/flow';
import { useScreening } from '@/context/ScreeningContext';
import { getRiskItemsFromAnswers } from '@/utils/scoring';
import { getQuestionByNumber } from '@/data/questions';
import type { FollowUpFlowState } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { getCurrentNode, advanceToNode } from '@/utils/flow-engine';

function createInitialFlowState(): FollowUpFlowState {
  return {
    currentNodeId: 'start',
    selectedOptions: {},
    checkedItems: {},
  };
}

export function FollowUpScreen() {
  const navigate = useNavigate();
  const { session, dispatch, resetSession } = useScreening();
  const { followUpAnswers, childInfo, phase } = session;
  
  const riskItems = useMemo(() => getRiskItemsFromAnswers(session.initialAnswers), [session.initialAnswers]);
  
  const [currentRiskIndex, setCurrentRiskIndex] = useState(() => {
    const completedItems = Object.keys(followUpAnswers).map(Number);
    const firstIncomplete = riskItems.findIndex(item => !completedItems.includes(item));
    return firstIncomplete === -1 ? 0 : firstIncomplete;
  });

  const currentQuestionNumber = riskItems[currentRiskIndex];
  const questionData = getQuestionByNumber(currentQuestionNumber);
  
  const [currentFlowState, setCurrentFlowState] = useState<FollowUpFlowState>(() => {
    const existing = followUpAnswers[currentQuestionNumber];
    return existing?.flowState || createInitialFlowState();
  });
  const [pendingScore, setPendingScore] = useState<0 | 1 | null>(null);

  const flowContext: FlowContext = useMemo(() => ({
    questionData: questionData!,
    state: currentFlowState,
    childName: childInfo.name,
  }), [questionData, currentFlowState, childInfo.name]);

  const currentNode = questionData ? getCurrentNode(flowContext) : undefined;

  const handleNavigate = useCallback((nodeId: string) => {
    const newState = advanceToNode(flowContext, nodeId).state;
    setCurrentFlowState(newState);
  }, [flowContext]);

  const handleSelectOption = useCallback((key: string, value: string) => {
    setCurrentFlowState(prev => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [key]: value,
      },
    }));
  }, []);

  const handleCheckItems = useCallback((key: string, items: string[]) => {
    setCurrentFlowState(prev => ({
      ...prev,
      checkedItems: {
        ...prev.checkedItems,
        [key]: items,
      },
    }));
  }, []);

  const handleScore = useCallback((score: 0 | 1) => {
    setPendingScore(score);
  }, []);

  const advanceToNextQuestion = useCallback((finalScore: 0 | 1, hearingResult?: string) => {
    dispatch({
      type: 'COMPLETE_FOLLOW_UP_QUESTION',
      payload: { 
        questionNumber: currentQuestionNumber, 
        finalScore,
        hearingTestResult: hearingResult,
      },
    });

    const nextIndex = currentRiskIndex + 1;
    if (nextIndex >= riskItems.length) {
      dispatch({ type: 'COMPLETE_FOLLOW_UP' });
      navigate('/results');
    } else {
      setCurrentRiskIndex(nextIndex);
      setCurrentFlowState(createInitialFlowState());
      setPendingScore(null);
    }
  }, [dispatch, currentQuestionNumber, currentRiskIndex, riskItems.length, navigate]);

  const handleComplete = useCallback((hearingResult?: string) => {
    const score = pendingScore ?? 0;
    advanceToNextQuestion(score, hearingResult);
  }, [pendingScore, advanceToNextQuestion]);

  const handleBack = useCallback(() => {
    if (currentRiskIndex > 0) {
      setCurrentRiskIndex(prev => prev - 1);
      const prevQuestionNumber = riskItems[currentRiskIndex - 1];
      const prevResult = followUpAnswers[prevQuestionNumber];
      if (prevResult?.flowState) {
        setCurrentFlowState(prevResult.flowState);
      } else {
        setCurrentFlowState(createInitialFlowState());
      }
    } else {
      navigate('/results');
    }
  }, [currentRiskIndex, riskItems, followUpAnswers, navigate]);

  const handleStartOver = useCallback(() => {
    resetSession();
    navigate('/');
  }, [resetSession, navigate]);

  useEffect(() => {
    if (phase === 'intro') {
      navigate('/', { replace: true });
    } else if (phase === 'initial_questions') {
      navigate('/screen', { replace: true });
    } else if (phase === 'results') {
      navigate('/results', { replace: true });
    }
  }, [phase, navigate]);

  if (phase !== 'follow_up') {
    return null;
  }

  if (!questionData || !currentNode) {
    return (
      <Layout showBackButton onBack={() => navigate('/results')}>
        <div className="p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700">Error loading follow-up questions.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton onBack={handleBack}>
      <div className="space-y-6">
        <ProgressBar 
          current={currentRiskIndex + 1} 
          total={riskItems.length} 
        />

        <div className="text-sm text-slate-600 mb-4">
          <p>
            Follow-Up Questions - Question {currentQuestionNumber}
            {riskItems.length > 1 && ` (${currentRiskIndex + 1} of ${riskItems.length})`}
          </p>
        </div>

        <FlowNodeRenderer
          node={currentNode}
          context={flowContext}
          onNavigate={handleNavigate}
          onScore={handleScore}
          onSelectOption={handleSelectOption}
          onCheckItems={handleCheckItems}
          onComplete={handleComplete}
        />

        <div className="flex justify-center gap-6">
          {riskItems.length > 1 && (
            <button
              onClick={handleBack}
              disabled={currentRiskIndex === 0}
              className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go to previous follow-up
            </button>
          )}
          <button
            onClick={handleStartOver}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Start Over
          </button>
        </div>
      </div>
    </Layout>
  );
}
