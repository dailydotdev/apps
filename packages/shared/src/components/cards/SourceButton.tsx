import React, { CSSProperties, ReactElement } from 'react';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { getSourcePermalink, Source } from '../../graphql/sources';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileImageSize } from '../ProfilePicture';

interface SourceButtonProps {
  source: Source;
  className?: string;
  style?: CSSProperties;
  size?: ProfileImageSize;
  tooltipPosition?: TooltipPosition;
}

export default function SourceButton({
  source,
  tooltipPosition = 'bottom',
  size = 'medium',
  ...props
}: SourceButtonProps): ReactElement {
  const link =
    source.permalink ?? getSourcePermalink(source.handle, source.type);
  return source ? (
    <LinkWithTooltip
      href={link}
      prefetch={false}
      tooltip={{ content: source.name, placement: tooltipPosition }}
    >
      <ProfileImageLink
        {...props}
        picture={{ size, rounded: 'full' }}
        user={{
          id: source.id,
          name: source.name,
          image: source.image,
          permalink: link,
          username: source.handle,
        }}
      />
    </LinkWithTooltip>
  ) : null;
}
