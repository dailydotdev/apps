import { ReactElement } from 'react';

export type ChecklistCardProps = {
  className?: string;
  steps: ChecklistStep[];
};

export type ChecklistStep = {
  action: ChecklistAction;
  title: string;
  description: string;
  component?: (props: ChecklistStepProps) => ReactElement;
};

export type ChecklistStepProps = {
  className?: string;
  step: ChecklistStep;
  checked: boolean;
  onToggle: (action: ChecklistAction) => void;
};

export type ChecklistAction = {
  userId: string;
  id: string;
  dateCompleted: Date | null;
};
