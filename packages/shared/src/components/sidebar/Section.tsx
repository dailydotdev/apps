import classNames from 'classnames';
import React, { ReactElement, useRef } from 'react';
import {
  ItemInnerProps,
  NavHeader,
  NavSection,
  SidebarMenuItem,
} from './common';
import { SidebarItem } from './SidebarItem';
import { Button, ButtonSize } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { SettingsFlags } from '../../graphql/settings';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { isNullOrUndefined } from '../../lib/func';

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
}: SectionProps): ReactElement {
  const { flags, updateFlag } = useSettingsContext();

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
      {isVisible.current &&
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
