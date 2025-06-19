import type { CSSProperties, ReactElement } from 'react';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { HoverCardContentProps } from '@radix-ui/react-hover-card';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import type { SourceTooltip } from '../../../graphql/sources';
import { useFeedPreviewMode } from '../../../hooks';
import { Origin } from '../../../lib/log';
import EntityCardSkeleton from '../entity/EntityCardSkeleton';
import HoverCard from './HoverCard';

const SquadEntityCard = dynamic(
  /* webpackChunkName: "squadEntityCard" */ () =>
    import('../entity/SquadEntityCard'),
  {
    ssr: false,
    loading: () => <EntityCardSkeleton />,
  },
);

const SourceEntityCard = dynamic(
  /* webpackChunkName: "sourceEntityCard" */ () =>
    import('../entity/SourceEntityCard'),
  {
    ssr: false,
    loading: () => <EntityCardSkeleton />,
  },
);

interface SourceButtonProps {
  source: SourceTooltip;
  className?: string;
  style?: CSSProperties;
  size?: ProfileImageSize;
  pureTextTooltip?: boolean;
  tooltipPosition?: HoverCardContentProps['side'];
}

export default function SourceButton({
  source,
  tooltipPosition = 'bottom',
  pureTextTooltip = false,
  size = ProfileImageSize.Medium,
  className,
  ...props
}: SourceButtonProps): ReactElement {
  const isFeedPreview = useFeedPreviewMode();

  const tooltipContent = useMemo(() => {
    if (pureTextTooltip) {
      return source.name;
    }

    return source.type === 'squad' ? (
      <SquadEntityCard handle={source.handle} origin={Origin.Feed} />
    ) : (
      <SourceEntityCard source={source} />
    );
  }, [pureTextTooltip, source]);

  if (source && isFeedPreview) {
    return (
      <ProfilePicture
        {...props}
        className={className}
        size={size}
        rounded="full"
        user={{
          id: source.id,
          image: source.image,
          username: source.handle,
        }}
        nativeLazyLoading
      />
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
          picture={{ size, rounded: 'full' }}
          user={{
            id: source.id,
            image: source.image,
            permalink: source.permalink,
            username: source.handle,
          }}
        />
      }
    >
      {tooltipContent}
    </HoverCard>
  );
}
