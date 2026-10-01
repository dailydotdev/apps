import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons/V';
import { IconSize } from '../../Icon';
import type { Post } from '../../../graphql/posts';
import { socials } from '../../../lib/socialMedia';
import { Origin } from '../../../lib/log';
import SocialIconButton from '../socials/SocialIconButton';
import { SlackCtaButton } from '../../widgets/SlackCtaButton';

interface CardCoverCopySlackProps {
  post: Post;
  onShareToSlack: () => void;
}

export function CardCoverCopySlack({
  post,
  onShareToSlack,
}: CardCoverCopySlackProps): ReactElement {
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
      <SlackCtaButton
        post={post}
        origin={Origin.CardCover}
        size={ButtonSize.Small}
        className="w-full"
        onAfterClick={onShareToSlack}
      />
    </div>
  );
}
