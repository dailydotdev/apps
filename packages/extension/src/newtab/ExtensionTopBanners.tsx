import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { TopHeroPortal } from '@dailydotdev/shared/src/contexts/TopHeroSlotContext';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  useActions,
  useContentScriptStatus,
} from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useIsShortcutsHubEnabled } from '@dailydotdev/shared/src/features/shortcuts/hooks/useIsShortcutsHubEnabled';
import { useShortcutLinks } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils/useThemedAsset';
import {
  cloudinaryShortcutsIconsGmail,
  cloudinaryShortcutsIconsOpenai,
  cloudinaryShortcutsIconsReddit,
} from '@dailydotdev/shared/src/lib/image';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import { ExperimentWinner } from '@dailydotdev/shared/src/lib/featureValues';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';

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

// The preview frame of the companion overview video, in the shared card frame.
const CompanionIllustration = (): ReactElement => (
  <a
    target="_blank"
    rel="noopener"
    href={companionExplainerVideo}
    aria-label="Watch the companion overview video"
    className={classNames(illustrationFrameClass, 'relative')}
  >
    <img
      src="https://media.daily.dev/image/upload/v1655218347/public/companion_preview_v2.png"
      alt=""
      loading="lazy"
      className="h-full w-full rounded-10 object-cover"
    />
    <PlayIcon secondary className="absolute" size={IconSize.XLarge} />
  </a>
);

type UseCompanionOnboardingResult = {
  shouldShow: boolean;
  onActivate: () => void;
  onClose: () => void;
};

// The one-time ask for the companion's content-script permission. It used to
// be a square in the sidebar's panel (the v1 header's action-row slot); a
// card beside "Add shortcuts" says what it is for. Closing it completes an
// action so it never returns; the rail's Support menu keeps a labelled way
// back in while the permission is not granted.
const useCompanionOnboarding = (): UseCompanionOnboardingResult => {
  const { logEvent } = useLogContext();
  const { optOutCompanion, loadedSettings } = useSettingsContext();
  const { requestContentScripts } = useExtensionContext();
  const { contentScriptGranted, isFetched } = useContentScriptStatus();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();

  const shouldShow =
    isActionsFetched &&
    loadedSettings &&
    isFetched &&
    !contentScriptGranted &&
    !optOutCompanion &&
    !!requestContentScripts &&
    !checkHasCompleted(ActionType.ClosedCompanionBanner);

  // The same impression the sidebar square logged, so the permission funnel
  // keeps one series across the move.
  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    logEvent({
      event_name: 'impression',
      target_type: 'companion permission',
      target_id: ExperimentWinner.CompanionPermissionPlacement,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  const onActivate = () => {
    requestContentScripts?.({ origin: 'companion permission card' });
  };

  const onClose = () => completeAction(ActionType.ClosedCompanionBanner);

  return { shouldShow, onActivate, onClose };
};

export const ExtensionTopBanners = (): ReactElement | null => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const shortcuts = useShortcutsOnboarding();
  const companion = useCompanionOnboarding();

  // Logged-out users get the dedicated sticky sign-in strip rendered
  // higher up in `MainFeedPage`. This component is logged-in cards only.
  if (
    !isAuthReady ||
    !isLoggedIn ||
    (!shortcuts.shouldShow && !companion.shouldShow)
  ) {
    return null;
  }

  return (
    <TopHeroPortal>
      {companion.shouldShow && (
        <TopHero
          title="Try the new companion feature!"
          subtitle="We'll ask for extra permissions so we can show the companion directly on the original content!"
          illustration={<CompanionIllustration />}
          onClose={companion.onClose}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                onClick={companion.onActivate}
              >
                Activate companion
              </Button>
              <ClickableText
                tag="a"
                target="_blank"
                rel="noopener"
                defaultTypo={false}
                href={companionExplainerVideo}
                textClassName="text-accent-cabbage-default typo-footnote"
              >
                Overview video
              </ClickableText>
            </div>
          }
        />
      )}
      {shortcuts.shouldShow && (
        <TopHero
          className="order-last"
          subtitle="Pin the sites you visit most, right from your new tab."
          ctaLabel="Add shortcuts"
          illustration={<ShortcutsIllustration />}
          onCtaClick={shortcuts.onAddClick}
          onClose={shortcuts.onClose}
        />
      )}
    </TopHeroPortal>
  );
};
