import React, { CSSProperties, ReactElement } from 'react';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileImageSize } from '../ProfilePicture';
import { Source } from '../../graphql/sources';

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
  size = 'medium',
  ...props
}: SourceButtonProps): ReactElement {
  return source ? (
    <LinkWithTooltip
      href={source.permalink}
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
          permalink: source.permalink,
          username: source.handle,
        }}
      />
    </LinkWithTooltip>
  ) : null;
}
