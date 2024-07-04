import React, {
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
} from 'react';
import {
  ClearIcon,
  MenuIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import { useActions } from '@dailydotdev/shared/src/hooks';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import classNames from 'classnames';
import { combinedClicks } from '@dailydotdev/shared/src/lib/click';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';

const pixelRatio = globalThis?.window.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

type ShortcutLinksV1Props = {
  onLinkClick: () => void;
  onMenuClick: MouseEventHandler<Element>;
  onOptionsOpen: () => void;
  onV1Hide: () => void;
  shortcutLinks: string[];
  shouldUseListFeedLayout: boolean;
  showTopSites: boolean;
  toggleShowTopSites: () => void;
};

function ShortCutV1Placeholder({
  initialItem = false,
  onClick,
}: {
  initialItem?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="group mr-4 flex flex-col items-center first:mr-2 last-of-type:mr-2 hover:cursor-pointer"
      onClick={onClick}
      type="button"
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary group-first:mb-1 group-hover:text-text-primary">
        <PlusIcon
          className="inline group-hover:hidden"
          size={IconSize.Size16}
        />
        <PlusIcon
          className="hidden group-hover:inline"
          secondary
          size={IconSize.Size16}
        />
      </div>
      {initialItem ? (
        <span className="text-text-tertiary typo-caption2">Add shortcut</span>
      ) : (
        <span className="h-2 w-10 rounded-10 bg-surface-float" />
      )}
    </button>
  );
}

function ShortcutV1Item({
  url,
  onLinkClick,
}: {
  url: string;
  onLinkClick: () => void;
}) {
  const cleanUrl = url.replace(/http(s)?(:)?(\/\/)?|(\/\/)?(www\.)?/g, '');
  return (
    <a
      href={url}
      rel="noopener noreferrer"
      {...combinedClicks(onLinkClick)}
      className="group mr-4 flex flex-col items-center"
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        <img
          src={`https://api.daily.dev/icon?url=${encodeURIComponent(
            url,
          )}&size=${iconSize}`}
          alt={url}
          className="size-6"
        />
      </div>
      <span className="max-w-12 truncate text-text-tertiary typo-caption2">
        {cleanUrl}
      </span>
    </a>
  );
}

function ShortcutUIItemPlaceholder({ children }: PropsWithChildren) {
  return (
    <div className="group flex flex-col items-center">
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        {children}
      </div>
      <span className="h-2 w-10 rounded-10 bg-surface-float" />
    </div>
  );
}

export function ShortcutLinksUIV1(props: ShortcutLinksV1Props): ReactElement {
  const {
    onLinkClick,
    onMenuClick,
    onOptionsOpen,
    onV1Hide,
    shortcutLinks,
    shouldUseListFeedLayout,
    showTopSites,
    toggleShowTopSites,
  } = props;

  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { githubShortcut } = useThemedAsset();

  if (
    showTopSites &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.FirstShortcutsSession)
  ) {
    const placeholderShortcutLinks = [
      cloudinary.shortcuts.icons.gmail,
      githubShortcut,
      cloudinary.shortcuts.icons.reddit,
      cloudinary.shortcuts.icons.openai,
      cloudinary.shortcuts.icons.stackoverflow,
    ];

    return (
      <div className="mb-6 hidden flex-col gap-6 px-4 tablet:flex laptop:items-center">
        <h4 className="font-bold text-text-primary typo-title3">
          Choose your most visited sites
        </h4>
        <div className="flex gap-4">
          {placeholderShortcutLinks.map((url) => (
            <ShortcutUIItemPlaceholder key={url}>
              <img src={url} alt={url} className="size-6 object-contain" />
            </ShortcutUIItemPlaceholder>
          ))}
          <ShortcutUIItemPlaceholder>
            <PlusIcon />
          </ShortcutUIItemPlaceholder>
        </div>
        <div className="flex gap-4">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            onClick={() => {
              toggleShowTopSites();
              completeAction(ActionType.FirstShortcutsSession);
            }}
          >
            Skip for now
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={() => {
              onOptionsOpen();

              completeAction(ActionType.FirstShortcutsSession);
            }}
          >
            Add shortcuts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'hidden tablet:flex',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : '-mt-2 mb-5',
      )}
    >
      {shortcutLinks?.length ? (
        <>
          {shortcutLinks.map((url) => (
            <ShortcutV1Item key={url} url={url} onLinkClick={onLinkClick} />
          ))}
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MenuIcon className="rotate-90" secondary />}
            onClick={onMenuClick}
            className="mt-2"
          />
        </>
      ) : (
        <>
          <ShortCutV1Placeholder initialItem onClick={onOptionsOpen} />
          {Array.from({ length: 5 }).map((_, index) => (
            /* eslint-disable-next-line react/no-array-index-key */
            <ShortCutV1Placeholder key={index} onClick={onOptionsOpen} />
          ))}
          <Button
            variant={ButtonVariant.Tertiary}
            onClick={onV1Hide}
            size={ButtonSize.Small}
            icon={<ClearIcon secondary />}
            className="mt-2"
          />
        </>
      )}
    </div>
  );
}
