import type { CSSProperties, ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { TooltipPosition } from '../../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../../tooltips/LinkWithTooltip';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import type { SourceTooltip } from '../../../graphql/sources';
import { useFeedPreviewMode } from '../../../hooks';
import SourceEntityCard from '../entity/SourceEntityCard';
import SquadEntityCard from '../entity/SquadEntityCard';
import { Origin } from '../../../lib/log';

interface SourceButtonProps {
  source: SourceTooltip;
  className?: string;
  style?: CSSProperties;
  size?: ProfileImageSize;
  pureTextTooltip?: boolean;
  tooltipPosition?: TooltipPosition;
}

export default function SourceButton({
  source,
  tooltipPosition = 'top',
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

  return source ? (
    <LinkWithTooltip
      href={source.permalink}
      prefetch={false}
      tooltip={{
        interactive: !pureTextTooltip,
        container: !pureTextTooltip ? { bgClassName: null } : undefined,
        content: tooltipContent,
        placement: tooltipPosition,
        appendTo: globalThis?.document.body,
      }}
    >
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
    </LinkWithTooltip>
  ) : null;
}
