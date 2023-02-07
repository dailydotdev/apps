import React, { ReactElement, useState } from 'react';
import { Modal } from './common/Modal';
import { Squad, SquadForm } from '../../graphql/squads';
import { SquadSelectArticle } from '../squads/SelectArticle';
import { SquadReady } from '../squads/Ready';
import { ModalState, quitSquadModal, SquadStateProps } from '../squads/utils';
import { usePrompt } from '../../hooks/usePrompt';
import { ModalStep } from './common/types';
import { SteppedSquadComment } from '../squads/SteppedComment';
import { SteppedSquadDetails } from '../squads/SteppedDetails';
import { Post } from '../../graphql/posts';
import { useBoot } from '../../hooks/useBoot';
import SquadAccessIntro from '../sidebar/SquadAccessIntro';

export const modalStateOrder = [
  ModalState.Details,
  ModalState.SelectArticle,
  ModalState.WriteComment,
  ModalState.Ready,
];

export type NewSquadModalProps = {
  onRequestClose: () => void;
  isOpen: boolean;
  post?: Post;
  shouldShowIntro?: boolean;
};

let activeView;
function NewSquadModal({
  onRequestClose,
  isOpen,
  post,
  shouldShowIntro = false,
}: NewSquadModalProps): ReactElement {
  const [squad, setSquad] = useState<Squad>();
  const { showPrompt } = usePrompt();
  const { addSquad } = useBoot();
  const [shouldShowBetaModal, setShouldShowBetaModal] =
    useState(shouldShowIntro);
  const [form, setForm] = useState<Partial<SquadForm>>({ post: { post } });
  const onNext = async (squadForm?: SquadForm) =>
    squadForm && setForm(squadForm);
  const onCreate = (newSquad: Squad) => {
    addSquad(newSquad);
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
          {shouldShowIntro && (
            <Modal.Header.StepsButton
              onClick={() => setShouldShowBetaModal(true)}
            />
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

  if (shouldShowBetaModal) {
    return (
      <Modal
        isOpen
        key="intro-modal"
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
        onRequestClose={handleClose}
      >
        <SquadAccessIntro
          onClose={handleClose}
          onCreateSquad={() => setShouldShowBetaModal(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      key="form-modal"
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
      <SteppedSquadComment {...stateProps} onCreate={onCreate} />
      {squad && <SquadReady {...stateProps} squad={squad} />}
    </Modal>
  );
}

export default NewSquadModal;
