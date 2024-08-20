import React, {
  AnchorHTMLAttributes,
  HTMLAttributes,
  MutableRefObject,
  ReactElement,
} from 'react';
import { Squad } from '../../graphql/sources';
import classed from '../../lib/classed';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';

interface YourSquadItemProps {
  squad: Squad;
  elementProps?:
    | HTMLAttributes<HTMLSpanElement>
    | AnchorHTMLAttributes<HTMLAnchorElement>;
}

const classes = 'flex flex-row items-center gap-4';
const Anchor = classed('a', classes);
const Span = classed('span', classes);

function Component(
  { squad, elementProps }: YourSquadItemProps,
  ref: MutableRefObject<HTMLElement>,
): ReactElement {
  const Element = elementProps && 'href' in elementProps ? Anchor : Span;

  return (
    <Element ref={ref} {...elementProps}>
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

export const YourSquadItem = React.forwardRef(Component);
