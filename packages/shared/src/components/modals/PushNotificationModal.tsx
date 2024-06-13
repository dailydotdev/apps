import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';
import { Button, ButtonVariant } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import { NotificationPromptSource } from '../../lib/log';
import { usePushNotificationMutation } from '../../hooks/notifications';
import { useModalContext } from './common/types';

const DrawerImg = () => {
  const { isDrawer } = useModalContext();

  if (!isDrawer) {
    return null;
  }

  return (
    <img
      src={cloudinary.notifications.big}
      alt="A sample browser notification"
    />
  );
};

const ModalImg = () => {
  const { isDrawer } = useModalContext();

  if (isDrawer) {
    return null;
  }

  return (
    <img
      className="mx-auto my-14"
      src={cloudinary.notifications.big}
      alt="A sample browser notification"
    />
  );
};

function PushNotificationModal(modalProps: ModalProps): ReactElement {
  const { onRequestClose } = modalProps;
  const { onEnablePush } = usePushNotificationMutation({
    onPopupGranted: () => onRequestClose(null),
  });

  const enableNotifications = async () => {
    const isGranted = await onEnablePush(
      NotificationPromptSource.NewSourceModal,
    );

    if (isGranted) {
      onRequestClose?.(null);
    }
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
      isDrawerOnMobile
      drawerProps={{ className: { drawer: 'pb-4', close: 'mx-4' } }}
    >
      <Modal.Header />
      <DrawerImg />
      <Modal.Body className="gap-2 px-4 pb-0 pt-3">
        <Modal.Title className="!typo-large-title tablet:typo-title1">
          Enable Push Notifications
        </Modal.Title>
        <Modal.Text
          className={classNames('text-center typo-body tablet:typo-callout')}
        >
          Get notified of the status of your source submissions
        </Modal.Text>
        <ModalImg />
      </Modal.Body>
      <Button
        variant={ButtonVariant.Primary}
        onClick={enableNotifications}
        className="m-4 mb-0 mt-5 flex tablet:hidden"
      >
        Enable notifications
      </Button>
      <Modal.Footer justify={Justify.Center}>
        <Button variant={ButtonVariant.Primary} onClick={enableNotifications}>
          Enable notifications
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PushNotificationModal;
