import { ReactElement } from 'react';

export type ChecklistCardProps = {
  className?: string;
  steps: ChecklistStep[];
  onRequestClose?: () => void;
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
  active: boolean;
  onToggle: (action: ChecklistAction) => void;
};

export type ChecklistAction = {
  userId: string;
  type: string;
  dateCompleted: Date | null;
};
