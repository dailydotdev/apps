import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { OpportunityScreeningAnswer } from '@dailydotdev/shared/src/features/opportunity/types';
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
import { ProgressStep } from '@dailydotdev/shared/src/features/opportunity/components/ProgressStep';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import { mutateUserInfo } from '@dailydotdev/shared/src/graphql/users';
import {
  getAutocompleteLocations,
  LocationDataset,
} from '@dailydotdev/shared/src/graphql/autocomplete';
import type { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';
import ExperienceLevelDropdown from '@dailydotdev/shared/src/components/profile/ExperienceLevelDropdown';
import Autocomplete from '@dailydotdev/shared/src/components/fields/Autocomplete';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { locationToString } from '@dailydotdev/shared/src/lib/utils';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
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
  LOCATION = 'location',
  EXPERIENCE_LEVEL = 'experience_level',
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
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<
    keyof typeof UserExperienceLevel | null
  >(null);
  const [initialTotalSteps, setInitialTotalSteps] = useState<number | null>(
    null,
  );
  const [initialNeedsLocation, setInitialNeedsLocation] = useState<
    boolean | null
  >(null);
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
    handleUpload,
    isPending: isUploadPending,
  } = useCVUploadManager(acceptOpportunity);

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

  const { mutate: updateUserExperienceLevel, isPending: isUpdatingExperience } =
    useMutation({
      mutationFn: async (experienceLevel: keyof typeof UserExperienceLevel) => {
        return mutateUserInfo({ experienceLevel }, null, null);
      },
      onError: () => {
        displayToast('Failed to update experience level. Please try again.');
      },
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

  const questions = useMemo(
    () => opportunity?.questions || [],
    [opportunity?.questions],
  );

  const handleNext = useCallback(() => {
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
  }, [
    logEvent,
    opportunityId,
    activeQuestion,
    questions,
    saveAnswers,
    answers,
  ]);

  const goToLastQuestion = useCallback(() => {
    const lastIdx = questions.length - 1;
    setCurrentStep(AcceptStep.QUESTIONS);
    setActiveQuestion(lastIdx);
    setActiveAnswer(answers[lastIdx]?.answer || '');
  }, [questions.length, answers]);

  const goToPrevQuestion = useCallback(
    () =>
      setActiveQuestion((q) => {
        const prev = q - 1;
        setActiveAnswer(answers[prev]?.answer || '');
        return prev;
      }),
    [answers],
  );

  const handleBack = useCallback(() => {
    // Order: Location → Experience Level → Questions → CV
    switch (currentStep) {
      case AcceptStep.CV:
        // Go back to last question if there are questions
        if (questions.length > 0) {
          goToLastQuestion();
        } else {
          // No questions, go back to experience level
          setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
        }
        break;

      case AcceptStep.QUESTIONS:
        if (activeQuestion === 0) {
          // First question, go back to experience level
          setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
        } else {
          // Go to previous question
          goToPrevQuestion();
        }
        break;

      case AcceptStep.EXPERIENCE_LEVEL:
        // Always go back to location (which is always shown)
        setCurrentStep(AcceptStep.LOCATION);
        break;

      case AcceptStep.LOCATION:
        // First step, go back to previous page
        back();
        break;

      default:
        back();
    }
  }, [
    currentStep,
    questions.length,
    goToLastQuestion,
    activeQuestion,
    goToPrevQuestion,
    back,
  ]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setActiveAnswer(e.target.value);
      setAnswers((current) => ({
        ...current,
        [activeQuestion]: {
          questionId: questions[activeQuestion].id,
          answer: e.target.value,
        },
      }));
    },
    [activeQuestion, questions],
  );

  const handleLocationNext = useCallback(() => {
    if (!selectedLocationId && candidatePreferences?.location?.length) {
      setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
      return;
    }

    if (!selectedLocationId) {
      return;
    }

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
          // Always go to experience level validation step
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
  ]);

  const handleExperienceLevelNext = useCallback(() => {
    if (!selectedExperienceLevel) {
      return;
    }

    updateUserExperienceLevel(selectedExperienceLevel, {
      onSuccess: () => {
        // Check if there are screening questions
        if (questions.length > 0) {
          setCurrentStep(AcceptStep.QUESTIONS);
        } else if (!hasUploadedCV) {
          // No questions, check if we need CV step
          setCurrentStep(AcceptStep.CV);
        } else {
          // No questions and CV already uploaded
          acceptOpportunity();
        }
      },
    });
  }, [
    selectedExperienceLevel,
    updateUserExperienceLevel,
    questions.length,
    hasUploadedCV,
    acceptOpportunity,
  ]);

  // Calculate and store initial total steps once
  // Order: Location → Experience Level → Screening Questions → CV
  useEffect(() => {
    if (
      initialTotalSteps === null &&
      candidatePreferences &&
      isActionsFetched
    ) {
      let steps = 0;
      steps += 1; // Always include location
      steps += 1; // Always include experience level
      steps += questions.length; // Screening questions
      if (!hasUploadedCV) {
        steps += 1; // CV step
      }
      setInitialNeedsLocation(true); // Always show location
      setInitialTotalSteps(steps);
    }
  }, [
    candidatePreferences,
    questions.length,
    hasUploadedCV,
    isActionsFetched,
    initialTotalSteps,
  ]);

  const totalSteps = initialTotalSteps || 0;

  const stepNumber = useMemo(() => {
    let step = 0;

    // Order: Location → Experience Level → Questions → CV
    // Use initialNeedsLocation to match the frozen totalSteps

    // Location step
    if (currentStep === AcceptStep.LOCATION) {
      return step + 1;
    }
    if (initialNeedsLocation) {
      step += 1;
    }

    // Experience level step (always shown)
    if (currentStep === AcceptStep.EXPERIENCE_LEVEL) {
      return step + 1;
    }
    step += 1; // Always add experience level

    // Questions steps
    if (currentStep === AcceptStep.QUESTIONS) {
      return step + activeQuestion + 1;
    }
    step += questions.length;

    // CV step
    if (currentStep === AcceptStep.CV) {
      return step + 1;
    }

    return step;
  }, [currentStep, activeQuestion, questions.length, initialNeedsLocation]);

  // Determine if current step is the last step
  const isLastStep = stepNumber === totalSteps;
  const nextButtonLabel = isLastStep ? 'Submit' : 'Next →';

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

  // Initialize experience level from user
  useEffect(() => {
    if (user?.experienceLevel) {
      setSelectedExperienceLevel(user.experienceLevel);
    }
  }, [user?.experienceLevel]);

  // Initialize location from candidatePreferences if already set
  useEffect(() => {
    if (candidatePreferences?.externalLocationId) {
      setSelectedLocationId(candidatePreferences.externalLocationId);
    }
  }, [candidatePreferences?.externalLocationId]);

  // Initialize the correct step based on location, experience level, questions, and CV status
  // Order: Location → Experience Level → Questions → CV
  useEffect(() => {
    if (
      !opportunity ||
      !isActionsFetched ||
      currentStep !== null ||
      !candidatePreferences
    ) {
      return;
    }

    // Always start with location
    setCurrentStep(AcceptStep.LOCATION);
  }, [opportunity, candidatePreferences, isActionsFetched, currentStep]);

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
            <FlexCol className="gap-4">
              <Typography type={TypographyType.LargeTitle} bold center>
                Is this still right?
              </Typography>
              <Typography
                type={TypographyType.Title3}
                color={TypographyColor.Secondary}
                center
              >
                Make sure your location is up to date for the best opportunities
              </Typography>
            </FlexCol>
            <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
              <ProgressStep currentStep={stepNumber} totalSteps={totalSteps} />
              <Autocomplete
                name="location"
                label="Location"
                placeholder="Search for a city or country"
                defaultValue={
                  candidatePreferences?.location?.[0]
                    ? locationToString(candidatePreferences.location[0])
                    : ''
                }
                options={mappedLocationOptions}
                selectedValue={selectedLocationId}
                onChange={(value) => {
                  setLocationQuery(value);
                }}
                onSelect={(value) => {
                  setSelectedLocationId(value);
                }}
                isLoading={isLoadingLocations}
                resetOnBlur
              />
            </FlexCol>
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
            <FlexCol className="gap-4">
              <Typography type={TypographyType.LargeTitle} bold center>
                Verify your experience level
              </Typography>
              <Typography
                type={TypographyType.Title3}
                color={TypographyColor.Secondary}
                center
              >
                Make sure this is still accurate to get the best matches
              </Typography>
            </FlexCol>
            <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
              <ProgressStep currentStep={stepNumber} totalSteps={totalSteps} />
              <ExperienceLevelDropdown
                defaultValue={selectedExperienceLevel || undefined}
                onChange={(value) => setSelectedExperienceLevel(value)}
              />
            </FlexCol>
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
