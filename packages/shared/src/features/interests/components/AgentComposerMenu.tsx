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

export type AgentMenuItem = {
  id: string;
  icon: ReactNode;
  name: string;
  /** The argument the name takes, shown after it the way `/write [format]` is. */
  hint?: string;
  description?: string;
};

/**
 * The list that opens above the field for `/` and for `@`.
 *
 * Not a dropdown: a real menu would take focus off the textarea, and the whole
 * point is that you keep typing to filter it. So it never takes focus, the
 * arrow keys are handled by the field, and the pointer only ever previews the
 * row it is over.
 *
 * Deliberately narrow, and names only. What each one does is a tooltip on the
 * row rather than a second column, so the list stays something you glance at.
 */
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

  // Arrowing past either end of the visible window has to bring the row with
  // it; the list scrolls but never receives focus, so nothing else would.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className="agent-menu-in absolute bottom-full left-0 z-popup mb-2 w-64 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-popover shadow-3">
      {items.length ? (
        <ul
          role="listbox"
          aria-label={label}
          className="max-h-56 overflow-y-auto p-1"
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              ref={index === activeIndex ? activeRef : undefined}
            >
              <Tooltip
                side="right"
                sideOffset={12}
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
                  role="option"
                  aria-selected={index === activeIndex}
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
