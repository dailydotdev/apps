import type { ReactElement } from 'react';
import React from 'react';
import { SocialShareButton } from './SocialShareButton';
import { SlackIcon } from '../icons';
import type { ButtonSize } from '../buttons/common';
import { ButtonVariant } from '../buttons/common';
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import { useSlackShareButton } from '../../hooks/integrations/slack/useSlackShareButton';

export type SlackShareButtonProps = {
  post: Post;
  origin?: Origin;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export const SlackShareButton = ({
  post,
  origin,
  size,
  variant = ButtonVariant.Primary,
}: SlackShareButtonProps): ReactElement | null => {
  const { isEnabled, onClick } = useSlackShareButton({ post, origin });

  if (!isEnabled) {
    return null;
  }

  return (
    <SocialShareButton
      icon={<SlackIcon />}
      size={size}
      variant={variant}
      onClick={onClick}
      label="Slack"
    />
  );
};
