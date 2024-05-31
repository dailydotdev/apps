import { ReactElement, ReactNode } from 'react';
import { SourceMemberRole, Squad } from '../graphql/sources';
import { Action, ActionType } from '../graphql/actions';
import { StorageTopic, generateStorageKey } from './storage';

export type ChecklistCardProps = {
  className?: string;
  title: string;
  description: string;
  steps: ChecklistStepType[];
};

export type ChecklistStepType = {
  action: Action;
  title: string;
  description: string;
  component?: (props: ChecklistStepProps) => ReactElement;
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
    ActionType.MakeSquadPublic,
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
