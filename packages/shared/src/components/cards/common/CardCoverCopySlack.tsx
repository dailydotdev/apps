import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { SlackIcon } from '../../icons/Slack';
import { VIcon } from '../../icons/V';
import { IconSize } from '../../Icon';
import type { Post } from '../../../graphql/posts';
import { socials } from '../../../lib/socialMedia';
import { Origin } from '../../../lib/log';
import { wrapStopPropagation } from '../../../lib/func';
import SocialIconButton from '../socials/SocialIconButton';
import { useSlackShareButton } from '../../../hooks/integrations/slack/useSlackShareButton';

interface CardCoverCopySlackProps {
  post: Post;
  onShareToSlack: () => void;
}

export function CardCoverCopySlack({
  post,
  onShareToSlack,
}: CardCoverCopySlackProps): ReactElement {
  const { onClick } = useSlackShareButton({ post, origin: Origin.CardCover });

  return (
    <div className="absolute inset-x-0 bottom-0 z-1 flex flex-col gap-2 rounded-t-12 border-t border-border-subtlest-tertiary bg-background-subtle p-2.5 shadow-2">
      <div className="flex items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center gap-1.5 font-bold typo-footnote">
          <VIcon
            size={IconSize.Size16}
            className="text-accent-avocado-default"
          />
          <span className="truncate">Copied</span>
        </span>
        <div className="flex gap-1">
          {socials.map((social) => (
            <SocialIconButton
              key={social}
              post={post}
              platform={social}
              size={ButtonSize.XSmall}
              origin={Origin.CardCover}
            />
          ))}
        </div>
      </div>
      <Button
        className="w-full"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={<SlackIcon secondary />}
        onClick={wrapStopPropagation(() => {
          onClick();
          onShareToSlack();
        })}
      >
        Send to Slack
      </Button>
    </div>
  );
}
