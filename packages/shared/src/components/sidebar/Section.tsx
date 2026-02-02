import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type { ItemInnerProps, SidebarMenuItem } from './common';
import { NavHeader, NavSection } from './common';
import { SidebarItem } from './SidebarItem';
import { ArrowIcon, PlusIcon } from '../icons';
import type { SettingsFlags } from '../../graphql/settings';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { isNullOrUndefined } from '../../lib/func';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

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
}: SectionProps): ReactElement {
  const { flags, updateFlag } = useSettingsContext();
  const { sidebarRendered } = useSidebarRendered();
  const shouldAlwaysBeVisible = isAlwaysOpenOnMobile && !sidebarRendered;
  const isVisible = useRef(
    isNullOrUndefined(flags?.[flag]) ? true : flags[flag],
  );
  const toggleFlag = () => {
    updateFlag(flag, !isVisible.current);
    isVisible.current = !isVisible.current;
  };

  const headerContent = (
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
        aria-expanded={isVisible.current}
        className="flex items-center gap-1 rounded-6 transition-colors hover:text-text-primary"
      >
        <span className="typo-callout text-text-quaternary">{title}</span>
        <ArrowIcon
          className={classNames(
            'h-2.5 w-2.5 text-text-quaternary transition-transform duration-200',
            isVisible.current ? 'rotate-180' : 'rotate-90',
          )}
        />
      </button>
      {onAdd && (
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
  );

  return (
    <NavSection className={classNames('mt-1', className)}>
      {title && (
        <NavHeader className="hidden laptop:flex">
          {sidebarExpanded ? (
            headerContent
          ) : (
            <SimpleTooltip content={title} placement="right">
              <div className="mx-auto my-1 h-px w-5 rounded-full bg-border-subtlest-tertiary" />
            </SimpleTooltip>
          )}
        </NavHeader>
      )}
      <div
        className={classNames(
          'flex flex-col overflow-hidden transition-all duration-200',
          isVisible.current || shouldAlwaysBeVisible
            ? 'max-h-[2000px] opacity-100'
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
