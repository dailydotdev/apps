import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
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
import { useShortcutsUser } from '../../features/shortcuts/hooks/useShortcutsUser';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { settingsUrl, webappUrl } from '../../lib/constants';
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
}

function MyFeedHeading({
  onOpenFeedFilters,
  feedSettingsButtonProps,
  onShortcutsClick,
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
  // v2 layout (laptop) renders this button inside the floating-card
  // page-header strip alongside other slim actions; use the compact ghost
  // sizing so the strip stays consistent with the designer mock.
  const { isV2 } = useLayoutVariant();
  const isV2Compact = isV2;

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
  }, [editFeedUrl, onOpenFeedFilters, push, showLogin, user]);

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
      {isV2Compact ? (
        <FeedSettingsButton
          onClick={onClick}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          icon={filterIcon}
          iconPosition={iconPosition}
          {...feedSettingsButtonOverrides}
        >
          {!isMobile ? 'Feed settings' : null}
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
          {!isMobile ? 'Feed settings' : null}
        </FeedSettingsButton>
      )}
      {showToggleShortcuts && (
        <Button
          size={ButtonSize.Medium}
          variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
          className="mr-auto"
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
          Shortcuts
        </Button>
      )}
    </>
  );
}

export default MyFeedHeading;
