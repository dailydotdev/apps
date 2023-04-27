import { ReactElement, ReactNode } from 'react';

export type ChecklistCardProps = {
  className?: string;
  title: string;
  description: string;
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
  className?: Partial<{
    root: string;
    checkmark: string;
    title: string;
    description: string;
  }>;
  step: ChecklistStep;
  checked: boolean;
  active: boolean;
  onToggle: (action: ChecklistAction) => void;
  children?: ReactNode;
};

export type ChecklistAction = {
  userId: string;
  type: string;
  dateCompleted: Date | null;
};
