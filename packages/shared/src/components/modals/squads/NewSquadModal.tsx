import React, { ReactElement, useCallback } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ModalSize } from '../common/types';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useSquadNavigation } from '../../../hooks';
import { webappUrl } from '../../../lib/constants';
import { useSlack } from '../../../hooks/integrations/slack/useSlack';
import { Image } from '../../image/Image';
import { cloudinary } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { SlackIcon } from '../../icons';
import OrDivider from '../../auth/OrDivider';
import { ModalClose } from '../common/ModalClose';
import { LogEvent, Origin } from '../../../lib/log';
import { UserIntegrationType } from '../../../graphql/integrations';
import { useLogContext } from '../../../contexts/LogContext';

export default function NewSquadModal(props: ModalProps): ReactElement {
  const { onRequestClose } = props;
  const slack = useSlack();
  const { logEvent } = useLogContext();

  const { newSquadUrl } = useSquadNavigation();
  const onConnectSlack = useCallback(() => {
    logEvent({
      event_name: LogEvent.StartAddingWorkspace,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({
        origin: Origin.NewSquadModal,
      }),
    });

    slack.connect({
      redirectPath: `${webappUrl}squads/new?fs=true`,
    });
  }, [logEvent, slack]);

  return (
    <Modal {...props} size={ModalSize.Small} isDrawerOnMobile>
      <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
        <ModalClose
          className="right-8 top-8"
          onClick={onRequestClose}
          variant={ButtonVariant.Primary}
        />
        <Image
          className="rounded-16"
          src={cloudinary.squads.createSquad.biggerThanMobile}
          alt="Slack integration"
        />
        <Typography
          type={TypographyType.Title1}
          bold
          color={TypographyColor.Primary}
        >
          Create new Squad
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Create a group where you can learn and interact with other developers
          around topics that matter
        </Typography>
        <Button
          variant={ButtonVariant.Primary}
          onClick={onConnectSlack}
          icon={<SlackIcon />}
          className="w-full"
        >
          Quick start with Slack
        </Button>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
        >
          Keep your team updated with the latest posts
        </Typography>
        <OrDivider
          className={{
            container: 'w-full',
            text: 'text-text-secondary',
            border: 'bg-border-subtlest-secondary',
          }}
        />
        <Button
          tag="a"
          href={newSquadUrl}
          variant={ButtonVariant.Primary}
          className="w-full"
        >
          Create manually
        </Button>
      </Modal.Body>
    </Modal>
  );
}
