import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';
import { Button, ButtonVariant } from '../buttons/Button';
import { Justify } from '../utilities';
import { Modal, ModalProps } from './common/Modal';
import { NotificationPromptSource } from '../../lib/analytics';
import { usePushNotificationMutation } from '../../hooks/notifications';
import { useViewSize, ViewSize } from '../../hooks';
import { Drawer } from '../drawers';
import ConditionalWrapper from '../ConditionalWrapper';

function PushNotificationModal(modalProps: ModalProps): ReactElement {
  const { onRequestClose } = modalProps;
  const isMobile = useViewSize(ViewSize.MobileL);
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

  const img = (
    <img
      className={!isMobile && 'mx-auto my-14'}
      src={cloudinary.notifications.big}
      alt="A sample browser notification"
    />
  );
  const enable = (
    <Button
      variant={ButtonVariant.Primary}
      onClick={enableNotifications}
      className={isMobile && 'mt-6'}
    >
      Enable notifications
    </Button>
  );
  const content = (
    <ConditionalWrapper
      condition={isMobile}
      wrapper={(component) => (
        <div className="flex flex-col px-4">
          {component}
          {enable}
        </div>
      )}
    >
      <Modal.Title className={isMobile && 'mt-3 !typo-large-title'}>
        Enable Push Notifications
      </Modal.Title>
      <Modal.Text
        className={classNames(isMobile && 'typo-body', 'text-center')}
      >
        Get notified of the status of your source submissions
      </Modal.Text>
    </ConditionalWrapper>
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen
        displayCloseButton
        className={{ drawer: 'pb-4' }}
        onClose={() => onRequestClose(null)}
      >
        {img}
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
    >
      {!isMobile && <Modal.Header />}
      <Modal.Body className="gap-3 !p-0">
        {content}
        {img}
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>{enable}</Modal.Footer>
    </Modal>
  );
}

export default PushNotificationModal;
