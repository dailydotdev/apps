import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useRef, useCallback } from 'react';
import type { ItemInnerProps, SidebarMenuItem } from './common';
import { NavHeader, NavSection } from './common';
import { SidebarItem } from './SidebarItem';
import { ArrowIcon, PlusIcon } from '../icons';
import type { SettingsFlags } from '../../graphql/settings';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { isNullOrUndefined } from '../../lib/func';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import Link from '../utilities/Link';

export interface SectionCommonProps
  extends Pick<ItemInnerProps, 'shouldShowLabel'> {
  sidebarExpanded: boolean;
  activePage: string;
  className?: string;
  flag?: keyof SettingsFlags;
}

interface SectionProps extends SectionCommonProps {
  title?: string;
  items: SidebarMenuItem[];
  isItemsButton: boolean;
  isAlwaysOpenOnMobile?: boolean;
  onAdd?: () => void;
  addHref?: string;
}

export function Section({
  title,
  items,
  sidebarExpanded,
  shouldShowLabel,
  activePage,
  isItemsButton,
  className,
  flag,
  isAlwaysOpenOnMobile,
  onAdd,
  addHref,
}: SectionProps): ReactElement {
  const { flags, updateFlag } = useSettingsContext();
  const { sidebarRendered } = useSidebarRendered();
  const shouldAlwaysBeVisible = isAlwaysOpenOnMobile && !sidebarRendered;
  const isVisible = useRef(
    isNullOrUndefined(flags?.[flag]) ? true : flags[flag],
  );
  const toggleFlag = useCallback(() => {
    updateFlag(flag, !isVisible.current);
    isVisible.current = !isVisible.current;
  }, [updateFlag, flag]);

  return (
    <NavSection className={classNames('mt-1', className)}>
      {title && (
        <NavHeader className="hidden laptop:flex">
          <div
            className={classNames(
              'group/section flex w-full items-center justify-between px-2 py-1.5 transition-opacity duration-300',
              sidebarExpanded ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <button
              type="button"
              onClick={toggleFlag}
              aria-label={`Toggle ${title}`}
              aria-expanded={!!isVisible.current}
              className="flex items-center gap-1 rounded-6 transition-colors hover:text-text-primary"
            >
              <span
                className={classNames(
                  'text-text-quaternary typo-callout',
                  !sidebarExpanded && 'opacity-0',
                )}
              >
                {title}
              </span>
              <ArrowIcon
                className={classNames(
                  'h-2.5 w-2.5 text-text-quaternary transition-transform duration-200',
                  isVisible.current ? 'rotate-180' : 'rotate-90',
                )}
              />
            </button>
            {addHref && (
              <Link href={addHref}>
                <a
                  aria-label={`Add to ${title}`}
                  className="flex h-6 w-6 items-center justify-center rounded-6 text-text-tertiary transition-all hover:bg-surface-hover hover:text-text-primary"
                >
                  <PlusIcon className="h-4 w-4" />
                </a>
              </Link>
            )}
            {!addHref && onAdd && (
              <button
                type="button"
                onClick={onAdd}
                aria-label={`Add to ${title}`}
                className="flex h-6 w-6 items-center justify-center rounded-6 text-text-tertiary transition-all hover:bg-surface-hover hover:text-text-primary"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </NavHeader>
      )}
      <div
        className={classNames(
          'flex flex-col overflow-hidden transition-all duration-300',
          isVisible.current || shouldAlwaysBeVisible
            ? 'max-h-[2000px] opacity-100' // Using large max-height for CSS transition animation
            : 'max-h-0 opacity-0',
        )}
      >
        {items.map((item) => (
          <SidebarItem
            key={`${item.title}-${item.path}`}
            item={item}
            activePage={activePage}
            isItemsButton={isItemsButton}
            shouldShowLabel={shouldShowLabel}
          />
        ))}
      </div>
    </NavSection>
  );
}
