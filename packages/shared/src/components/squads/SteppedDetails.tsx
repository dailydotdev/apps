import React, { FormEventHandler, ReactElement, useContext } from 'react';
import { Modal } from '../modals/common/Modal';
import { ModalState, SquadStateProps } from './utils';
import { ModalPropsContext } from '../modals/common/types';
import { SquadDetails } from './Details';
import { SquadForm } from '../../graphql/squads';

export function SteppedSquadDetails({
  onNext,
  form,
}: SquadStateProps): ReactElement {
  const { activeView } = useContext(ModalPropsContext);
  if (ModalState.Details !== activeView) return null;
  const onSubmit = (nextStep: FormEventHandler) => {
    return (e, formJson) => {
      e.preventDefault();
      nextStep(e);
      onNext({ ...form, ...formJson } as SquadForm);
    };
  };
  return (
    <Modal.StepsWrapper>
      {({ nextStep }) => (
        <SquadDetails form={form} onSubmit={onSubmit(nextStep)} createMode />
      )}
    </Modal.StepsWrapper>
  );
}
