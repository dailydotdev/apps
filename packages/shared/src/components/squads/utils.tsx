import React from 'react';
import classed from '../../lib/classed';
import { PromptOptions } from '../../hooks/usePrompt';
import { SquadForm } from '../../graphql/squads';

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
