import React, { ReactElement, useCallback } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ModalSize } from '../common/types';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useSquadNavigation } from '../../../hooks';
import { webappUrl } from '../../../lib/constants';
import { useSlack } from '../../../hooks/integrations/slack/useSlack';

export default function NewSquadModal(props: ModalProps): ReactElement {
  const modalProps: ModalProps = {
    ...props,
  };

  const slack = useSlack();

  const { newSquadUrl } = useSquadNavigation();
  const onConnectSlack = useCallback(() => {
    slack.connect({
      redirectPath: `${webappUrl}squads/new?fs=true`,
    });
  }, [slack]);

  return (
    <Modal {...modalProps} size={ModalSize.Small} isDrawerOnMobile>
      <Modal.Header title="Create new Squad" />
      <Modal.Body className="gap-4">
        <Modal.Text>
          Have an idea for a new source? Insert its link below to add it to the
          feed.
        </Modal.Text>
        <Button variant={ButtonVariant.Primary} onClick={onConnectSlack}>
          Create with Slack
        </Button>
        <Button tag="a" href={newSquadUrl} variant={ButtonVariant.Primary}>
          Create Manually
        </Button>
      </Modal.Body>
    </Modal>
  );
}
