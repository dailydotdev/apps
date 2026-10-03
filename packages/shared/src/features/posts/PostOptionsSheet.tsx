import type { ReactElement } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { MenuItemProps } from '../../components/dropdown/common';
import {
  DropdownMenuItem,
  DropdownMenuOptions,
} from '../../components/dropdown/DropdownMenu';
import {
  ArrowIcon,
  BlockIcon,
  MenuIcon as DotsIcon,
} from '../../components/icons';
import { MenuIcon } from '../../components/MenuIcon';
import { IconSize } from '../../components/Icon';
import { motion } from '../../components/shell/constants';
import { groupPostOptions } from './postOptionGroups';

type Level = 'root' | 'not-interested' | 'more';

const Divider = (): ReactElement => (
  <div aria-hidden className="mx-4 my-1 h-px bg-border-subtlest-tertiary" />
);

// A row that opens a sub-level instead of closing the menu.
const LevelRow = ({
  icon,
  label,
  meta,
  onOpen,
}: {
  icon: ReactElement;
  label: string;
  meta?: string;
  onOpen: () => void;
}): ReactElement => (
  <DropdownMenuItem
    onSelect={(event: Event) => {
      event.preventDefault();
      onOpen();
    }}
  >
    <button
      type="button"
      role="menuitem"
      className="inline-flex flex-1 items-center gap-2"
    >
      {icon}
      <span className="min-w-0 flex-1 text-left">{label}</span>
      {meta && (
        <span className="min-w-0 max-w-[45%] truncate text-text-tertiary typo-footnote">
          {meta}
        </span>
      )}
      <ArrowIcon
        size={IconSize.Small}
        className="rotate-90 text-text-tertiary"
      />
    </button>
  </DropdownMenuItem>
);

const destructive = (option: MenuItemProps): MenuItemProps =>
  option.id === 'delete'
    ? {
        ...option,
        Wrapper: ({ children }) => (
          <span className="contents text-status-error">{children}</span>
        ),
      }
    : option;

// The post menu on a phone: one sheet with two levels. The sub-level slides
// in from the right over the first; its title row carries the back chevron
// that slides the first level back. Swipe down or the scrim closes the
// whole sheet from either level.
export const PostOptionsSheet = ({
  options,
}: {
  options: MenuItemProps[];
}): ReactElement => {
  const [level, setLevel] = useState<Level>('root');
  const rootRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const { primary, notInterested, owner, more } = groupPostOptions(options);

  // The sheet is as tall as the level on screen, not the taller of the two.
  useLayoutEffect(() => {
    const active = level === 'root' ? rootRef.current : subRef.current;
    if (!active) {
      return undefined;
    }
    const measure = () => setHeight(active.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(active);
    return () => observer.disconnect();
  }, [level]);
  const sub = level === 'not-interested' ? notInterested : more;
  const subTitle = level === 'not-interested' ? 'Not interested in' : 'More';
  const firstLevel = [...primary.filter((option) => option.id !== 'report')];
  const report = primary.find((option) => option.id === 'report');

  return (
    <div
      className="overflow-hidden motion-reduce:transition-none"
      style={{
        height,
        transition: `height ${motion.snap}ms ${motion.interaction}`,
      }}
    >
      <div
        className="flex w-[200%] items-start motion-reduce:transition-none"
        style={{
          transform: level === 'root' ? 'translateX(0)' : 'translateX(-50%)',
          transition: `transform ${motion.snap}ms ${motion.interaction}`,
        }}
      >
        <div
          ref={rootRef}
          className="flex w-1/2 flex-col"
          aria-hidden={level !== 'root'}
        >
          <DropdownMenuOptions options={firstLevel} />
          {notInterested.length > 0 && (
            <LevelRow
              icon={<MenuIcon Icon={BlockIcon} />}
              label="Not interested"
              onOpen={() => setLevel('not-interested')}
            />
          )}
          {report && <DropdownMenuOptions options={[report]} />}
          {owner.length > 0 && (
            <>
              <Divider />
              <DropdownMenuOptions options={owner.map(destructive)} />
            </>
          )}
          {more.length > 0 && (
            <>
              <Divider />
              <LevelRow
                icon={<MenuIcon Icon={DotsIcon} />}
                label="More"
                meta={more
                  .slice(0, 3)
                  .map((option) => option.label)
                  .join(', ')}
                onOpen={() => setLevel('more')}
              />
            </>
          )}
        </div>
        <div
          ref={subRef}
          className="flex w-1/2 flex-col"
          aria-hidden={level === 'root'}
        >
          <DropdownMenuItem
            onSelect={(event: Event) => {
              event.preventDefault();
              setLevel('root');
            }}
            className={classNames('font-bold')}
          >
            <button
              type="button"
              role="menuitem"
              aria-label="Back"
              className="inline-flex flex-1 items-center gap-2"
            >
              <ArrowIcon size={IconSize.Small} className="-rotate-90" />
              <span>{subTitle}</span>
            </button>
          </DropdownMenuItem>
          <Divider />
          <DropdownMenuOptions options={sub} />
        </div>
      </div>
    </div>
  );
};

export default PostOptionsSheet;
