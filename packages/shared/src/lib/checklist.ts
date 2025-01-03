import type { ReactElement, ReactNode } from 'react';
import type { Squad } from '../graphql/sources';
import { SourceMemberRole } from '../graphql/sources';
import type { Action } from '../graphql/actions';
import { ActionType } from '../graphql/actions';
import { generateStorageKey, StorageTopic } from './storage';

export enum ChecklistCardVariant {
  Default = 'default',
  Small = 'small',
}

export type ChecklistCardProps = {
  className?: string;
  title: string;
  content?: ReactNode;
  steps: ChecklistStepType[];
  variant?: ChecklistCardVariant;
  isOpen?: boolean;
  showProgressBar?: boolean;
};

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

export interface ChecklistStepPropsWithSquad extends ChecklistStepProps {
  squad: Squad;
}

export const actionsPerRoleMap: Partial<
  Record<SourceMemberRole, ActionType[]>
> = {
  [SourceMemberRole.Admin]: [
    ActionType.SquadFirstPost,
    ActionType.EditSquad,
    ActionType.EditWelcomePost,
    ActionType.SquadInvite,
    ActionType.LearnAboutPublicSquad,
  ],
  [SourceMemberRole.Member]: [
    ActionType.JoinSquad,
    ActionType.SquadFirstComment,
    ActionType.SquadFirstPost,
    ActionType.MyFeed,
    ActionType.BrowserExtension,
    ActionType.EnableNotification,
  ],
};

export type CreateChecklistStepProps = {
  step: Omit<ChecklistStepType, 'action'>;
  actions: Action[] | undefined;
  type: ActionType;
  condition?: (step: ChecklistStepType) => boolean;
};

export const createChecklistStep = ({
  step,
  actions,
  type,
  condition,
}: CreateChecklistStepProps): ChecklistStepType => {
  const action = actions?.find((item) => item.type === type) || {
    type,
    completedAt: null,
  };

  return {
    action,
    condition,
    ...step,
  };
};

export const SQUAD_CHECKLIST_VISIBLE_KEY = generateStorageKey(
  StorageTopic.Squad,
  'checklistVisible',
);

export type ChecklistVariantClassNameMap<T = string> = Record<
  ChecklistCardVariant,
  T
>;

export enum ChecklistViewState {
  Open = 'open',
  Closed = 'closed',
  Hidden = 'hidden',
}

export type ChecklistBarProps = Pick<
  ChecklistCardProps,
  'className' | 'title' | 'steps'
>;
