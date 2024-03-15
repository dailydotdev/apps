import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';
import { Button, ButtonVariant } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import { NotificationPromptSource } from '../../lib/analytics';
import { usePushNotificationMutation } from '../../hooks/notifications';

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
      <img
        className="flex tablet:hidden"
        src={cloudinary.notifications.big}
        alt="A sample browser notification"
      />
      <Modal.Body className="gap-2 px-4 pb-0 pt-3">
        <Modal.Title className="!typo-large-title tablet:typo-title1">
          Enable Push Notifications
        </Modal.Title>
        <Modal.Text
          className={classNames('text-center typo-body tablet:typo-callout')}
        >
          Get notified of the status of your source submissions
        </Modal.Text>
        <img
          className="mx-auto my-14 hidden tablet:flex"
          src={cloudinary.notifications.big}
          alt="A sample browser notification"
        />
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
