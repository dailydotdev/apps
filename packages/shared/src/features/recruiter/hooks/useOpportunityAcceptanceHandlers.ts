import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { UserExperienceLevel } from '../../../lib/user';
import type { OpportunityScreeningAnswer } from '../../opportunity/types';
import { mutateUserInfo } from '../../../graphql/users';
import { AcceptStep } from './useOpportunityAcceptanceSteps';

export const useOpportunityAcceptanceHandlers = ({
  currentStep,
  setCurrentStep,
  activeQuestion,
  setActiveQuestion,
  goToLastQuestion,
  goToPrevQuestion,
  questions,
  hasUploadedCV,
  onBack,
  onError,
  onSaveAnswers,
  onLogAnswer,
  onLogExperienceLevel,
  onComplete,
  initialExperienceLevel,
  initialLocationId,
}: {
  currentStep: AcceptStep | null;
  setCurrentStep: (step: AcceptStep) => void;
  activeQuestion: number;
  setActiveQuestion: (question: number) => void;
  goToLastQuestion: () => void;
  goToPrevQuestion: () => void;
  questions: Array<{ id: string; title: string; placeholder?: string }>;
  hasUploadedCV: boolean;
  onBack: () => void;
  onError: (message: string) => void;
  onSaveAnswers: (answers: Array<OpportunityScreeningAnswer>) => void;
  onLogAnswer: (index: number, questionId: string) => void;
  onLogExperienceLevel?: (
    experienceLevel: keyof typeof UserExperienceLevel,
  ) => void;
  onComplete?: () => void;
  initialExperienceLevel?: keyof typeof UserExperienceLevel;
  initialLocationId?: string;
}) => {
  const [activeAnswer, setActiveAnswer] = useState('');
  const [answers, setAnswers] = useState<
    Record<string, OpportunityScreeningAnswer>
  >({});
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    initialLocationId || '',
  );
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<
    keyof typeof UserExperienceLevel | null
  >(initialExperienceLevel || null);

  // Experience level update mutation
  const { mutate: updateUserExperienceLevel, isPending: isUpdatingExperience } =
    useMutation({
      mutationFn: async (experienceLevel: keyof typeof UserExperienceLevel) => {
        return mutateUserInfo({ experienceLevel }, null, null);
      },
      onError: () => {
        onError('Failed to update experience level. Please try again.');
      },
    });

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

  const handleBack = useCallback(() => {
    // Order: Location → Experience Level → Questions → CV
    switch (currentStep) {
      case AcceptStep.CV:
        if (questions.length > 0) {
          goToLastQuestion();
          setCurrentStep(AcceptStep.QUESTIONS);
        } else {
          setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
        }
        break;

      case AcceptStep.QUESTIONS:
        if (activeQuestion === 0) {
          setCurrentStep(AcceptStep.EXPERIENCE_LEVEL);
        } else {
          goToPrevQuestion();
        }
        break;

      case AcceptStep.EXPERIENCE_LEVEL:
        setCurrentStep(AcceptStep.LOCATION);
        break;

      case AcceptStep.LOCATION:
        onBack();
        break;

      default:
        onBack();
    }
  }, [
    currentStep,
    questions.length,
    goToLastQuestion,
    activeQuestion,
    goToPrevQuestion,
    setCurrentStep,
    onBack,
  ]);

  const handleExperienceLevelNext = useCallback(() => {
    if (!selectedExperienceLevel) {
      return;
    }

    onLogExperienceLevel?.(selectedExperienceLevel);

    updateUserExperienceLevel(selectedExperienceLevel, {
      onSuccess: () => {
        if (questions.length > 0) {
          setCurrentStep(AcceptStep.QUESTIONS);
        } else if (!hasUploadedCV) {
          setCurrentStep(AcceptStep.CV);
        } else {
          // Experience level is the last step, complete the flow
          onComplete?.();
        }
      },
    });
  }, [
    selectedExperienceLevel,
    onLogExperienceLevel,
    updateUserExperienceLevel,
    questions.length,
    hasUploadedCV,
    setCurrentStep,
    onComplete,
  ]);

  const handleNext = useCallback(() => {
    // Log the screening answer
    onLogAnswer(activeQuestion, questions[activeQuestion].id);

    // Check if this is the last screening question
    if (activeQuestion === questions.length - 1) {
      onSaveAnswers(Object.values(answers));
      return;
    }

    // Move to next screening question
    setActiveQuestion(activeQuestion + 1);
    setActiveAnswer('');
  }, [
    onLogAnswer,
    activeQuestion,
    questions,
    onSaveAnswers,
    answers,
    setActiveQuestion,
  ]);

  return {
    // State
    activeAnswer,
    setActiveAnswer,
    answers,
    selectedLocationId,
    setSelectedLocationId,
    locationQuery,
    setLocationQuery,
    selectedExperienceLevel,
    setSelectedExperienceLevel,
    isUpdatingExperience,

    // Handlers
    handleChange,
    handleBack,
    handleExperienceLevelNext,
    handleNext,
  };
};
