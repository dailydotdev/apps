import React, { CSSProperties, ReactElement } from 'react';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Source } from '../../graphql/sources';
import { useFeedPreviewMode } from '../../hooks';

interface SourceButtonProps {
  source: Pick<Source, 'id' | 'name' | 'handle' | 'image' | 'permalink'>;
  className?: string;
  style?: CSSProperties;
  size?: ProfileImageSize;
  tooltipPosition?: TooltipPosition;
}

export default function SourceButton({
  source,
  tooltipPosition = 'bottom',
  size = ProfileImageSize.Medium,
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
      tooltip={{ content: source.name, placement: tooltipPosition }}
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
