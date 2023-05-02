import { useMemo } from 'react';
import { ChecklistStepType } from '../lib/checklist';

export type UseChecklistProps = {
  steps: Pick<ChecklistStepType, 'action'>[];
};

export type UseChecklist = {
  isDone: boolean;
};

const useChecklist = ({ steps }: UseChecklistProps): UseChecklist => {
  return useMemo(() => {
    return {
      isDone: steps.every((item) => !!item.action.completedAt),
    };
  }, [steps]);
};

export { useChecklist };
