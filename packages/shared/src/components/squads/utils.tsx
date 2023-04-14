import React from 'react';
import classed from '../../lib/classed';
import { PromptOptions } from '../../hooks/usePrompt';
import { SquadForm } from '../../graphql/squads';

export enum ModalState {
  Details = 'Squad settings',
  SelectArticle = 'Pick a post',
  WriteComment = 'Share post',
  Ready = 'Almost there!',
}
export const modalStateToScreenValue: Record<ModalState, string> = {
  [ModalState.Details]: 'squad settings',
  [ModalState.SelectArticle]: 'share article',
  [ModalState.WriteComment]: 'comment',
  [ModalState.Ready]: 'invitation',
};
export const SquadTitle = classed(
  'h3',
  'text-center typo-large-title font-bold',
);
export const SquadSubTitle = classed(
  'p',
  'text-center typo-title3 text-theme-label-tertiary',
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
