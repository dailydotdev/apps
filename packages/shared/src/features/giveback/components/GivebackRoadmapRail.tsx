import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { ConnectorFill } from './givebackRoadmapTypes';

// A straight 3px track between nodes. Cleared segments are green; the live
// segment leading up to you fills in brand cabbage. One color per state, no
// gradients, so the rail reads as a single calm path.
export const Connector = ({ fill }: { fill: ConnectorFill }): ReactElement => (
  <div className="relative w-[3px] flex-1">
    <div className="absolute inset-0 bg-border-subtlest-tertiary" />
    {fill.type === 'full' && (
      <div className="absolute inset-0 bg-accent-avocado-default" />
    )}
    {fill.type === 'partial' && (
      <div
        className="absolute inset-x-0 top-0 bg-accent-cabbage-default"
        style={{ height: `${Math.round(fill.progress * 100)}%` }}
      />
    )}
  </div>
);

interface RailToggleProps {
  icon: ReactElement;
  label: string;
  onClick: () => void;
  connectorBelow?: ConnectorFill;
}

// A dashed node that expands/collapses a stretch of the rail (completed levels
// above, upcoming levels below), styled like a node so it sits on the same track.
export const RailToggle = ({
  icon,
  label,
  onClick,
  connectorBelow,
}: RailToggleProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full gap-4 text-left"
  >
    <div className="relative flex w-10 shrink-0 flex-col items-center">
      <span className="z-1 flex size-10 items-center justify-center rounded-14 border border-dashed border-border-subtlest-secondary bg-background-default text-text-tertiary transition-colors group-hover:border-accent-cabbage-default group-hover:text-accent-cabbage-default [&_svg]:size-4">
        {icon}
      </span>
      {connectorBelow && <Connector fill={connectorBelow} />}
    </div>
    <div
      className={classNames(
        'flex min-w-0 flex-1 flex-col',
        connectorBelow ? 'pb-8' : 'pb-1',
      )}
    >
      {/* Match the icon's height so the label centers against the node, not the
          full icon + connector run. */}
      <div className="flex h-10 items-center">
        <Typography
          type={TypographyType.Footnote}
          bold
          color={TypographyColor.Tertiary}
          className="transition-colors group-hover:text-text-primary"
        >
          {label}
        </Typography>
      </div>
    </div>
  </button>
);
