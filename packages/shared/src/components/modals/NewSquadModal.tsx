import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Modal } from './common/Modal';
import { Squad, SquadForm } from '../../graphql/squads';
import { SquadSelectArticle } from '../squads/SelectArticle';
import { SquadReady } from '../squads/Ready';
import {
  ModalState,
  modalStateToScreenValue,
  quitSquadModal,
  SquadStateProps,
} from '../squads/utils';
import { usePrompt } from '../../hooks/usePrompt';
import { ModalStep } from './common/types';
import { SteppedSquadComment } from '../squads/SteppedComment';
import { SteppedSquadDetails } from '../squads/SteppedDetails';
import { Post } from '../../graphql/posts';
import { useBoot } from '../../hooks/useBoot';
import SquadAccessIntro from '../sidebar/SquadAccessIntro';
import { AnalyticsEvent, Origin, TargetType } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';

export type NewSquadModalProps = {
  onRequestClose: () => void;
  isOpen: boolean;
  origin: Origin;
  post?: Post;
  shouldShowIntro?: boolean;
};

let activeView;
function NewSquadModal({
  onRequestClose,
  isOpen,
  post,
  shouldShowIntro = false,
  origin,
}: NewSquadModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [squad, setSquad] = useState<Squad>();
  const { showPrompt } = usePrompt();
  const { addSquad } = useBoot();
  const [shouldShowBetaModal, setShouldShowBetaModal] =
    useState(shouldShowIntro);
  const [form, setForm] = useState<Partial<SquadForm>>({ post: { post } });

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.CreateSquadPopup,
      extra: JSON.stringify({ origin }),
    });
  }, []);

  const onNext = async (squadForm?: SquadForm) =>
    squadForm && setForm(squadForm);
  const onCreate = (newSquad: Squad) => {
    trackEvent({
      event_name: AnalyticsEvent.CompleteSquadCreation,
    });
    addSquad(newSquad);
    setSquad(newSquad);
  };
  const stateProps: SquadStateProps = {
    form,
    setForm,
    onNext,
    onRequestClose,
  };

  const onBetaNext = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickSquadCreationNext,
      extra: JSON.stringify({ screen_value: 'intro' }),
    });
    setShouldShowBetaModal(false);
  };

  const onBetaBack = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickSquadCreationBack,
      extra: JSON.stringify({
        screen_value: modalStateToScreenValue[ModalState.Details],
      }),
    });
    setShouldShowBetaModal(true);
  };

  const modalSteps: ModalStep[] = [
    {
      key: ModalState.Details,
      screen_value: modalStateToScreenValue[ModalState.Details],
      title: (
        <>
          {shouldShowIntro && <Modal.Header.StepsButton onClick={onBetaBack} />}
          <Modal.Header.Subtitle>{ModalState.Details}</Modal.Header.Subtitle>
        </>
      ),
    },
    !post
      ? {
          key: ModalState.SelectArticle,
          screen_value: modalStateToScreenValue[ModalState.SelectArticle],
        }
      : undefined,
    {
      key: ModalState.WriteComment,
      screen_value: modalStateToScreenValue[ModalState.WriteComment],
    },
    {
      key: ModalState.Ready,
      screen_value: modalStateToScreenValue[ModalState.Ready],
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
        <SquadAccessIntro onClose={handleClose} onCreateSquad={onBetaNext} />
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
      onTrackNext={AnalyticsEvent.ClickSquadCreationNext}
      onTrackPrev={AnalyticsEvent.ClickSquadCreationBack}
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
