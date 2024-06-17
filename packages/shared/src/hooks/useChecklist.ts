import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChecklistStepType } from '../lib/checklist';
import { Action, ActionType } from '../graphql/actions';
import { disabledRefetch } from '../lib/func';

const CHECKLIST_OPEN_STEP_KEY = ['checklistOpenStepKey'];

export type UseChecklistProps = {
  steps: ChecklistStepType[];
};

export type UseChecklist = {
  steps: ChecklistStepType[];
  openStep: ActionType | undefined;
  onToggleStep: (action: Action) => void;
  isDone: boolean;
  activeStep: ActionType | undefined;
  completedSteps: ChecklistStepType[];
  nextStep: ChecklistStepType | undefined;
};

const useChecklist = ({ steps }: UseChecklistProps): UseChecklist => {
  const client = useQueryClient();
  const activeStep = useMemo(
    () => steps.find((item) => !item.action.completedAt)?.action.type,
    [steps],
  );
  const { data: openStep } = useQuery<ActionType>(
    CHECKLIST_OPEN_STEP_KEY,
    () => client.getQueryData(CHECKLIST_OPEN_STEP_KEY) || null,
    { initialData: null, ...disabledRefetch },
  );
  const setOpenStep = useCallback(
    (step: ActionType) => {
      client.setQueryData<ActionType>(CHECKLIST_OPEN_STEP_KEY, () => step);
      client.invalidateQueries(CHECKLIST_OPEN_STEP_KEY);
    },
    [client],
  );

  useEffect(() => {
    setOpenStep(activeStep);
  }, [client, setOpenStep, activeStep]);

  const onToggleStep = useCallback(
    (action: Action) => {
      const step = openStep === action.type ? null : action.type;
      setOpenStep(step);
    },
    [openStep, setOpenStep],
  );

  const isDone = useMemo(() => {
    return steps.length > 0 && steps.every((item) => !!item.action.completedAt);
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

  const nextStep = useMemo(() => {
    return steps?.find(
      (step) =>
        !completedSteps.some(
          (completedStep) => completedStep.action === step.action,
        ),
    );
  }, [steps, completedSteps]);

  return {
    steps: sortedStepsByCompletion,
    openStep,
    onToggleStep,
    isDone,
    activeStep,
    completedSteps,
    nextStep,
  };
};

export { useChecklist };
