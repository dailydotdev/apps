import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type { HoverCardContentProps } from '@radix-ui/react-hover-card';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import type { SourceTooltip } from '../../../graphql/sources';
import { useFeedPreviewMode } from '../../../hooks';
import { Origin } from '../../../lib/log';
import HoverCard from './HoverCard';
import { Tooltip } from '../../tooltip/Tooltip';

const SquadEntityCard = dynamic(
  /* webpackChunkName: "squadEntityCard" */ () =>
    import('../entity/SquadEntityCard'),
);

const SourceEntityCard = dynamic(
  /* webpackChunkName: "sourceEntityCard" */ () =>
    import('../entity/SourceEntityCard'),
);

interface SourceButtonProps {
  source: SourceTooltip;
  className?: string;
  style?: CSSProperties;
  size?: ProfileImageSize;
  // Defaults to a circle; callers (e.g. notifications) can pass a size token to
  // render a rounded square instead.
  rounded?: ProfileImageSize | 'full';
  pureTextTooltip?: boolean;
  tooltipPosition?: HoverCardContentProps['side'];
}

export default function SourceButton({
  source,
  tooltipPosition = 'bottom',
  pureTextTooltip = false,
  size = ProfileImageSize.Medium,
  rounded = 'full',
  className,
  ...props
}: SourceButtonProps): ReactElement {
  const isFeedPreview = useFeedPreviewMode();

  if (source && isFeedPreview) {
    return (
      <ProfilePicture
        {...props}
        className={className}
        size={size}
        rounded={rounded}
        user={{
          id: source.id ?? source.handle,
          image: source.image,
          username: source.handle,
        }}
        nativeLazyLoading
      />
    );
  }

  if (pureTextTooltip) {
    return (
      <Tooltip content={source.name} side="bottom">
        <ProfileImageLink
          {...props}
          className={className}
          picture={{ size, rounded }}
          user={{
            id: source.id ?? source.handle,
            image: source.image,
            permalink: source.permalink,
            username: source.handle,
          }}
        />
      </Tooltip>
    );
  }

  return (
    <HoverCard
      appendTo={globalThis?.document?.body}
      side={tooltipPosition}
      align="start"
      sideOffset={10}
      trigger={
        <ProfileImageLink
          {...props}
          className={className}
          picture={{ size, rounded }}
          user={{
            id: source.id ?? source.handle,
            image: source.image,
            permalink: source.permalink,
            username: source.handle,
          }}
        />
      }
    >
      {source.type === 'squad' ? (
        <SquadEntityCard handle={source.handle} origin={Origin.Feed} />
      ) : (
        <SourceEntityCard source={source} />
      )}
    </HoverCard>
  );
}
