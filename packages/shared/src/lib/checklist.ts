import { ReactElement, ReactNode } from 'react';
import { SourceMemberRole } from '../graphql/sources';
import { Action, ActionType } from '../graphql/actions';

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
    root: string;
    checkmark: string;
    title: string;
    description: string;
  }>;
  step: ChecklistStepType;
  checked: boolean;
  active: boolean;
  onToggle: (action: Action) => void;
  children?: ReactNode;
};

export const actionsPerRoleMap: Partial<
  Record<SourceMemberRole, ActionType[]>
> = {
  [SourceMemberRole.Admin]: [
    ActionType.CreateSquad,
    ActionType.EditWelcomePost,
    ActionType.SharePost,
    ActionType.InviteMember,
    ActionType.Notification,
  ],
  [SourceMemberRole.Member]: [
    ActionType.JoinSquad,
    ActionType.CommentOnWelcomePost,
    ActionType.SharePost,
    ActionType.InstallExtension,
    ActionType.Notification,
  ],
};

export type CreateChecklistStepProps = {
  step: Omit<ChecklistStepType, 'action'>;
  actions: Action[];
  type: ActionType;
};

export const createChecklistStep = ({
  step,
  actions,
  type,
}: CreateChecklistStepProps): ChecklistStepType => {
  const action = actions.find((item) => item.type === type) || {
    type,
    completedAt: null,
  };

  return {
    action,
    ...step,
  };
};
