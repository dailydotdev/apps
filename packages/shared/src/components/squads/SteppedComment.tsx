import React, { FormEventHandler, ReactElement } from 'react';
import { Modal } from '../modals/common/Modal';
import { ModalState, SquadStateProps } from './utils';
import { SquadComment } from './Comment';
import { createSquad, Squad, SquadForm } from '../../graphql/squads';
import { useToastNotification } from '../../hooks/useToastNotification';

interface SteppedSquadCommentProps extends SquadStateProps {
  onCreate?: (squad: Squad) => void;
}

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

export function SteppedSquadComment({
  onCreate,
  onNext,
  form,
}: SteppedSquadCommentProps): ReactElement {
  const { displayToast } = useToastNotification();
  const onSubmit = (nextStep: FormEventHandler): FormEventHandler => {
    return async (e) => {
      e.preventDefault();
      const data = { ...form, commentary: e.target[0].value } as SquadForm;

      if (!onCreate) {
        nextStep(e);
        onNext(data);
        return;
      }

      try {
        const newSquad = await createSquad({ ...form, ...data });
        if (!newSquad) return;
        onCreate(newSquad);
        nextStep(e);
      } catch (err) {
        displayToast(DEFAULT_ERROR);
      }
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
