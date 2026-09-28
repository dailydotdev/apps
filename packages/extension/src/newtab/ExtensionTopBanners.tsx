import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { TopHeroPortal } from '@dailydotdev/shared/src/contexts/TopHeroSlotContext';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useIsShortcutsHubEnabled } from '@dailydotdev/shared/src/features/shortcuts/hooks/useIsShortcutsHubEnabled';
import { useShortcutLinks } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils/useThemedAsset';
import {
  cloudinaryShortcutsIconsGmail,
  cloudinaryShortcutsIconsOpenai,
  cloudinaryShortcutsIconsReddit,
} from '@dailydotdev/shared/src/lib/image';

// Matches `CvTopHero`'s frame so the cards sharing the strip line up.
const illustrationFrameClass =
  '!m-0 flex h-24 w-32 shrink-0 items-center justify-center self-center tablet:h-28 tablet:w-36';

const ShortcutsIllustration = (): ReactElement => {
  const { githubShortcut } = useThemedAsset();
  const icons = [
    { src: cloudinaryShortcutsIconsGmail, rotate: '-rotate-12' },
    { src: githubShortcut, rotate: 'rotate-0' },
    { src: cloudinaryShortcutsIconsReddit, rotate: 'rotate-12' },
    { src: cloudinaryShortcutsIconsOpenai, rotate: '-rotate-6' },
  ];

  return (
    <div className={illustrationFrameClass} aria-hidden>
      <div className="grid grid-cols-2 gap-1.5">
        {icons.map(({ src, rotate }) => (
          <div
            key={src}
            className={classNames(
              'flex size-9 items-center justify-center rounded-full bg-background-default shadow-2',
              rotate,
            )}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="size-5 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

type UseShortcutsOnboardingResult = {
  shouldShow: boolean;
  onAddClick: () => void;
  onClose: () => void;
};

const useShortcutsOnboarding = (): UseShortcutsOnboardingResult => {
  const hubEnabled = useIsShortcutsHubEnabled();
  const { showTopSites, toggleShowTopSites, loadedSettings } =
    useSettingsContext();
  const { openModal } = useLazyModal();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { shortcutLinks, hasCheckedPermission } = useShortcutLinks();

  const hasShortcuts = (shortcutLinks?.length ?? 0) > 0;
  const hasClosedBanner = checkHasCompleted(ActionType.ClosedShortcutsBanner);
  const shouldShow =
    isActionsFetched &&
    loadedSettings &&
    !!hasCheckedPermission &&
    !hasShortcuts &&
    !hasClosedBanner;

  const completeFirstSession = () => {
    if (!checkHasCompleted(ActionType.FirstShortcutsSession)) {
      completeAction(ActionType.FirstShortcutsSession);
    }
  };

  const onAddClick = () => {
    completeFirstSession();
    if (!showTopSites) {
      toggleShowTopSites();
    }
    openModal({
      type: hubEnabled ? LazyModal.ShortcutsManage : LazyModal.CustomLinks,
    });
  };

  const onClose = () => completeAction(ActionType.ClosedShortcutsBanner);

  return { shouldShow, onAddClick, onClose };
};

export const ExtensionTopBanners = (): ReactElement | null => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const shortcuts = useShortcutsOnboarding();

  // Logged-out users get the dedicated sticky sign-in strip rendered
  // higher up in `MainFeedPage`. This component is logged-in cards only.
  if (!isAuthReady || !isLoggedIn || !shortcuts.shouldShow) {
    return null;
  }

  return (
    <TopHeroPortal>
      <TopHero
        className="order-last"
        subtitle="Pin the sites you visit most, right from your new tab."
        ctaLabel="Add shortcuts"
        illustration={<ShortcutsIllustration />}
        onCtaClick={shortcuts.onAddClick}
        onClose={shortcuts.onClose}
      />
    </TopHeroPortal>
  );
};
