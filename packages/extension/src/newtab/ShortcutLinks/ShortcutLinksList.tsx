import type { ReactElement } from 'react';
import React from 'react';
import {
  ClearIcon,
  EyeIcon,
  MenuIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import { MenuIcon as WrappingMenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import classNames from 'classnames';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import {
  ShortcutLinksItem,
  ShortcutItemPlaceholder,
} from './ShortcutLinksItem';

interface ShortcutLinksListProps {
  onLinkClick: () => void;
  onOptionsOpen: () => void;
  shortcutLinks: string[];
  shouldUseListFeedLayout: boolean;
  showTopSites: boolean;
  toggleShowTopSites: () => void;
  hasCheckedPermission?: boolean;
}

const placeholderLinks = Array.from({ length: 6 }).map((_, index) => index);

export function ShortcutLinksList({
  onLinkClick,
  onOptionsOpen,
  toggleShowTopSites,
  shortcutLinks,
  shouldUseListFeedLayout,
}: ShortcutLinksListProps): ReactElement {
  const hasShortcuts = shortcutLinks?.length > 0;

  const options = [
    {
      icon: <WrappingMenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: toggleShowTopSites,
    },
    {
      icon: <WrappingMenuIcon Icon={SettingsIcon} />,
      label: 'Manage',
      action: onOptionsOpen,
    },
  ];

  return (
    <div
      className={classNames(
        'hidden tablet:flex',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : '-mt-2 mb-5',
      )}
    >
      {hasShortcuts && (
        <>
          {shortcutLinks.map((url) => (
            <ShortcutLinksItem key={url} url={url} onLinkClick={onLinkClick} />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<MenuIcon className="rotate-90" secondary />}
                className="mt-2"
                aria-label="toggle shortcuts menu"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuOptions options={options} />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      {!hasShortcuts && (
        <>
          {placeholderLinks.map((index) => (
            <ShortcutItemPlaceholder
              isCtaAddShortcut={index === 0}
              key={index}
              onClick={onOptionsOpen}
            />
          ))}
          <Button
            aria-label="Remove shortcuts"
            variant={ButtonVariant.Tertiary}
            onClick={toggleShowTopSites}
            size={ButtonSize.Small}
            icon={<ClearIcon secondary />}
            className="mt-2"
          />
        </>
      )}
    </div>
  );
}
