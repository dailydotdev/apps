import React, { FormEventHandler, ReactElement, useContext } from 'react';
import { Modal } from '../modals/common/Modal';
import { ModalState, SquadForm, SquadStateProps } from './utils';
import { ModalPropsContext } from '../modals/common/types';
import { SquadComment } from './Comment';

export function SteppedSquadComment({
  onNext,
  form,
}: SquadStateProps): ReactElement {
  const { activeView } = useContext(ModalPropsContext);
  if (ModalState.WriteComment !== activeView || !form.post) return null;
  const onSubmit = (nextStep: FormEventHandler): FormEventHandler => {
    return (e) => {
      e.preventDefault();
      nextStep(e);
      onNext({ ...form, commentary: e.target[0].value } as SquadForm);
    };
  };
  return (
    <>
      <Modal.StepsWrapper>
        {({ nextStep }) => (
          <SquadComment form={form} onSubmit={onSubmit(nextStep)} />
        )}
      </Modal.StepsWrapper>
    </>
  );
}
