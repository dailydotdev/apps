import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { Source } from '../../graphql/sources';

interface SourceButtonProps {
  source: Source;
  className?: string;
  style?: CSSProperties;
  tooltipPosition?: TooltipPosition;
}

export default function SourceButton({
  source,
  className,
  style,
  tooltipPosition = 'bottom',
}: SourceButtonProps): ReactElement {
  return source ? (
    <LinkWithTooltip
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/${source.id}`}
      prefetch={false}
      tooltip={{ content: source.name, placement: tooltipPosition }}
    >
      <a className={classNames('flex cursor-pointer', className)} style={style}>
        <img
          src={source.image}
          alt={source.name}
          className="w-8 h-8 rounded-full bg-theme-bg-tertiary"
        />
      </a>
    </LinkWithTooltip>
  ) : null;
}
