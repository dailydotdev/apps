import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { FilterIcon, PlusIcon } from '../icons';
import type { IconSize } from '../Icon';
import type { ButtonProps } from '../buttons/Button';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { useActions, useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { FeedSettingsButton } from '../feeds/FeedSettingsButton';
import { AlertColor, AlertDot } from '../AlertDot';
import { AttentionDot } from '../AttentionDot';
import { FeedSettingsMenu } from '../feeds/FeedSettings/types';
import { useShortcutsUser } from '../../features/shortcuts/hooks/useShortcutsUser';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { getHasSeenTags, setHasSeenTags } from '../../lib/feedSettings';
import { SharedFeedPage } from '../utilities';
import { useActiveFeedNameContext } from '../../contexts';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';

interface MyFeedHeadingProps {
  onOpenFeedFilters?: () => void;
  feedSettingsButtonProps?: Pick<
    ButtonProps<'button'>,
    'size' | 'variant' | 'className'
  > & { iconSize?: IconSize };
  onShortcutsClick?: () => void;
  // When true the Feed settings button renders icon-only (no text
  // label). Used by the v2 header strip when chips push the actions
  // cluster to the right and the row needs to stay tight.
  iconOnly?: boolean;
  // The widget rail's style: Shortcuts before Feed settings as the same
  // Tertiary Small button, and the shared attention dot for the reminder.
  quiet?: boolean;
}

/**
 * Feed settings for the feed on screen: the reader's tags on For you, the
 * feed's own settings on a custom feed, and a sign-up for a visitor.
 */
export const useFeedSettingsAction = (
  onOpen?: () => void,
): { onClick: () => void; shouldShowTagsReminder: boolean } => {
  const { push, pathname, query } = useRouter();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { feedName } = useActiveFeedNameContext();
  const { user, showLogin } = useAuthContext();
  const [hasSeenTagsState, setHasSeenTagsState] = useState<boolean | null>(
    null,
  );

  const hasSeenTagsAction =
    isActionsFetched && checkHasCompleted(ActionType.HasSeenTags);

  const editFeedUrl = useMemo(() => {
    if (isCustomDefaultFeed && pathname === '/') {
      return `${webappUrl}feeds/${defaultFeedId}/edit`;
    }

    if (feedName === SharedFeedPage.MyFeed && user?.id) {
      return `${webappUrl}feeds/${user.id}/edit?dview=${FeedSettingsMenu.Tags}`;
    }

    if (feedName === SharedFeedPage.Custom) {
      return `${webappUrl}feeds/${query.slugOrId}/edit`;
    }

    return `${settingsUrl}/feed/general`;
  }, [defaultFeedId, feedName, isCustomDefaultFeed, pathname, query, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setHasSeenTagsState(null);
      return;
    }

    if (hasSeenTagsAction) {
      setHasSeenTags(user.id, true);
      setHasSeenTagsState(true);
      return;
    }

    setHasSeenTagsState(getHasSeenTags(user.id));
  }, [hasSeenTagsAction, user?.id]);

  const shouldShowTagsReminder =
    feedName === SharedFeedPage.MyFeed && hasSeenTagsState === false;

  const onClick = useCallback(() => {
    if (!user) {
      showLogin({
        trigger: AuthTriggers.MainButton,
        options: { isLogin: false },
      });
      return undefined;
    }

    if (shouldShowTagsReminder && user?.id) {
      setHasSeenTags(user.id, true);
      setHasSeenTagsState(true);
      completeAction(ActionType.HasSeenTags).catch(() => null);
    }

    onOpen?.();

    return push(editFeedUrl);
  }, [
    completeAction,
    editFeedUrl,
    onOpen,
    push,
    shouldShowTagsReminder,
    showLogin,
    user,
  ]);

  return { onClick, shouldShowTagsReminder };
};

function MyFeedHeading({
  onOpenFeedFilters,
  feedSettingsButtonProps,
  onShortcutsClick,
  iconOnly,
  quiet = false,
}: MyFeedHeadingProps): ReactElement {
  const { completeAction } = useActions();
  const { toggleShowTopSites } = useSettingsContext();
  const { isOldUserWithNoShortcuts, showToggleShortcuts } = useShortcutsUser();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptopLayout = useLaptopLayout();
  const { onClick, shouldShowTagsReminder } =
    useFeedSettingsAction(onOpenFeedFilters);

  // Button's discriminated union requires `iconPosition` whenever `icon`
  // is set — `undefined` and conditional spreads both break it under
  // strict typecheck. Always pass a concrete value: `Right` when the
  // list-frame layout is active, otherwise the default `Left`.
  const iconPosition = shouldUseListFeedLayout
    ? ButtonIconPosition.Right
    : ButtonIconPosition.Left;

  const { iconSize: feedSettingsIconSize, ...feedSettingsButtonOverrides } =
    feedSettingsButtonProps ?? {};
  const hasLabel = !isMobile && !iconOnly;
  const filterIcon = feedSettingsIconSize ? (
    <FilterIcon size={feedSettingsIconSize} />
  ) : (
    <FilterIcon />
  );

  const shortcutsToggle = showToggleShortcuts && (
    <Button
      size={
        quiet || isLaptopLayout ? ButtonSize.Small : ButtonSize.Medium
      }
      variant={ButtonVariant.Tertiary}
      className={classNames(
        !quiet &&
          (isLaptopLayout
            ? '!h-8 !rounded-10 !border-transparent !bg-transparent !px-3 hover:!bg-surface-hover'
            : 'mr-auto'),
      )}
      onClick={() => {
        if (onShortcutsClick) {
          onShortcutsClick();
          return;
        }
        if (isOldUserWithNoShortcuts) {
          completeAction(ActionType.FirstShortcutsSession);
          return;
        }
        toggleShowTopSites();
      }}
      icon={<PlusIcon />}
      iconPosition={iconPosition}
    >
      {iconOnly ? null : 'Shortcuts'}
    </Button>
  );

  return (
    <>
      {quiet && shortcutsToggle}
      <div className="relative">
        <FeedSettingsButton
          onClick={onClick}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          icon={filterIcon}
          iconPosition={iconPosition}
          aria-label={hasLabel ? undefined : 'Feed settings'}
          {...feedSettingsButtonOverrides}
        >
          {hasLabel ? 'Feed settings' : null}
        </FeedSettingsButton>
        {shouldShowTagsReminder && quiet && <AttentionDot />}
        {shouldShowTagsReminder && !quiet && (
          <AlertDot
            color={AlertColor.Bun}
            className="pointer-events-none right-2 top-2 border border-background-default"
          />
        )}
      </div>
      {!quiet && shortcutsToggle}
    </>
  );
}

export default MyFeedHeading;
