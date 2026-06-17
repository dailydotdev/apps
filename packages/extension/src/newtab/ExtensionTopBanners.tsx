import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { useReadingReminderHero } from '@dailydotdev/shared/src/hooks/notifications/useReadingReminderHero';
import {
  fileValidation,
  useUploadCv,
} from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useIsShortcutsHubEnabled } from '@dailydotdev/shared/src/features/shortcuts/hooks/useIsShortcutsHubEnabled';
import { useShortcutLinks } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils/useThemedAsset';
import ReadingReminderCatLaptop from '@dailydotdev/shared/src/components/marketing/banners/ReadingReminderCatLaptop';
import {
  cloudinaryShortcutsIconsGmail,
  cloudinaryShortcutsIconsOpenai,
  cloudinaryShortcutsIconsReddit,
  uploadCvBgMobile,
} from '@dailydotdev/shared/src/lib/image';

// Bare-illustration frame matched across the three top cards so they
// line up vertically. Slightly wider than tall to give the CV cluster
// horizontal room without cropping.
const illustrationFrameClass =
  '!m-0 flex h-24 w-32 shrink-0 items-center justify-center self-center tablet:h-28 tablet:w-36';

const CvIllustration = (): ReactElement => (
  <div
    className={classNames(illustrationFrameClass, 'overflow-hidden')}
    aria-hidden
  >
    <span
      className="block size-full bg-no-repeat"
      style={{
        backgroundImage: `url(${uploadCvBgMobile})`,
        backgroundPosition: 'center top',
        backgroundSize: 'auto 220%',
      }}
    />
  </div>
);

// Compact cat illustration scaled to match the CV / Shortcuts frames so
// the three cards in the row share the same height.
const CompactReminderCat = (): ReactElement => (
  <ReadingReminderCatLaptop className="!m-0 h-24 w-28 shrink-0 self-center rounded-12 object-contain tablet:h-28 tablet:w-32" />
);

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
};

const useShortcutsOnboarding = (): UseShortcutsOnboardingResult => {
  const hubEnabled = useIsShortcutsHubEnabled();
  const { showTopSites, toggleShowTopSites } = useSettingsContext();
  const { openModal } = useLazyModal();
  const { completeAction, checkHasCompleted } = useActions();
  const { shortcutLinks } = useShortcutLinks();

  const hasShortcuts = (shortcutLinks?.length ?? 0) > 0;
  const shouldShow = !hasShortcuts;

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

  return { shouldShow, onAddClick };
};

export const ExtensionTopBanners = (): ReactElement | null => {
  // The extension's top hero row is the only place this card appears
  // on the new tab, so we evaluate the reminder regardless of viewport
  // (the webapp-only `requireMobile` heuristic would hide it on desktop
  // new tabs, which is where the extension lives).
  const reminder = useReadingReminderHero({ requireMobile: false });
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { onUpload, shouldShow: shouldShowCv } = useUploadCv();
  const { completeAction } = useActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shortcuts = useShortcutsOnboarding();

  // Logged-out users get the dedicated sticky sign-in strip rendered
  // higher up in `MainFeedPage`. This component is logged-in cards only.
  if (!isAuthReady || !isLoggedIn) {
    return null;
  }

  const cards: ReactElement[] = [];

  if (reminder.shouldShow) {
    cards.push(
      <TopHero
        key="reminder"
        title={reminder.title}
        subtitle={reminder.subtitle}
        illustration={<CompactReminderCat />}
        onCtaClick={() => {
          reminder.onEnable();
        }}
        onClose={() => {
          reminder.onDismiss();
        }}
      />,
    );
  }

  if (shouldShowCv) {
    cards.push(
      <TopHero
        key="cv"
        subtitle="Upload your CV and let your next job quietly come to you."
        ctaLabel="Upload CV"
        illustration={<CvIllustration />}
        onCtaClick={() => fileInputRef.current?.click()}
        onClose={() => completeAction(ActionType.ClosedProfileBanner)}
      />,
    );
  }

  if (shortcuts.shouldShow) {
    cards.push(
      <TopHero
        key="shortcuts"
        subtitle="Pin the sites you visit most, right from your new tab."
        ctaLabel="Add shortcuts"
        illustration={<ShortcutsIllustration />}
        onCtaClick={shortcuts.onAddClick}
      />,
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={fileValidation.acceptedExtensions
          .map((ext) => `.${ext}`)
          .join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          onUpload(file);
          // eslint-disable-next-line no-param-reassign
          event.target.value = '';
        }}
      />
      <div
        className={classNames(
          'mx-4 mb-3 grid grid-cols-1 gap-3 laptop:mx-0',
          cards.length === 2 && 'tablet:grid-cols-2',
          cards.length === 3 && 'tablet:grid-cols-2 laptop:grid-cols-3',
        )}
      >
        {cards}
      </div>
    </>
  );
};
