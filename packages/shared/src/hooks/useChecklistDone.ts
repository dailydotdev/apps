import { useMemo } from 'react';
import { ChecklistStepType } from '../lib/checklist';

export type UseChecklistDoneProps = {
  steps: Pick<ChecklistStepType, 'action'>[];
};

export type UseChecklistDone = {
  isDone: boolean;
};

const useChecklistDone = ({
  steps,
}: UseChecklistDoneProps): UseChecklistDone => {
  return useMemo(() => {
    return {
      isDone: steps.every((item) => !!item.action.completedAt),
    };
  }, [steps]);
};

export { useChecklistDone };
