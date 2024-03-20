import React, { AnchorHTMLAttributes, ReactElement } from 'react';
import { Squad } from '../../graphql/sources';
import classed from '../../lib/classed';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';

interface YourSquadItemProps {
  squad: Squad;
  anchorProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
}

const classes = 'flex flex-row items-center gap-4';
const Anchor = classed('a', classes);
const Span = classed('span', classes);

export function YourSquadItem({
  squad,
  anchorProps,
}: YourSquadItemProps): ReactElement {
  const Element = anchorProps ? Anchor : Span;

  return (
    <Element {...anchorProps}>
      <img
        src={squad.image}
        alt={`avatar of ${squad.handle}`}
        className="size-14 rounded-full"
      />
      <div className="flex flex-col typo-callout">
        <span className="font-bold">{squad.name}</span>
        <span className="text-text-tertiary">@{squad.handle}</span>
      </div>
      <ArrowIcon
        className="ml-auto rotate-90 text-text-tertiary"
        size={IconSize.Small}
      />
    </Element>
  );
}
