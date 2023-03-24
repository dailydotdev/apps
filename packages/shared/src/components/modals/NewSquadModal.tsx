import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Modal, ModalProps } from './common/Modal';
import { createSquad, SquadForm } from '../../graphql/squads';
import { ModalState, quitSquadModal } from '../squads/utils';
import { usePrompt } from '../../hooks/usePrompt';
import { useBoot } from '../../hooks/useBoot';
import { AnalyticsEvent, Origin, TargetType } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { TutorialKey, useTutorial } from '../../hooks/useTutorial';
import { SquadDetails } from '../squads/Details';
import { cloudinary } from '../../lib/image';
import { useToastNotification } from '../../hooks/useToastNotification';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

export type NewSquadModalProps = Pick<ModalProps, 'isOpen'> & {
  onRequestClose: () => void;
  origin: Origin;
};

let activeView;
function NewSquadModal({
  onRequestClose,
  isOpen,
  origin,
}: NewSquadModalProps): ReactElement {
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { addSquad } = useBoot();
  const [form] = useState<Partial<SquadForm>>({});

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.CreateSquadPopup,
      extra: JSON.stringify({ origin }),
    });
  }, []);

  const onCreate = async (e, newSquadForm: SquadForm) => {
    e.preventDefault();
    const data = { ...newSquadForm } as SquadForm;
    try {
      const newSquad = await createSquad({ ...data });
      if (!newSquad) return;
      trackEvent({
        event_name: AnalyticsEvent.CompleteSquadCreation,
      });
      addSquad(newSquad);
      await router.replace(newSquad.permalink);
      onRequestClose();
    } catch (err) {
      displayToast(DEFAULT_ERROR);
    }
  };

  const newSquadTutorial = useTutorial({
    key: TutorialKey.SeenNewSquadTooltip,
  });

  const handleClose = async () => {
    if (activeView === ModalState.Ready) return onRequestClose();

    const shouldQuit = await showPrompt(quitSquadModal);
    if (shouldQuit) {
      onRequestClose();

      if (!newSquadTutorial.isCompleted) {
        newSquadTutorial.activate();
      }
    }
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      key="form-modal"
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={handleClose}
    >
      <img
        src={cloudinary.squads.createSquad}
        alt="Create your Squad"
        className="h-60"
      />
      <SquadDetails
        form={form}
        onRequestClose={handleClose}
        onSubmit={onCreate}
        createMode
      />
    </Modal>
  );
}

export default NewSquadModal;
