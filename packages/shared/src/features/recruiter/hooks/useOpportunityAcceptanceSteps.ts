import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Opportunity,
  UserCandidatePreferences,
} from '../../opportunity/types';

export enum AcceptStep {
  QUESTIONS = 'questions',
  LOCATION = 'location',
  EXPERIENCE_LEVEL = 'experience_level',
  CV = 'cv',
}

export const useOpportunityAcceptanceSteps = ({
  opportunity,
  candidatePreferences,
  hasUploadedCV,
}: {
  opportunity: Opportunity | undefined;
  candidatePreferences: UserCandidatePreferences | undefined;
  hasUploadedCV: boolean;
}) => {
  const [activeQuestion, setActiveQuestion] = useState(0);

  const questions = useMemo(
    () => opportunity?.questions || [],
    [opportunity?.questions],
  );

  // Calculate total steps
  const initialTotalSteps = useMemo(() => {
    if (!candidatePreferences) {
      return null;
    }
    let steps = 0;
    steps += 1; // Always include location
    steps += 1; // Always include experience level
    steps += questions.length; // Screening questions
    if (!hasUploadedCV) {
      steps += 1; // CV step
    }
    return steps;
  }, [candidatePreferences, questions.length, hasUploadedCV]);

  // Always show location
  const initialNeedsLocation = true;

  // Initialize currentStep - start with location only when dependencies are ready
  const [currentStep, setCurrentStep] = useState<AcceptStep | null>(() => {
    if (opportunity && candidatePreferences) {
      return AcceptStep.LOCATION;
    }
    return null;
  });

  // Update currentStep when dependencies become ready after mount
  useEffect(() => {
    if (currentStep === null && opportunity && candidatePreferences) {
      setCurrentStep(AcceptStep.LOCATION);
    }
  }, [opportunity, candidatePreferences, currentStep]);

  const totalSteps = initialTotalSteps || 0;

  // Calculate current step number
  const stepNumber = useMemo(() => {
    let step = 0;

    // Location step
    if (currentStep === AcceptStep.LOCATION) {
      return step + 1;
    }
    if (initialNeedsLocation) {
      step += 1;
    }

    // Experience level step
    if (currentStep === AcceptStep.EXPERIENCE_LEVEL) {
      return step + 1;
    }
    step += 1; // Always count experience level

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

  const isLastStep = stepNumber === totalSteps;
  const nextButtonLabel = isLastStep ? 'Submit' : 'Next →';

  const goToLastQuestion = useCallback(() => {
    const last = questions.length - 1;
    setActiveQuestion(last);
  }, [questions.length, setActiveQuestion]);

  const goToPrevQuestion = useCallback(() => {
    setActiveQuestion((q) => q - 1);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    activeQuestion,
    setActiveQuestion,
    questions,
    totalSteps,
    stepNumber,
    isLastStep,
    nextButtonLabel,
    goToLastQuestion,
    goToPrevQuestion,
  };
};
