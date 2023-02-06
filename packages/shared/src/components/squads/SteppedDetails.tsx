import React, { FormEventHandler, ReactElement } from 'react';
import { Modal } from '../modals/common/Modal';
import { ModalState, SquadStateProps } from './utils';
import { SquadDetails } from './Details';
import { SquadForm } from '../../graphql/squads';

export function SteppedSquadDetails({
  onNext,
  form,
}: SquadStateProps): ReactElement {
  const onSubmit = (nextStep: FormEventHandler) => {
    return (e, formJson) => {
      e.preventDefault();
      nextStep(e);
      onNext({ ...form, ...formJson } as SquadForm);
    };
  };

  return (
    <Modal.StepsWrapper view={ModalState.Details}>
      {({ nextStep }) => (
        <SquadDetails form={form} onSubmit={onSubmit(nextStep)} createMode />
      )}
    </Modal.StepsWrapper>
  );
}
