import React, { ReactElement, useState } from 'react';
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
import { useBoot } from '../../hooks/useBoot';
import SquadsBackgroundSvg from '../../svg/SquadsBackground';
import { Justify } from '../utilities';
import { Button } from '../buttons/Button';

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
  shouldShowIntro?: boolean;
};

let activeView;
function NewSquadModal({
  onPreviousState,
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
  const onNext = async (squadForm?: SquadForm) => {
    if (squadForm) setForm(squadForm);
    if (!squadForm.commentary) return;
    const newSquad = await createSquad(squadForm);
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

  if (shouldShowBetaModal) {
    return (
      <Modal isOpen kind={Modal.Kind.FixedCenter} size={Modal.Size.Small}>
        <Modal.Body>
          <SquadsBackgroundSvg className="absolute top-0 left-0 w-full rounded-t-16" />
          <h3 className="mt-56 font-bold text-center typo-large-title">
            Wow! You get early access to
            <br />
            <span className="text-theme-color-cabbage">Squads!</span>
          </h3>
          <h4 className="mt-4 text-center typo-title3">
            With Squads, you can stay up to date together as a group and discuss
            privately in one place.
          </h4>
        </Modal.Body>
        <Modal.Footer justify={Justify.Between}>
          <Button className="btn-tertiary" onClick={handleClose}>
            Close
          </Button>
          <Button
            className="btn-primary-cabbage"
            onClick={() => setShouldShowBetaModal(false)}
          >
            Create squad
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

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
