import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
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
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { FeedSettingsButton } from '../feeds/FeedSettingsButton';
import type { IconSize } from '../Icon';
import { useShortcutsUser } from '../../features/shortcuts/hooks/useShortcutsUser';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { SharedFeedPage } from '../utilities';
import { useActiveFeedNameContext } from '../../contexts';

interface MyFeedHeadingProps {
  onOpenFeedFilters?: () => void;
  feedSettingsButtonProps?: {
    size?: ButtonSize;
    variant?: ButtonVariant;
    className?: string;
    iconSize?: IconSize;
  };
}

function MyFeedHeading({
  onOpenFeedFilters,
  feedSettingsButtonProps,
}: MyFeedHeadingProps): ReactElement {
  const { push, pathname, query } = useRouter();
  const { completeAction } = useActions();
  const { toggleShowTopSites } = useSettingsContext();
  const { isOldUserWithNoShortcuts, showToggleShortcuts } = useShortcutsUser();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { feedName } = useActiveFeedNameContext();
  const { user, showLogin } = useAuthContext();

  const editFeedUrl = useMemo(() => {
    if (isCustomDefaultFeed && pathname === '/') {
      return `${webappUrl}feeds/${defaultFeedId}/edit`;
    }

    if (feedName === SharedFeedPage.Custom) {
      return `${webappUrl}feeds/${query.slugOrId}/edit`;
    }

    return `${settingsUrl}/feed/general`;
  }, [defaultFeedId, feedName, isCustomDefaultFeed, pathname, query]);

  const onClick = useCallback(() => {
    if (!user) {
      showLogin({
        trigger: AuthTriggers.MainButton,
        options: { isLogin: false },
      });
      return undefined;
    }

    onOpenFeedFilters?.();

    return push(editFeedUrl);
  }, [editFeedUrl, onOpenFeedFilters, push, user, showLogin]);
  const onShortcutsClick = useCallback(() => {
    if (isOldUserWithNoShortcuts) {
      completeAction(ActionType.FirstShortcutsSession);
      return;
    }

    toggleShowTopSites();
  }, [completeAction, isOldUserWithNoShortcuts, toggleShowTopSites]);
  const feedSettingsButtonSize =
    feedSettingsButtonProps?.size ?? ButtonSize.Medium;
  const feedSettingsButtonVariant =
    feedSettingsButtonProps?.variant ??
    (isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary);
  const feedSettingsButtonLabel = !isMobile ? 'Feed settings' : null;
  const feedSettingsButtonIcon = (
    <FilterIcon size={feedSettingsButtonProps?.iconSize} />
  );

  return (
    <>
      {shouldUseListFeedLayout ? (
        <FeedSettingsButton
          onClick={onClick}
          size={feedSettingsButtonSize}
          variant={feedSettingsButtonVariant}
          className={feedSettingsButtonProps?.className}
          icon={feedSettingsButtonIcon}
          iconPosition={ButtonIconPosition.Right}
        >
          {feedSettingsButtonLabel}
        </FeedSettingsButton>
      ) : (
        <FeedSettingsButton
          onClick={onClick}
          size={feedSettingsButtonSize}
          variant={feedSettingsButtonVariant}
          className={feedSettingsButtonProps?.className}
          icon={feedSettingsButtonIcon}
        >
          {feedSettingsButtonLabel}
        </FeedSettingsButton>
      )}
      {showToggleShortcuts && (
        <>
          {shouldUseListFeedLayout ? (
            <Button
              size={ButtonSize.Medium}
              variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
              className="mr-auto"
              onClick={onShortcutsClick}
              icon={<PlusIcon />}
              iconPosition={ButtonIconPosition.Right}
            >
              Shortcuts
            </Button>
          ) : (
            <Button
              size={ButtonSize.Medium}
              variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
              className="mr-auto"
              onClick={onShortcutsClick}
              icon={<PlusIcon />}
            >
              Shortcuts
            </Button>
          )}
        </>
      )}
    </>
  );
}

export default MyFeedHeading;
