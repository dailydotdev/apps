import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons/V';
import { PlayIcon } from '../../icons/Play';
import { IconSize } from '../../Icon';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import { socials } from '../../../lib/socialMedia';
import { Origin } from '../../../lib/log';
import SocialIconButton from '../socials/SocialIconButton';
import { SlackCtaButton } from '../../widgets/SlackCtaButton';

interface CardCoverCopySlackProps {
  post: Post;
  onShareToSlack: () => void;
  /** The image's margins and padding offset it from the wrapper, so callers match its box. */
  className?: string;
}

export function CardCoverCopySlack({
  post,
  onShareToSlack,
  className = 'inset-0 rounded-12',
}: CardCoverCopySlackProps): ReactElement {
  return (
    <div
      className={classNames(
        'absolute z-1 flex flex-col justify-end overflow-hidden',
        className,
      )}
    >
      {isVideoPost(post) && (
        <span className="flex min-h-0 flex-1 items-center justify-center bg-overlay-tertiary-black">
          <PlayIcon secondary size={IconSize.XXLarge} />
        </span>
      )}
      <div className="flex flex-col gap-2 rounded-t-12 border-t border-border-subtlest-tertiary bg-background-subtle p-2.5 @container">
        <div className="flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 font-bold typo-footnote">
            <VIcon
              size={IconSize.Size16}
              className="text-accent-avocado-default"
            />
            <span className="hidden min-w-0 flex-1 truncate @[12rem]:block">
              Copied
            </span>
          </span>
          <div className="flex gap-1">
            {socials.map((social) => (
              <SocialIconButton
                key={social}
                post={post}
                platform={social}
                size={ButtonSize.XSmall}
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
    </div>
  );
}
