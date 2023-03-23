import React, { FormEventHandler, ReactElement } from 'react';
import { Modal } from '../modals/common/Modal';
import { ModalState, SquadStateProps } from './utils';
import { SquadComment, SubmitSharePostFunc } from './Comment';
import { SquadForm } from '../../graphql/squads';

type SteppedSquadCommentProps = SquadStateProps;

export function SteppedSquadComment({
  onNext,
  form,
}: SteppedSquadCommentProps): ReactElement {
  const onSubmit = (nextStep: FormEventHandler): SubmitSharePostFunc => {
    return async (e) => {
      e.preventDefault();
      const data = { ...form, commentary: e.target[0].value } as SquadForm;

      nextStep(e);
      onNext(data);
    };
  };

  return (
    <Modal.StepsWrapper view={ModalState.WriteComment}>
      {({ nextStep }) => (
        <SquadComment form={form} onSubmit={onSubmit(nextStep)} />
      )}
    </Modal.StepsWrapper>
  );
}
