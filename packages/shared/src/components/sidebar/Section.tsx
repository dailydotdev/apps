import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type { ItemInnerProps, SidebarMenuItem } from './common';
import { NavHeader, NavSection } from './common';
import { SidebarItem } from './SidebarItem';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import type { SettingsFlags } from '../../graphql/settings';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { isNullOrUndefined } from '../../lib/func';
import useSidebarRendered from '../../hooks/useSidebarRendered';

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

  return (
    <NavSection className={className}>
      {title && (
        <NavHeader
          className={classNames(
            'hidden justify-between laptop:flex',
            sidebarExpanded ? 'px-3 opacity-100' : 'px-0 opacity-0',
          )}
        >
          {title}
          <Button
            variant={ButtonVariant.Tertiary}
            onClick={toggleFlag}
            size={ButtonSize.XSmall}
            icon={
              <ArrowIcon
                className={isVisible.current ? 'rotate-360' : 'rotate-180'}
              />
            }
          />
        </NavHeader>
      )}
      {(isVisible.current || shouldAlwaysBeVisible) &&
        items.map((item) => (
          <SidebarItem
            key={`${item.title}-${item.path}`}
            item={item}
            activePage={activePage}
            isItemsButton={isItemsButton}
            shouldShowLabel={shouldShowLabel}
          />
        ))}
    </NavSection>
  );
}
