import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  useActions,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { CandidateStatus } from '@dailydotdev/shared/src/features/opportunity/protobuf/user-candidate-preference';
import {
  saveOpportunityFeedbackAnswersMutationOptions,
  updateCandidatePreferencesMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  getCandidatePreferencesOptions,
  opportunityByIdOptions,
} from '@dailydotdev/shared/src/features/opportunity/queries';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import type { OpportunityScreeningAnswer } from '@dailydotdev/shared/src/features/opportunity/types';
import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useCVUploadManager } from '@dailydotdev/shared/src/features/opportunity/hooks/useCVUploadManager';
import { CandidateStatusStep } from '@dailydotdev/shared/src/features/opportunity/components/CandidateStatusStep';
import { ScreeningQuestionStep } from '@dailydotdev/shared/src/features/opportunity/components/ScreeningQuestionStep';
import { CVUploadStep } from '@dailydotdev/shared/src/features/opportunity/components/CVUploadStep';
import { PreferenceFormStep } from '@dailydotdev/shared/src/features/opportunity/components/PreferenceFormStep';
import { StepNavigation } from '@dailydotdev/shared/src/features/opportunity/components/StepNavigation';
import { getOpportunityProtectedLayout } from '../../../components/layouts/OpportunityProtectedLayout';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

enum DeclineStep {
  STATUS = 'status',
  REASON = 'reason',
  CV = 'cv',
  PREFERENCES = 'preferences',
}

const DeclinePage = (): ReactElement => {
  const {
    query: { id },
    push,
    back,
  } = useRouter();
  const opportunityId = id as string;
  const [currentStep, setCurrentStep] = useState<DeclineStep>(
    DeclineStep.STATUS,
  );
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | null>(
    null,
  );
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [activeAnswer, setActiveAnswer] = useState('');
  const [answers, setAnswers] = useState<
    Record<string, OpportunityScreeningAnswer>
  >({});

  const { logEvent } = useLogContext();
  const { completeAction, isActionsFetched, checkHasCompleted } = useActions();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  const hasUploadedCV = checkHasCompleted(ActionType.UploadedCV);
  const hasSetPreferences = checkHasCompleted(
    ActionType.UserCandidatePreferencesSaved,
  );

  const opts = getCandidatePreferencesOptions(user?.id);
  const updateQuery = useUpdateQuery(opts);
  const { data: preferences } = useQuery(opts);

  const { data: opportunity } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
    enabled: false,
  });

  const feedbackQuestions = opportunity?.feedbackQuestions || [];

  const { mutate: updatePreferences } = useMutation({
    ...updateCandidatePreferencesMutationOptions(updateQuery, () => {
      logEvent({
        event_name: LogEvent.SelectCandidateAvailability,
        target_id: preferences?.status,
      });
    }),
    onError: () => {
      displayToast('Failed to update preferences. Please try again.');
    },
  });

  const { mutate: saveFeedbackAnswers } = useMutation({
    ...saveOpportunityFeedbackAnswersMutationOptions(opportunityId),
    onSuccess: () => {
      logEvent({
        event_name: LogEvent.CompleteFeedback,
        target_id: opportunityId,
      });
    },
    onError: () => {
      displayToast('Failed to save feedback. Please try again.');
    },
  });

  const handleComplete = () => {
    push(`${opportunityUrl}/${opportunityId}/preference-done`);
  };

  const handleAfterCVUpload = () => {
    if (!hasSetPreferences) {
      setCurrentStep(DeclineStep.PREFERENCES);
    } else {
      handleComplete();
    }
  };

  const {
    file,
    setFile,
    handleUpload,
    isPending: isUploadPending,
  } = useCVUploadManager(handleAfterCVUpload);

  useEffect(() => {
    if (!preferences) {
      return;
    }
    setSelectedStatus(preferences.status);
  }, [preferences]);

  const totalSteps = useMemo(() => {
    let steps = 1 + feedbackQuestions.length; // Status + all feedback questions
    if (!hasUploadedCV) {
      steps += 1; // CV upload step
    }
    if (!hasSetPreferences) {
      steps += 1; // Preferences step
    }
    return steps;
  }, [feedbackQuestions.length, hasUploadedCV, hasSetPreferences]);

  const stepNumber = useMemo(() => {
    switch (currentStep) {
      case DeclineStep.STATUS:
        return 1;
      case DeclineStep.REASON:
        return 2 + activeQuestion; // Status(1) + current feedback question index
      case DeclineStep.CV:
        return 2 + feedbackQuestions.length; // Status(1) + all feedback questions
      case DeclineStep.PREFERENCES:
        // If CV was already uploaded, preferences comes after questions, otherwise after CV
        return hasUploadedCV
          ? 2 + feedbackQuestions.length
          : 3 + feedbackQuestions.length;
      default:
        return 1;
    }
  }, [currentStep, activeQuestion, feedbackQuestions.length, hasUploadedCV]);

  const handleNext = () => {
    if (currentStep === DeclineStep.STATUS) {
      // Always save the status when moving forward
      if (preferences?.status !== selectedStatus) {
        updatePreferences({ status: selectedStatus });
      }

      // If user selected "Not looking right now", go directly to passive-done
      if (selectedStatus === CandidateStatus.DISABLED) {
        push(`${opportunityUrl}/${opportunityId}/passive-done`);
        return;
      }

      // Otherwise continue to first feedback question
      setCurrentStep(DeclineStep.REASON);
      setActiveQuestion(0);
      setActiveAnswer('');
    } else if (currentStep === DeclineStep.REASON) {
      // Log the feedback answer
      logEvent({
        event_name: LogEvent.AnswerFeedbackQuestion,
        target_id: opportunityId,
        extra: JSON.stringify({
          index: activeQuestion,
          question_id: feedbackQuestions[activeQuestion].id,
        }),
      });

      // Check if this is the last feedback question
      if (activeQuestion === feedbackQuestions.length - 1) {
        // Save all feedback answers
        saveFeedbackAnswers(Object.values(answers));

        // Move to next step
        if (!hasUploadedCV) {
          setCurrentStep(DeclineStep.CV);
        } else if (!hasSetPreferences) {
          setCurrentStep(DeclineStep.PREFERENCES);
        } else {
          handleComplete();
        }
      } else {
        // Move to next feedback question
        setActiveQuestion((current) => current + 1);
        setActiveAnswer(answers[activeQuestion + 1]?.answer || '');
      }
    } else if (currentStep === DeclineStep.CV) {
      // Upload handled by handleUpload
    } else if (currentStep === DeclineStep.PREFERENCES) {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep === DeclineStep.STATUS) {
      // Skip status, just go to first feedback question
      setCurrentStep(DeclineStep.REASON);
      setActiveQuestion(0);
      setActiveAnswer('');
    } else if (currentStep === DeclineStep.REASON) {
      // Skip all remaining feedback questions, go to CV or Preferences or complete
      if (!hasUploadedCV) {
        setCurrentStep(DeclineStep.CV);
      } else if (!hasSetPreferences) {
        setCurrentStep(DeclineStep.PREFERENCES);
      } else {
        handleComplete();
      }
    } else if (currentStep === DeclineStep.CV) {
      // Skip CV upload, go to preferences or complete
      if (!hasSetPreferences) {
        setCurrentStep(DeclineStep.PREFERENCES);
      } else {
        handleComplete();
      }
    } else if (currentStep === DeclineStep.PREFERENCES) {
      // Skip preferences, just complete
      handleComplete();
    }
  };

  const goToLastFeedback = () => {
    const lastIdx = feedbackQuestions.length - 1;
    setCurrentStep(DeclineStep.REASON);
    setActiveQuestion(lastIdx);
    setActiveAnswer(answers[lastIdx]?.answer || '');
  };

  const goToPrevFeedback = () =>
    setActiveQuestion((q) => {
      const prev = q - 1;
      setActiveAnswer(answers[prev]?.answer || '');
      return prev;
    });

  const handleBack = () => {
    switch (currentStep) {
      case DeclineStep.PREFERENCES:
        if (!hasUploadedCV) {
          setCurrentStep(DeclineStep.CV);
        } else {
          goToLastFeedback();
        }
        break;

      case DeclineStep.CV:
        goToLastFeedback();
        break;

      case DeclineStep.REASON:
        if (activeQuestion === 0) {
          setCurrentStep(DeclineStep.STATUS);
        } else {
          goToPrevFeedback();
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
        questionId: feedbackQuestions[activeQuestion].id,
        answer: e.target.value,
      },
    }));
  };

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }
    completeAction(ActionType.OpportunityInitialView);
  }, [completeAction, isActionsFetched]);

  if (!opportunity) {
    return null;
  }

  const skipButton = (
    <Button
      size={ButtonSize.Medium}
      variant={ButtonVariant.Tertiary}
      className="w-full"
      onClick={handleSkip}
    >
      I&apos;ll do this later
    </Button>
  );

  return (
    <div className="tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row mx-4 flex w-auto max-w-full flex-col gap-4">
      <FlexCol className="flex-1 gap-6">
        {currentStep === DeclineStep.STATUS && (
          <>
            <CandidateStatusStep
              selectedStatus={selectedStatus}
              onStatusSelect={setSelectedStatus}
              currentStep={stepNumber}
              totalSteps={totalSteps}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleNext}
              backLabel="Back"
              nextLabel="Next →"
              nextDisabled={!selectedStatus}
            />
          </>
        )}

        {currentStep === DeclineStep.REASON && feedbackQuestions.length > 0 && (
          <>
            <ScreeningQuestionStep
              question={feedbackQuestions[activeQuestion]}
              value={activeAnswer}
              currentStep={stepNumber}
              totalSteps={totalSteps}
              onChange={handleChange}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleNext}
              backLabel="← Previous"
              nextLabel={totalSteps === stepNumber ? 'Submit' : 'Next →'}
            />
          </>
        )}

        {currentStep === DeclineStep.CV && (
          <>
            <CVUploadStep
              currentStep={stepNumber}
              totalSteps={totalSteps}
              onFileSelect={(files) => setFile(files[0])}
              skipButton={skipButton}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleUpload}
              backLabel="← Previous"
              nextLabel={totalSteps === stepNumber ? 'Submit' : 'Next →'}
              nextDisabled={!file}
              nextLoading={isUploadPending}
            />
          </>
        )}

        {currentStep === DeclineStep.PREFERENCES && (
          <>
            <PreferenceFormStep
              currentStep={stepNumber}
              totalSteps={totalSteps}
              skipButton={skipButton}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleComplete}
              backLabel="← Previous"
              nextLabel="Submit"
            />
          </>
        )}
      </FlexCol>
    </div>
  );
};

DeclinePage.getLayout = getOpportunityProtectedLayout;
DeclinePage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default DeclinePage;
