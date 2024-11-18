import React, { MouseEventHandler, ReactElement } from 'react';
import { ClearIcon, MenuIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import classNames from 'classnames';

import {
  ShortcutLinksItem,
  ShortcutItemPlaceholder,
} from './ShortcutLinksItem';

type ShortcutLinksListProps = {
  onLinkClick: () => void;
  onMenuClick: MouseEventHandler<Element>;
  onOptionsOpen: () => void;
  shortcutLinks: string[];
  shouldUseListFeedLayout: boolean;
  showTopSites: boolean;
  toggleShowTopSites: () => void;
  hasCheckedPermission: boolean;
  isOldUser: boolean;
};

const placeholderLinks = Array.from({ length: 6 }).map((_, index) => index);

export function ShortcutLinksList({
  onLinkClick,
  onMenuClick,
  onOptionsOpen,
  toggleShowTopSites,
  shortcutLinks,
  shouldUseListFeedLayout,
}: ShortcutLinksListProps): ReactElement {
  const hasShortcuts = shortcutLinks?.length > 0;

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
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MenuIcon className="rotate-90" secondary />}
            onClick={onMenuClick}
            className="mt-2"
          />
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
