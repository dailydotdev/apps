import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
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
import { FeedSettingsMenu } from '../feeds/FeedSettings/types';
import { useShortcutsUser } from '../../features/shortcuts/hooks/useShortcutsUser';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
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
}

function MyFeedHeading({
  onOpenFeedFilters,
  feedSettingsButtonProps,
  onShortcutsClick,
  iconOnly,
}: MyFeedHeadingProps): ReactElement {
  const { push, pathname, query } = useRouter();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { toggleShowTopSites } = useSettingsContext();
  const { isOldUserWithNoShortcuts, showToggleShortcuts } = useShortcutsUser();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { feedName } = useActiveFeedNameContext();
  const { user, showLogin } = useAuthContext();
  const { isV2 } = useLayoutVariant();
  const isV2Compact = isV2;
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

    onOpenFeedFilters?.();

    return push(editFeedUrl);
  }, [
    completeAction,
    editFeedUrl,
    onOpenFeedFilters,
    push,
    shouldShowTagsReminder,
    showLogin,
    user,
  ]);

  // Button's discriminated union requires `iconPosition` whenever `icon`
  // is set — `undefined` and conditional spreads both break it under
  // strict typecheck. Always pass a concrete value: `Right` when the
  // list-frame layout is active, otherwise the default `Left`.
  const iconPosition = shouldUseListFeedLayout
    ? ButtonIconPosition.Right
    : ButtonIconPosition.Left;

  const { iconSize: feedSettingsIconSize, ...feedSettingsButtonOverrides } =
    feedSettingsButtonProps ?? {};
  const filterIcon = feedSettingsIconSize ? (
    <FilterIcon size={feedSettingsIconSize} />
  ) : (
    <FilterIcon />
  );

  return (
    <>
      <div className="relative">
        {isV2Compact ? (
          <FeedSettingsButton
            onClick={onClick}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Tertiary}
            icon={filterIcon}
            iconPosition={iconPosition}
            {...feedSettingsButtonOverrides}
          >
            {!isMobile && !iconOnly ? 'Feed settings' : null}
          </FeedSettingsButton>
        ) : (
          <FeedSettingsButton
            onClick={onClick}
            size={ButtonSize.Medium}
            variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
            icon={filterIcon}
            iconPosition={iconPosition}
            {...feedSettingsButtonOverrides}
          >
            {!isMobile && !iconOnly ? 'Feed settings' : null}
          </FeedSettingsButton>
        )}
        {shouldShowTagsReminder && (
          <AlertDot
            color={AlertColor.Bun}
            className="pointer-events-none right-2 top-2 border border-background-default"
          />
        )}
      </div>
      {showToggleShortcuts && (
        <Button
          size={isV2Compact ? ButtonSize.Small : ButtonSize.Medium}
          variant={
            isV2Compact || !isLaptop
              ? ButtonVariant.Tertiary
              : ButtonVariant.Float
          }
          className={
            isV2Compact
              ? '!h-8 !rounded-10 !border-transparent !bg-transparent !px-3 hover:!bg-surface-hover'
              : 'mr-auto'
          }
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
      )}
    </>
  );
}

export default MyFeedHeading;
