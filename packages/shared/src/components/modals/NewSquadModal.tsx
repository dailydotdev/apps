import React, { ReactElement, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Modal } from './common/Modal';
import { createSquad, Squad, SquadForm } from '../../graphql/squads';
import { SquadSelectArticle } from '../squads/SelectArticle';
import { SquadReady } from '../squads/Ready';
import { ModalState, quitSquadModal, SquadStateProps } from '../squads/utils';
import { usePrompt } from '../../hooks/usePrompt';
import { ModalStep } from './common/types';
import { SteppedSquadComment } from '../squads/SteppedComment';
import { SteppedSquadDetails } from '../squads/SteppedDetails';
import { Post } from '../../graphql/posts';
import { BOOT_QUERY_KEY } from '../../contexts/common';

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
  post?: Post;
};

let activeView;
function NewSquadModal({
  onPreviousState,
  onRequestClose,
  isOpen,
  post,
}: NewSquadModalProps): ReactElement {
  const [squad, setSquad] = useState<Squad>();
  const { showPrompt } = usePrompt();
  const client = useQueryClient();
  const [form, setForm] = useState<Partial<SquadForm>>({ post: { post } });
  const onNext = async (squadForm?: SquadForm) => {
    if (squadForm) setForm(squadForm);
    if (!squadForm.commentary) return;
    const newSquad = await createSquad(squadForm);
    await client.invalidateQueries(BOOT_QUERY_KEY);
    setSquad(newSquad);
  };
  const stateProps: SquadStateProps = {
    form,
    setForm,
    onNext,
    onRequestClose,
  };

  const modalSteps: ModalStep[] = [
    {
      key: ModalState.Details,
      title: (
        <>
          {onPreviousState && (
            <Modal.Header.StepsButton onClick={onPreviousState} />
          )}
          <Modal.Header.Subtitle>{ModalState.Details}</Modal.Header.Subtitle>
        </>
      ),
    },
    !post ? { key: ModalState.SelectArticle } : undefined,
    { key: ModalState.WriteComment },
    {
      key: ModalState.Ready,
      title: <Modal.Header.Title>{ModalState.Ready}</Modal.Header.Title>,
    },
  ].filter((step) => step);

  const handleClose = async () => {
    if (activeView === ModalState.Ready) return onRequestClose();

    const shouldQuit = await showPrompt(quitSquadModal);
    if (shouldQuit) onRequestClose();
    return null;
  };
  return (
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
      <SteppedSquadDetails {...stateProps} />
      {!post && <SquadSelectArticle {...stateProps} />}
      <SteppedSquadComment {...stateProps} />
      <SquadReady {...stateProps} squad={squad} />
    </Modal>
  );
}

export default NewSquadModal;
