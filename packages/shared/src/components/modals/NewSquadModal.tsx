import React, { ReactElement, useState } from 'react';
import { Modal } from './common/Modal';
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
import { ModalStep } from './common/types';

export const modalStateOrder = [
  ModalState.Details,
  ModalState.SelectArticle,
  ModalState.WriteComment,
  ModalState.Ready,
];

export type NewSquadModalProps = {
  onRequestClose: () => void;
  onPreviousState?: () => void;
  isOpen: boolean;
};

let activeView;
function NewSquadModal({
  onPreviousState,
  onRequestClose,
  isOpen,
}: NewSquadModalProps): ReactElement {
  const [squad, setSquad] = useState<Squad>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [form, setForm] = useState<Partial<SquadForm>>({});
  const onNext = async (squadForm?: SquadForm) => {
    if (squadForm) setForm(squadForm);
    if (!squadForm.commentary) return;
    const newSquad = await createSquad(squadForm);
    setSquad(newSquad);
  };
  const stateProps: SquadStateProps = {
    form,
    setForm,
    onNext,
  };

  const modalSteps: ModalStep[] = [
    {
      key: ModalState.Details,
      title: (
        <>
          <Modal.Header.StepsButton onClick={onPreviousState} />
          <Modal.Header.Subtitle>{ModalState.Details}</Modal.Header.Subtitle>
        </>
      ),
    },
    {
      key: ModalState.SelectArticle,
    },
    {
      key: ModalState.WriteComment,
    },
    {
      key: ModalState.Ready,
      title: <Modal.Header.Title>{ModalState.Ready}</Modal.Header.Title>,
    },
  ];
  const handleClose = () => {
    if (activeView === ModalState.Ready) onRequestClose();
    else setShowConfirmation(true);
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
        onRequestClose={handleClose}
        onViewChange={(view) => {
          activeView = view;
        }}
        steps={modalSteps}
      >
        <Modal.Header.Steps />
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
