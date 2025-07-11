import type { ReactElement } from 'react';
import React from 'react';
import { slackIntegration } from '../../../lib/constants';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { Modal } from '../common/Modal';
import { Image } from '../../image/Image';

export type SlackIntegrationIntroBodyProps = {
  title?: string;
  description?: string;
  headerImg: string;
  onConnect: () => void;
};

export const SlackIntegrationIntroBody = ({
  title = 'Squad + Slack = 🔥',
  description = 'Get instant updates in Slack and keep the conversation going!',
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
        {title}
      </Typography>
      <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
        {description}
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
