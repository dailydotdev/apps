import { ReactElement, ReactNode } from 'react';
import { SourceMemberRole } from '../graphql/sources';

export type ChecklistCardProps = {
  className?: string;
  title: string;
  description: string;
  steps: ChecklistStepType[];
  onRequestClose?: () => void;
};

export type ChecklistStepType = {
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
  step: ChecklistStepType;
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

// TODO merge with other PR that contains useActions hook implementation
export enum ActionType {
  CreateSquad = 'createSquad',
  JoinSquad = 'joinSquad',
  EditWelcomePost = 'editWelcomePost',
  CommentOnWelcomePost = 'commentOnWelcomePost',
  SharePost = 'sharePost',
  InviteMember = 'inviteMember',
  InstallExtension = 'installExtension',
  Notification = 'notification',
}

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
