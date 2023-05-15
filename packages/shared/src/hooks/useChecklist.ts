import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { ChecklistStepType } from '../lib/checklist';
import { Action, ActionType } from '../graphql/actions';

const CHECKLIST_OPEN_STEP_KEY = 'checklistOpenStepKey';

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
};

const useChecklist = ({ steps }: UseChecklistProps): UseChecklist => {
  const client = useQueryClient();
  const activeStep = useMemo(
    () => steps.find((item) => !item.action.completedAt)?.action.type,
    [steps],
  );
  // const [openStep, setOpenStep] = useState<ActionType>(activeStep);
  const { data: openStep } = useQuery<ActionType | undefined>(
    CHECKLIST_OPEN_STEP_KEY,
    () => client.getQueryData(CHECKLIST_OPEN_STEP_KEY),
    { initialData: undefined },
  );

  useEffect(() => {
    client.setQueryData<ActionType | undefined>(
      CHECKLIST_OPEN_STEP_KEY,
      activeStep,
    );
  }, [client, activeStep]);

  const onToggleStep = useCallback(
    (action: Action) => {
      client.setQueryData<ActionType | undefined>(
        CHECKLIST_OPEN_STEP_KEY,
        (currentCheckedStep) => {
          if (currentCheckedStep === action.type) {
            return undefined;
          }

          return action.type;
        },
      );
    },
    [client],
  );

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
