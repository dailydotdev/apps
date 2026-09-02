import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { Tooltip } from '../../../components/tooltip/Tooltip';

export const composerMenuId = 'agent-composer-menu';
export const composerOptionId = (id: string): string =>
  `agent-composer-option-${id}`;

export type AgentMenuItem = {
  id: string;
  icon: ReactNode;
  name: string;
  hint?: string;
  description?: string;
};

export const AgentComposerMenu = ({
  label,
  items,
  activeIndex,
  emptyLabel,
  onHover,
  onPick,
}: {
  label: string;
  items: AgentMenuItem[];
  activeIndex: number;
  emptyLabel: string;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
}): ReactElement => {
  const activeRef = useRef<HTMLLIElement>(null);

  // The list never receives focus, so nothing else scrolls the active row in.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className="agent-menu-in absolute bottom-full left-0 z-popup mb-2 w-64 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-popover shadow-3">
      {items.length ? (
        <ul
          id={composerMenuId}
          role="listbox"
          aria-label={label}
          className="agent-scroll max-h-56 overflow-y-auto p-1"
        >
          {items.map((item, index) => (
            // The option must be the `<li>` itself: nesting it inside a plain
            // one makes a screen reader announce a list item, not an option.
            <li
              key={item.id}
              id={composerOptionId(item.id)}
              role="option"
              aria-selected={index === activeIndex}
              ref={index === activeIndex ? activeRef : undefined}
            >
              <Tooltip
                side="right"
                sideOffset={12}
                // Undoes the app-wide `flex-shrink: 0`, without which a two-line
                // block runs out past the surface's rounding.
                className="[&>*]:shrink"
                content={
                  <FlexCol className="gap-0.5">
                    <Typography type={TypographyType.Caption1} bold>
                      {item.name} {item.hint}
                    </Typography>
                    {item.description && (
                      <Typography
                        type={TypographyType.Caption2}
                        color={TypographyColor.Tertiary}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </FlexCol>
                }
              >
                <button
                  type="button"
                  // An option's children are flat text, so a tab stop in here is
                  // one a screen reader never announces.
                  tabIndex={-1}
                  // Keeps the caret in the field: without this the field blurs
                  // on press and the menu closes before the click can land.
                  onMouseDown={(event: React.MouseEvent) =>
                    event.preventDefault()
                  }
                  // Move, not enter: a pointer resting over the list would
                  // otherwise fight every arrow key.
                  onMouseMove={() => onHover(index)}
                  onClick={() => onPick(index)}
                  className={classNames(
                    'flex w-full items-center gap-2 rounded-8 px-2 py-1 text-left transition-colors',
                    index === activeIndex && 'bg-surface-float',
                  )}
                >
                  <span
                    className={classNames(
                      'shrink-0',
                      index === activeIndex
                        ? 'text-text-primary'
                        : 'text-text-quaternary',
                    )}
                  >
                    {item.icon}
                  </span>
                  <Typography
                    type={TypographyType.Caption1}
                    bold
                    className="min-w-0 flex-1 truncate"
                  >
                    {item.name}
                  </Typography>
                  {item.hint && (
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Quaternary}
                      className="shrink-0"
                    >
                      {item.hint}
                    </Typography>
                  )}
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      ) : (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="px-3 py-2.5"
        >
          {emptyLabel}
        </Typography>
      )}
    </div>
  );
};
