import React, { ReactElement } from 'react';

import { slackIntegration } from '../../../lib/constants';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Image } from '../../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Modal } from '../common/Modal';

export type SlackIntegrationIntroBodyProps = {
  headerImg: string;
  onConnect: () => void;
};

export const SlackIntegrationIntroBody = ({
  headerImg,
  onConnect,
}: SlackIntegrationIntroBodyProps): ReactElement => {
  return (
    <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
      <Image className="rounded-16" src={headerImg} alt="Slack integration" />
      <Typography
        type={TypographyType.Title1}
        bold
        color={TypographyColor.Primary}
      >
        Squad + Slack = 🔥
      </Typography>
      <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
        Get instant updates in Slack and keep the conversation going!
      </Typography>
      <Button
        className="w-full"
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        onClick={onConnect}
      >
        Connect to Slack
      </Button>
      <Button
        className="w-full"
        tag="a"
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Large}
        href={slackIntegration}
        target="_blank"
      >
        Read more ➔
      </Button>
    </Modal.Body>
  );
};
