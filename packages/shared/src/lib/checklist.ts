import type { ReactElement, ReactNode } from 'react';
import type { Action } from '../graphql/actions';

export enum ChecklistCardVariant {
  Default = 'default',
  Small = 'small',
}

export type ChecklistStepType = {
  action: Action;
  title: string;
  description: string;
  component?: (props: ChecklistStepProps) => ReactElement;
  condition?: (step: ChecklistStepType) => boolean;
};

export interface ChecklistStepProps {
  className?: Partial<{
    container: string;
    checkmark: string;
    title: string;
    description: string;
  }>;
  step: ChecklistStepType;
  isOpen: boolean;
  isActive: boolean;
  onToggle: (action: Action) => void;
  children?: ReactNode;
  variant: ChecklistCardVariant;
}

export enum ChecklistViewState {
  Open = 'open',
  Closed = 'closed',
  Hidden = 'hidden',
}
