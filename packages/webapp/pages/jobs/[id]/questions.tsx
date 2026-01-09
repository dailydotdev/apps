import React, { useCallback, useEffect, useMemo } from 'react';
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
import {
  getCandidatePreferencesOptions,
  opportunityByIdOptions,
} from '@dailydotdev/shared/src/features/opportunity/queries';
import {
  acceptOpportunityMatchMutationOptions,
  saveOpportunityScreeningAnswersMutationOptions,
  updateCandidatePreferencesMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useCVUploadManager } from '@dailydotdev/shared/src/features/opportunity/hooks/useCVUploadManager';
import { ScreeningQuestionStep } from '@dailydotdev/shared/src/features/opportunity/components/ScreeningQuestionStep';
import { CVUploadStep } from '@dailydotdev/shared/src/features/opportunity/components/CVUploadStep';
import { StepNavigation } from '@dailydotdev/shared/src/features/opportunity/components/StepNavigation';
import { LocationStep } from '@dailydotdev/shared/src/features/recruiter/components/LocationStep';
import { ExperienceLevelStep } from '@dailydotdev/shared/src/features/recruiter/components/ExperienceLevelStep';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import {
  getAutocompleteLocations,
  LocationDataset,
} from '@dailydotdev/shared/src/graphql/autocomplete';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { locationToString } from '@dailydotdev/shared/src/lib/utils';
import {
  useOpportunityAcceptanceSteps,
  AcceptStep,
} from '@dailydotdev/shared/src/features/recruiter/hooks/useOpportunityAcceptanceSteps';
import { useOpportunityAcceptanceHandlers } from '@dailydotdev/shared/src/features/recruiter/hooks/useOpportunityAcceptanceHandlers';
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

const AcceptPage = (): ReactElement => {
  const {
    query: { id },
    push,
    back,
  } = useRouter();
  const opportunityId = id as string;

  const { completeAction, isActionsFetched, checkHasCompleted } = useActions();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();

  const hasUploadedCV = checkHasCompleted(ActionType.UploadedCV);

  const { mutate: acceptOpportunity } = useMutation({
    ...acceptOpportunityMatchMutationOptions(opportunityId),
    onSuccess: async () => {
      await push(`${opportunityUrl}/${opportunityId}/notify`);
    },
    onError: () => {
      displayToast('Failed to accept jobs. Please try again.');
    },
  });
  const {
    file,
    setFile,
    handleUpload: handleUploadCV,
    isPending: isUploadPending,
  } = useCVUploadManager(acceptOpportunity);

  const handleUpload = useCallback(() => {
    logEvent({
      event_name: LogEvent.AnswerScreeningQuestion,
      target_id: opportunityId,
      extra: JSON.stringify({
        question_type: 'cv',
      }),
    });
    handleUploadCV();
  }, [logEvent, opportunityId, handleUploadCV]);

  const { data: opportunity } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
    enabled: false,
  });

  const candidatePreferencesOpts = getCandidatePreferencesOptions(user?.id);
  const { data: candidatePreferences } = useQuery({
    ...candidatePreferencesOpts,
    enabled: !!user?.id,
  });

  const updateQueryTuple = useUpdateQuery(candidatePreferencesOpts);

  // Step management hook
  const {
    currentStep,
    setCurrentStep,
    activeQuestion,
    setActiveQuestion,
    questions,
    totalSteps,
    stepNumber,
    nextButtonLabel,
    goToLastQuestion,
    goToPrevQuestion,
  } = useOpportunityAcceptanceSteps({
    opportunity,
    candidatePreferences,
    hasUploadedCV,
  });

  const { mutate: saveAnswers } = useMutation({
    ...saveOpportunityScreeningAnswersMutationOptions(opportunityId),
    onSuccess: async () => {
      logEvent({
        event_name: LogEvent.CompleteScreening,
        target_id: opportunityId,
      });
      // After screening questions, check if we need CV step
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

  // Handlers hook
  const {
    activeAnswer,
    selectedLocationId,
    setSelectedLocationId,
    locationQuery,
    setLocationQuery,
    selectedExperienceLevel,
    setSelectedExperienceLevel,
    isUpdatingExperience,
    handleChange,
    handleBack,
    handleExperienceLevelNext,
    handleNext,
  } = useOpportunityAcceptanceHandlers({
    currentStep,
    setCurrentStep,
    activeQuestion,
    setActiveQuestion,
    goToLastQuestion,
    goToPrevQuestion,
    questions,
    hasUploadedCV,
    onBack: back,
    onError: displayToast,
    onSaveAnswers: (answersToSave) => saveAnswers(answersToSave),
    onLogAnswer: (index, questionId) => {
      logEvent({
        event_name: LogEvent.AnswerScreeningQuestion,
        target_id: opportunityId,
        extra: JSON.stringify({
          index,
          question_id: questionId,
          question_type: 'screening',
        }),
      });
    },
    onLogExperienceLevel: (experienceLevel) => {
      logEvent({
        event_name: LogEvent.AnswerScreeningQuestion,
        target_id: opportunityId,
        extra: JSON.stringify({
          experience_level: experienceLevel,
          question_type: 'experience_level',
        }),
      });
    },
    onComplete: acceptOpportunity,
    initialExperienceLevel: user?.experienceLevel,
    initialLocationId: candidatePreferences?.externalLocationId,
  });

  const { data: locationOptions, isLoading: isLoadingLocations } = useQuery({
    queryKey: generateQueryKey(RequestKey.Autocomplete, user, 'location', {
      query: locationQuery,
    }),
    queryFn: () =>
      getAutocompleteLocations(locationQuery, LocationDataset.External),
    enabled: !!locationQuery && locationQuery.length > 0,
  });

  const { mutate: updatePreferences } = useMutation({
    ...updateCandidatePreferencesMutationOptions(updateQueryTuple),
    onError: () => {
      displayToast('Failed to save location. Please try again.');
    },
  });

  // Location handler with actual locationOptions
  const handleLocationNext = useCallback(() => {
    if (!selectedLocationId && candidatePreferences?.location?.length) {
      logEvent({
        event_name: LogEvent.AnswerScreeningQuestion,
        target_id: opportunityId,
        extra: JSON.stringify({
          location_id: candidatePreferences?.externalLocationId,
          question_type: 'location',
        }),
      });
      setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
      return;
    }

    if (!selectedLocationId) {
      return;
    }

    logEvent({
      event_name: LogEvent.AnswerScreeningQuestion,
      target_id: opportunityId,
      extra: JSON.stringify({
        location_id: selectedLocationId,
        question_type: 'location',
      }),
    });

    // If user kept their existing location (didn't change it), just proceed
    if (selectedLocationId === candidatePreferences?.externalLocationId) {
      setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
      return;
    }

    // User changed location, need to find it in options and update
    const selectedLocation = locationOptions?.find(
      (loc) => loc.id === selectedLocationId,
    );
    if (!selectedLocation) {
      return;
    }

    updatePreferences(
      {
        externalLocationId: selectedLocation.id,
      },
      {
        onSuccess: () => {
          setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
        },
      },
    );
  }, [
    selectedLocationId,
    candidatePreferences?.location?.length,
    candidatePreferences?.externalLocationId,
    locationOptions,
    updatePreferences,
    setCurrentStep,
    logEvent,
    opportunityId,
  ]);

  // Memoize mapped location options to avoid recreating on every render
  const mappedLocationOptions = useMemo(
    () =>
      locationOptions?.map((loc) => ({
        label: locationToString(loc),
        value: loc.id,
      })) || [],
    [locationOptions],
  );

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }
    completeAction(ActionType.OpportunityInitialView);
  }, [completeAction, isActionsFetched]);

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
                activeQuestion === questions.length - 1
                  ? nextButtonLabel
                  : 'Next question →'
              }
              nextDisabled={!activeAnswer.trim()}
            />
          </>
        )}

        {currentStep === AcceptStep.LOCATION && (
          <>
            <LocationStep
              currentStep={stepNumber}
              totalSteps={totalSteps}
              defaultLocation={{
                city: candidatePreferences?.location?.[0]?.city,
                country: candidatePreferences?.location?.[0]?.country,
              }}
              locationOptions={mappedLocationOptions}
              selectedLocationId={selectedLocationId}
              isLoadingLocations={isLoadingLocations}
              onLocationQueryChange={(value) => {
                setLocationQuery(value);
              }}
              onLocationSelect={(value) => {
                setSelectedLocationId(value);
              }}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleLocationNext}
              backLabel="Back"
              nextLabel={nextButtonLabel}
              nextDisabled={
                !selectedLocationId && !candidatePreferences?.location?.length
              }
            />
          </>
        )}

        {currentStep === AcceptStep.EXPERIENCE_LEVEL && (
          <>
            <ExperienceLevelStep
              currentStep={stepNumber}
              totalSteps={totalSteps}
              defaultValue={selectedExperienceLevel || undefined}
              onChange={(value) => setSelectedExperienceLevel(value)}
            />
            <StepNavigation
              onBack={handleBack}
              onNext={handleExperienceLevelNext}
              backLabel="Back"
              nextLabel={nextButtonLabel}
              nextDisabled={!selectedExperienceLevel}
              nextLoading={isUpdatingExperience}
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
              backLabel="Back"
              nextLabel={nextButtonLabel}
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
