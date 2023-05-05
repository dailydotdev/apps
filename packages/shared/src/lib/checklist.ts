import { ReactElement, ReactNode } from 'react';
import { SourceMemberRole } from '../graphql/sources';
import { Action, ActionType } from '../graphql/actions';
import { StorageTopic, generateStorageKey } from './storage';

export type ChecklistCardProps = {
  className?: string;
  title: string;
  description: string;
  steps: ChecklistStepType[];
  onRequestClose?: () => void;
};

export type ChecklistStepType = {
  action: Action;
  title: string;
  description: string;
  component?: (props: ChecklistStepProps) => ReactElement;
};

export type ChecklistStepProps = {
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
};

export const actionsPerRoleMap: Partial<
  Record<SourceMemberRole, ActionType[]>
> = {
  [SourceMemberRole.Admin]: [
    ActionType.CreateSquad,
    ActionType.EditWelcomePost,
    ActionType.SquadFirstPost,
    ActionType.SquadInvite,
    ActionType.EnableNotification,
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
};

export const createChecklistStep = ({
  step,
  actions,
  type,
}: CreateChecklistStepProps): ChecklistStepType => {
  const action = actions?.find((item) => item.type === type) || {
    type,
    completedAt: null,
  };

  return {
    action,
    ...step,
  };
};

export const SQUAD_CHECKLIST_VISIBLE_KEY = generateStorageKey(
  StorageTopic.Squad,
  'checklistVisible',
);
