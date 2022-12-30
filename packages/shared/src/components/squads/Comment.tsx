import React, { ReactElement } from 'react';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import Textarea from '../fields/Textarea';
import { ModalState, SquadStateProps } from './utils';

export function SquadComment({
  modalState,
  onNext,
}: SquadStateProps): ReactElement {
  if (ModalState.WriteComment !== modalState) return null;
  return (
    <>
      <Modal.Body>
        <Textarea
          label="Share your thought and insights about the article…"
          inputId="comment"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-primary-cabbage" onClick={() => onNext()}>
          Finish
        </Button>
      </Modal.Footer>
    </>
  );
}
