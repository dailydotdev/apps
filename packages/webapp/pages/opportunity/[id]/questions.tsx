import React, { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  useActions,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import type { OpportunityScreeningAnswer } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  acceptOpportunityMatchMutationOptions,
  saveOpportunityScreeningAnswersMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useCVUploadManager } from '@dailydotdev/shared/src/features/opportunity/hooks/useCVUploadManager';
import { ScreeningQuestionStep } from '@dailydotdev/shared/src/features/opportunity/components/ScreeningQuestionStep';
import { CVUploadStep } from '@dailydotdev/shared/src/features/opportunity/components/CVUploadStep';
import { StepNavigation } from '@dailydotdev/shared/src/features/opportunity/components/StepNavigation';
import { getOpportunityProtectedLayout } from '../../../components/layouts/OpportunityProtectedLayout';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

enum AcceptStep {
  QUESTIONS = 'questions',
  CV = 'cv',
}

const AcceptPage = (): ReactElement => {
  const {
    query: { id },
    push,
    back,
  } = useRouter();
  const opportunityId = id as string;
  const [currentStep, setCurrentStep] = useState<AcceptStep | null>(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [activeAnswer, setActiveAnswer] = useState('');
  const [answers, setAnswers] = useState<
    Record<string, OpportunityScreeningAnswer>
  >({});
  const { completeAction, isActionsFetched, checkHasCompleted } = useActions();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  const hasUploadedCV = checkHasCompleted(ActionType.UploadedCV);

  const { mutate: acceptOpportunity } = useMutation({
    ...acceptOpportunityMatchMutationOptions(opportunityId),
    onSuccess: async () => {
      await push(`${opportunityUrl}/${opportunityId}/notify`);
    },
    onError: () => {
      displayToast('Failed to accept opportunity. Please try again.');
    },
  });
  const {
    file,
    setFile,
    handleUpload,
    isPending: isUploadPending,
  } = useCVUploadManager(acceptOpportunity);

  const { data: opportunity } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
    enabled: false,
  });

  const { mutate: saveAnswers } = useMutation({
    ...saveOpportunityScreeningAnswersMutationOptions(opportunityId),
    onSuccess: async () => {
      logEvent({
        event_name: LogEvent.CompleteScreening,
        target_id: opportunityId,
      });
      if (!hasUploadedCV) {
        setCurrentStep(AcceptStep.CV);
      } else {
        acceptOpportunity();
      }
    },
    onError: () => {
      displayToast('Failed to save answers. Please try again.');
    },
  });

  const questions = opportunity?.questions || [];

  const handleNext = () => {
    // Log the screening answer
    logEvent({
      event_name: LogEvent.AnswerScreeningQuestion,
      target_id: opportunityId,
      extra: JSON.stringify({
        index: activeQuestion,
        question_id: questions[activeQuestion].id,
      }),
    });

    // Check if this is the last screening question
    if (activeQuestion === questions.length - 1) {
      saveAnswers(Object.values(answers));
      return;
    }

    // Move to next screening question
    setActiveQuestion((current) => current + 1);
    setActiveAnswer('');
  };

  const goToLastQuestion = () => {
    const lastIdx = questions.length - 1;
    setCurrentStep(AcceptStep.QUESTIONS);
    setActiveQuestion(lastIdx);
    setActiveAnswer(answers[lastIdx]?.answer || '');
  };

  const goToPrevQuestion = () =>
    setActiveQuestion((q) => {
      const prev = q - 1;
      setActiveAnswer(answers[prev]?.answer || '');
      return prev;
    });

  const handleBack = () => {
    switch (currentStep) {
      case AcceptStep.CV:
        // If there are questions, go back to the last question
        if (questions.length > 0) {
          goToLastQuestion();
        } else {
          // No questions, go back to previous page
          back();
        }
        break;

      case AcceptStep.QUESTIONS:
        if (activeQuestion === 0) {
          back();
        } else {
          goToPrevQuestion();
        }
        break;

      default:
        back();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setActiveAnswer(e.target.value);
    setAnswers((current) => ({
      ...current,
      [activeQuestion]: {
        questionId: questions[activeQuestion].id,
        answer: e.target.value,
      },
    }));
  };

  const totalSteps = useMemo(() => {
    return questions.length + (hasUploadedCV ? 0 : 1); // All screening questions + CV upload (if needed)
  }, [questions.length, hasUploadedCV]);

  const stepNumber = useMemo(() => {
    if (currentStep === AcceptStep.CV) {
      return questions.length + 1;
    }
    return activeQuestion + 1;
  }, [currentStep, activeQuestion, questions.length]);

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }
    completeAction(ActionType.OpportunityInitialView);
  }, [completeAction, isActionsFetched]);

  // Initialize the correct step based on questions and CV status
  useEffect(() => {
    if (!opportunity || !isActionsFetched || currentStep !== null) {
      return;
    }

    // If there are questions, start with questions step
    if (questions.length > 0) {
      setCurrentStep(AcceptStep.QUESTIONS);
      return;
    }

    // No questions - check if CV is needed
    if (!hasUploadedCV) {
      setCurrentStep(AcceptStep.CV);
    } else {
      // No questions and CV already uploaded - directly accept
      acceptOpportunity();
    }
  }, [
    opportunity,
    questions.length,
    hasUploadedCV,
    isActionsFetched,
    currentStep,
    acceptOpportunity,
  ]);

  if (!opportunity || currentStep === null) {
    return null;
  }

  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        {currentStep === AcceptStep.QUESTIONS && (
          <>
            <ScreeningQuestionStep
              question={questions[activeQuestion]}
              value={activeAnswer}
              currentStep={stepNumber}
              totalSteps={totalSteps}
              onChange={handleChange}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleNext}
              backLabel={activeQuestion === 0 ? 'Back' : '← Previous question'}
              nextLabel={
                activeQuestion === totalSteps - 1 ? 'Submit' : 'Next question →'
              }
              nextDisabled={!activeAnswer.trim()}
            />
          </>
        )}

        {currentStep === AcceptStep.CV && (
          <>
            <CVUploadStep
              currentStep={stepNumber}
              totalSteps={totalSteps}
              onFileSelect={(files) => setFile(files[0])}
              showCVUploadInfoBox={false}
              copy={{
                title: 'One last step',
                description:
                  'We need your CV to send your full profile to the recruiter.',
              }}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleUpload}
              backLabel={activeQuestion === 0 ? 'Back' : '← Previous question'}
              nextLabel="Submit"
              nextDisabled={!file}
              nextLoading={isUploadPending}
            />
          </>
        )}
      </FlexCol>
    </div>
  );
};

AcceptPage.getLayout = getOpportunityProtectedLayout;
AcceptPage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default AcceptPage;
