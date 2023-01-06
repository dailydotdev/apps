import React, { ReactElement } from 'react';
import {
  NotificationPromptSource,
  useEnableNotification,
} from '../../hooks/useEnableNotification';
import {
  ENABLE_NOTIFICATION_WINDOW_KEY,
  PermissionEvent,
} from '../../hooks/useNotificationPermissionPopup';
import useWindowEvents from '../../hooks/useWindowEvents';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';

function PushNotificationModal(modalProps: ModalProps): ReactElement {
  const { onRequestClose } = modalProps;
  const onTogglePermission = useEnableNotification(
    NotificationPromptSource.NewSourceModal,
  );
  const enableNotifications = async () => {
    const permission = await onTogglePermission();

    if (permission === 'granted') {
      onRequestClose?.(null);
    }
  };

  useWindowEvents<PermissionEvent>(
    'message',
    ENABLE_NOTIFICATION_WINDOW_KEY,
    (e) => {
      const { permission } = e?.data ?? {};

      if (!permission || permission !== 'granted') {
        return;
      }

      onRequestClose(null);
    },
  );

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
    >
      <Modal.Header />
      <Modal.Body>
        <Modal.Title>Push notifications</Modal.Title>
        <Modal.Text className="text-center">
          Get notified on the status of your source submissions in real time
        </Modal.Text>
        <img
          className="my-14 mx-auto"
          src={cloudinary.notifications.big}
          alt="A sample browser notification"
        />
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>
        <Button className="btn-primary" onClick={enableNotifications}>
          Enable notifications
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PushNotificationModal;
