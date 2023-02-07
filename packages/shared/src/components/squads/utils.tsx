import React from 'react';
import { UseInfiniteQueryResult } from 'react-query';
import classed from '../../lib/classed';
import { PromptOptions } from '../../hooks/usePrompt';
import {
  SquadEdgesData,
  SquadForm,
  SquadMemberRole,
} from '../../graphql/squads';
import { UserShortProfile } from '../../lib/user';

export enum ModalState {
  Details = 'Squad details',
  SelectArticle = 'Pick an article',
  WriteComment = 'Post article',
  Ready = 'Almost there!',
}
export const modalStateToScreenValue: Record<ModalState, string> = {
  [ModalState.Details]: 'squad details',
  [ModalState.SelectArticle]: 'share article',
  [ModalState.WriteComment]: 'comment',
  [ModalState.Ready]: 'invitation',
};
export const SquadTitle = classed(
  'h3',
  'text-center typo-large-title font-bold',
);
export const SquadTitleColor = classed('span', 'text-theme-color-cabbage');

export type SquadStateProps = {
  onNext: (squad?: SquadForm) => void;
  form: Partial<SquadForm>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SquadForm>>>;
  onRequestClose?: () => void;
};

export const quitSquadModal: PromptOptions = {
  title: 'Are you sure?',
  description: <p>You can always create a new Squad from the left sidebar</p>,
  className: {
    buttons: 'flex-row-reverse',
  },
  cancelButton: {
    title: 'Stay',
    className: 'btn-primary-cabbage',
  },
  okButton: {
    title: 'Close',
    className: 'btn-secondary',
  },
};

export const getSquadMembersUserRole = (
  input: UseInfiniteQueryResult<SquadEdgesData>,
  user: UserShortProfile,
): SquadMemberRole => {
  return input.data?.pages
    .map((page) =>
      page.sourceMembers.edges.filter(({ node }) => node.user.id === user.id),
    )
    .flat()[0].node.role;
};
