import React from 'react';
import { UseInfiniteQueryResult } from 'react-query';
import classed from '../../lib/classed';
import { PromptOptions } from '../../hooks/usePrompt';
import { SquadEdgesData, SquadForm } from '../../graphql/squads';
import { UserShortProfile } from '../../lib/user';

export enum ModalState {
  Details = 'Squad details',
  SelectArticle = 'Pick an article',
  WriteComment = 'Post article',
  Ready = 'Almost there!',
}

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
  title: 'Quit the process?',
  description: (
    <>
      <p>
        Learning is more powerful together. Are you sure you want to quit the
        process?
      </p>
      <p>p.s you can create a new Squad from the left sidebar</p>
    </>
  ),
  cancelButton: {
    title: 'Cancel',
  },
  okButton: {
    title: 'Continue',
    className: 'text-white btn-primary-ketchup',
  },
};

export const getSquadMembersUserRole = (
  input: UseInfiniteQueryResult<SquadEdgesData>,
  user: UserShortProfile,
) => {
  return input.data?.pages
    .map((page) =>
      page.sourceMembers.edges.filter(({ node }) => node.user.id === user.id),
    )
    .flat()[0].node.role;
};
