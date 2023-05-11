import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChecklistStepType } from '../lib/checklist';
import { Action, ActionType } from '../graphql/actions';

export type UseChecklistProps = {
  steps: ChecklistStepType[];
};

export type UseChecklist = {
  steps: ChecklistStepType[];
  openStep: string | undefined;
  onToggleStep: (action: Action) => void;
  isDone: boolean;
  activeStep: ActionType | undefined;
  completedSteps: ChecklistStepType[];
};

const useChecklist = ({ steps }: UseChecklistProps): UseChecklist => {
  const activeStep = useMemo(
    () => steps.find((item) => !item.action.completedAt)?.action.type,
    [steps],
  );
  const [openStep, setOpenStep] = useState<string>(activeStep);

  useEffect(() => {
    setOpenStep(activeStep);
  }, [activeStep]);

  const onToggleStep = useCallback((action: Action) => {
    setOpenStep((currentCheckedStep) => {
      if (currentCheckedStep === action.type) {
        return undefined;
      }

      return action.type;
    });
  }, []);

  const isDone = useMemo(() => {
    return steps.every((item) => !!item.action.completedAt);
  }, [steps]);

  const completedSteps = useMemo(() => {
    return steps.filter((step) => !!step.action.completedAt);
  }, [steps]);

  const sortedStepsByCompletion = useMemo(() => {
    return [...steps].sort((a, b) => {
      if (a.action.completedAt && !b.action.completedAt) {
        return -1;
      }

      if (!a.action.completedAt && b.action.completedAt) {
        return 1;
      }

      return 0;
    });
  }, [steps]);

  return {
    steps: sortedStepsByCompletion,
    openStep,
    onToggleStep,
    isDone,
    activeStep,
    completedSteps,
  };
};

export { useChecklist };
