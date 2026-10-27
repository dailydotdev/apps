import type { ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import usePersistentContext from '../../hooks/usePersistentContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  algorithms,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
} from '../layout/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { ArrowIcon } from '../icons/Arrow';
import { FilterIcon } from '../icons/Filter';
import { VIcon } from '../icons/V';
import { IconSize } from '../Icon';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import { SheetChoice } from '../shell/ShellRow';
import { useFeedSettingsAction } from '../filters/MyFeedHeading';

export interface ForYouSort {
  canSort: boolean;
  selected: number;
  onSelect: (index: number) => void;
}

/** The feed's sort, held where the sort dropdown has always kept it. */
export const useForYouSort = (onChange?: () => void): ForYouSort => {
  const { sortingEnabled } = useSettingsContext();
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  const onSelect = useCallback(
    (index: number) => {
      if (index !== selectedAlgo) {
        setSelectedAlgo(index).catch(() => undefined);
        onChange?.();
      }
    },
    [onChange, selectedAlgo, setSelectedAlgo],
  );

  return {
    canSort: !!sortingEnabled,
    selected: sortingEnabled ? selectedAlgo : DEFAULT_ALGORITHM_INDEX,
    onSelect,
  };
};

export const forYouChevronClassName =
  'rotate-180 text-text-tertiary transition-transform motion-reduce:transition-none [[data-state=open]_&]:rotate-0';

/** The tab's name, with the sort beside it once it is not the default. */
export const ForYouTabLabel = ({
  label,
  selected,
  hasChevron = false,
}: {
  label: string;
  selected: number;
  hasChevron?: boolean;
}): ReactElement => (
  <>
    {label}
    {selected !== DEFAULT_ALGORITHM_INDEX && (
      <span className="ml-1 font-normal text-text-tertiary">
        · {algorithms[selected].text}
      </span>
    )}
    {hasChevron && (
      <ArrowIcon
        size={IconSize.Size16}
        className={classNames('ml-0.5', forYouChevronClassName)}
      />
    )}
  </>
);

/**
 * The active For you tab is its own sort: a press opens Recommended or By
 * date under it. `children` is the tab, rendered as the menu's trigger.
 */
export const ForYouSortMenu = ({
  sort,
  children,
}: {
  sort: ForYouSort;
  children: ReactElement;
}): ReactElement => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="!min-w-52">
      <span className="flex px-2.5 pb-1 pt-1.5 font-bold text-text-tertiary typo-caption1">
        Sort
      </span>
      {algorithms.map(({ text }, index) => (
        <DropdownMenuItem
          key={text}
          role="menuitemradio"
          aria-checked={sort.selected === index}
          onClick={() => sort.onSelect(index)}
        >
          <span className="inline-flex flex-1 items-center gap-2 typo-footnote">
            {text}
            {sort.selected === index && (
              <VIcon size={IconSize.Size16} className="ml-auto" secondary />
            )}
          </span>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

/**
 * The phone's For you sheet, after the Explore sort sheet: the sort, then
 * Feed settings, which lives here on phones instead of on the tab bar.
 */
export const ForYouSheet = ({
  title,
  sort,
  isOpen,
  onClose,
}: {
  title: ReactNode;
  sort: ForYouSort;
  isOpen: boolean;
  onClose: () => void;
}): ReactElement => {
  const { onClick: openFeedSettings } = useFeedSettingsAction(onClose);

  return (
    <RootPortal>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        className={{ drawer: 'py-1' }}
      >
        {sort.canSort && (
          <>
            <h3 className="px-4 pb-1 pt-3 text-text-tertiary typo-footnote">
              Sort
            </h3>
            <SheetChoice
              items={algorithms.map(({ text }, index) => ({
                key: text,
                label: text,
                active: sort.selected === index,
                onClick: () => {
                  sort.onSelect(index);
                  onClose();
                },
              }))}
            />
          </>
        )}
        <div
          className={classNames(
            'py-1',
            sort.canSort && 'border-t border-border-subtlest-tertiary',
          )}
        >
          <button
            type="button"
            onClick={openFeedSettings}
            className="flex h-12 w-full items-center gap-3 px-4 text-left text-text-primary transition-colors typo-callout hover:bg-surface-hover"
          >
            <FilterIcon size={IconSize.Small} className="text-text-tertiary" />
            <span className="flex-1">Feed settings</span>
            <ArrowIcon
              size={IconSize.Size16}
              className="rotate-90 text-text-quaternary"
            />
          </button>
        </div>
      </Drawer>
    </RootPortal>
  );
};
