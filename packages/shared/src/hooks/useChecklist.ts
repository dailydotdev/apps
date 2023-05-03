import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChecklistStepType } from '../lib/checklist';
import { Action, ActionType } from '../graphql/actions';

export type UseChecklistProps = {
  steps: Pick<ChecklistStepType, 'action'>[];
};

export type UseChecklist = {
  openStep: string | undefined;
  onToggleStep: (action: Action) => void;
  isDone: boolean;
  activeStep: ActionType | undefined;
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

  return useMemo(() => {
    return {
      openStep,
      onToggleStep,
      isDone,
      activeStep,
    };
  }, [openStep, onToggleStep, isDone, activeStep]);
};

export { useChecklist };
