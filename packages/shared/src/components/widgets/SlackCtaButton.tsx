import type { ReactElement } from 'react';
import React from 'react';
import { Button } from '../buttons/Button';
import type { ButtonSize } from '../buttons/common';
import { ButtonVariant } from '../buttons/common';
import { SlackIcon } from '../icons/Slack';
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import { wrapStopPropagation } from '../../lib/func';
import { useSlackShareButton } from '../../hooks/integrations/slack/useSlackShareButton';

export type SlackCtaButtonProps = {
  post: Post;
  origin?: Origin;
  /** The surface the button sits in, when `origin` names the control. */
  placement?: Origin;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  onAfterClick?: () => void;
};

export const SlackCtaButton = ({
  post,
  origin,
  placement,
  size,
  variant = ButtonVariant.Primary,
  className,
  onAfterClick,
}: SlackCtaButtonProps): ReactElement => {
  const { onClick, isLoading, label } = useSlackShareButton({
    post,
    origin,
    placement,
  });

  return (
    <Button
      className={className}
      size={size}
      variant={variant}
      icon={<SlackIcon secondary />}
      loading={isLoading}
      disabled={isLoading}
      onClick={wrapStopPropagation(() => {
        onClick();
        onAfterClick?.();
      })}
    >
      {label}
    </Button>
  );
};
