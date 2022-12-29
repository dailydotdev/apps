import React, { ReactElement } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import {
  ENABLE_NOTIFICATION_WINDOW_KEY,
  PermissionEvent,
} from '../../hooks/useNotificationPermissionPopup';
import useWindowEvents from '../../hooks/useWindowEvents';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';

function PushNotificationModal(
  modalProps: Omit<ModalProps, 'children'>,
): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { onTogglePermission } = useNotificationContext();
  const { onRequestClose } = modalProps;
  const enableNotifications = async () => {
    const permission = await onTogglePermission();
    trackEvent({
      event_name: AnalyticsEvent.ClickEnableNotification,
      extra: JSON.stringify({ origin: Origin.NewSourceModal, permission }),
    });

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
