import React, { CSSProperties, ReactElement } from 'react';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { getSourcePermalink, Source } from '../../graphql/sources';
import { ProfileImageLink } from '../profile/ProfileImageLink';

interface SourceButtonProps {
  source: Source;
  className?: string;
  style?: CSSProperties;
  tooltipPosition?: TooltipPosition;
}

export default function SourceButton({
  source,
  tooltipPosition = 'bottom',
  ...props
}: SourceButtonProps): ReactElement {
  return source ? (
    <LinkWithTooltip
      href={getSourcePermalink(source.id)}
      prefetch={false}
      tooltip={{ content: source.name, placement: tooltipPosition }}
    >
      <ProfileImageLink
        {...props}
        picture={{ size: 'medium', rounded: 'full' }}
        user={{
          id: source.id,
          name: source.name,
          image: source.image,
          permalink: getSourcePermalink(source.id),
          username: source.id,
        }}
      />
    </LinkWithTooltip>
  ) : null;
}
