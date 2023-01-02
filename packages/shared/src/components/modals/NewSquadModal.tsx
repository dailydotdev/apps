import React, { ReactElement, useState } from 'react';
import { Modal } from './common/Modal';
import ArrowIcon from '../icons/Arrow';
import { Button } from '../buttons/Button';
import { Squad } from '../../graphql/squads';
import { SquadDetails } from '../squads/Details';
import { SquadSelectArticle } from '../squads/SelectArticle';
import { SquadReady } from '../squads/Ready';
import {
  createSquad,
  ModalState,
  SquadForm,
  SquadStateProps,
} from '../squads/utils';
import { SquadComment } from '../squads/Comment';
import { SquadsConfirmation } from './SquadsConfirmationModal';

export const modalStateOrder = [
  ModalState.Details,
  ModalState.SelectArticle,
  ModalState.WriteComment,
  ModalState.Ready,
];

export type NewSquadModalProps = {
  onRequestClose: () => void;
  onPreviousState: () => void;
  isOpen: boolean;
};

function NewSquadModal({
  onPreviousState,
  onRequestClose,
  isOpen,
}: NewSquadModalProps): ReactElement {
  const [modalState, setModalState] = useState(ModalState.Details);
  const [squad, setSquad] = useState<Squad>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const changeState = (prev: boolean) => {
    const index = modalStateOrder.findIndex((state) => state === modalState);
    const changeTo = modalStateOrder[index + (prev ? -1 : 1)];
    if (changeTo) setModalState(changeTo);
    else if (prev) onPreviousState();
    else onRequestClose();
  };
  const stepperWidth = () => {
    const index =
      modalStateOrder.findIndex((state) => state === modalState) + 1;
    return (index / modalStateOrder.length) * 100;
  };
  const [form, setForm] = useState<Partial<SquadForm>>({});
  const onNext = async (squadForm?: SquadForm) => {
    const currentState = modalState;
    changeState(false);
    if (squadForm) setForm(squadForm);
    if (ModalState.WriteComment !== currentState) return;
    const newSquad = await createSquad(squadForm);
    setSquad(newSquad);
  };
  const stateProps: SquadStateProps = {
    modalState,
    form,
    setForm,
    onNext,
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
        onRequestClose={() => setShowConfirmation(true)}
      >
        {modalState === ModalState.Ready && <Modal.Header title={modalState} />}
        {modalState !== ModalState.Ready && (
          <Modal.Header>
            <Button
              icon={<ArrowIcon className="-rotate-90" />}
              className="flex justify-center items-center mr-2 -ml-2 btn btn-tertiary iconOnly"
              onClick={() => changeState(true)}
            />
            <h3 className="font-bold typo-callout">{modalState}</h3>
          </Modal.Header>
        )}
        <div
          className="absolute left-0 h-1 top-[3.3rem] bg-theme-color-cabbage transition-[width]"
          style={{ width: `${stepperWidth()}%` }}
        />
        <SquadDetails {...stateProps} />
        <SquadSelectArticle {...stateProps} />
        <SquadComment {...stateProps} />
        <SquadReady {...stateProps} squad={squad} />
      </Modal>
      {showConfirmation && (
        <SquadsConfirmation
          onContinue={onRequestClose}
          onRequestClose={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
}

export default NewSquadModal;
