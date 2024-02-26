import React, { ReactElement } from 'react';
import {
  ENABLE_NOTIFICATION_WINDOW_KEY,
  PermissionEvent,
} from '../../hooks/useNotificationPermissionPopup';
import { cloudinary } from '../../lib/image';
import { Button, ButtonVariant } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import { NotificationPromptSource } from '../../lib/analytics';
import { useEventListener } from '../../hooks';
import { usePushNotificationMutation } from '../../hooks/notifications';

function PushNotificationModal(modalProps: ModalProps): ReactElement {
  const { onRequestClose } = modalProps;
  const { onEnablePush } = usePushNotificationMutation();

  const enableNotifications = async () => {
    const isGranted = await onEnablePush(
      NotificationPromptSource.NewSourceModal,
    );

    if (isGranted) {
      onRequestClose?.(null);
    }
  };

  useEventListener(globalThis, 'message', async (e) => {
    if (e.data?.eventKey !== ENABLE_NOTIFICATION_WINDOW_KEY) {
      return;
    }

    const { permission }: PermissionEvent = e?.data ?? {};

    if (!permission || permission !== 'granted') {
      return;
    }

    onRequestClose(null);
  });

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
    >
      <Modal.Header />
      <Modal.Body>
        <Modal.Title>Enable Push Notifications</Modal.Title>
        <Modal.Text className="text-center">
          Get notified of the status of your source submissions
        </Modal.Text>
        <img
          className="mx-auto my-14"
          src={cloudinary.notifications.big}
          alt="A sample browser notification"
        />
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>
        <Button variant={ButtonVariant.Primary} onClick={enableNotifications}>
          Enable notifications
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PushNotificationModal;
