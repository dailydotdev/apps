import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FilterIcon, PlusIcon } from '../icons';
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
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useAuthContext } from '../../contexts/AuthContext';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { getHasSeenTags, setHasSeenTags } from '../../lib/feedSettings';
import { SharedFeedPage } from '../utilities';
import { useActiveFeedNameContext } from '../../contexts';

interface MyFeedHeadingProps {
  onOpenFeedFilters?: () => void;
}

function MyFeedHeading({
  onOpenFeedFilters,
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
  const { user } = useAuthContext();
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
    user?.id,
  ]);

  return (
    <>
      <div className="relative">
        <FeedSettingsButton
          onClick={onClick}
          size={ButtonSize.Medium}
          variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
          icon={<FilterIcon />}
          iconPosition={
            shouldUseListFeedLayout ? ButtonIconPosition.Right : undefined
          }
        >
          {!isMobile ? 'Feed settings' : null}
        </FeedSettingsButton>
        {shouldShowTagsReminder && (
          <AlertDot
            color={AlertColor.Bun}
            className="pointer-events-none right-2 top-2 border border-background-default"
          />
        )}
      </div>
      {showToggleShortcuts && (
        <Button
          size={ButtonSize.Medium}
          variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
          className="mr-auto"
          onClick={() => {
            if (isOldUserWithNoShortcuts) {
              completeAction(ActionType.FirstShortcutsSession);
              return;
            }
            toggleShowTopSites();
          }}
          icon={<PlusIcon />}
          iconPosition={
            shouldUseListFeedLayout ? ButtonIconPosition.Right : undefined
          }
        >
          Shortcuts
        </Button>
      )}
    </>
  );
}

export default MyFeedHeading;
