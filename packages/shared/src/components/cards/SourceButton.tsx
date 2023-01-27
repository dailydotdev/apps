import React, { CSSProperties, ReactElement } from 'react';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { getSourcePermalink, Source } from '../../graphql/sources';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileImageSize } from '../ProfilePicture';

interface SourceButtonProps {
  source: Source;
  link?: string;
  className?: string;
  style?: CSSProperties;
  size?: ProfileImageSize;
  tooltipPosition?: TooltipPosition;
}

export default function SourceButton({
  source,
  link,
  tooltipPosition = 'bottom',
  size = 'medium',
  ...props
}: SourceButtonProps): ReactElement {
  return source ? (
    <LinkWithTooltip
      href={link || getSourcePermalink(source.id)}
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
          permalink: link || getSourcePermalink(source.id),
          username: source.handle,
        }}
      />
    </LinkWithTooltip>
  ) : null;
}
