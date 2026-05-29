import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { TopHero } from './HeroBottomBanner';
import ReadingReminderCatLaptop from './ReadingReminderCatLaptop';
import { useReadingReminderHero } from '../../../hooks/notifications/useReadingReminderHero';
import {
  fileValidation,
  useUploadCv,
} from '../../../features/profile/hooks/useUploadCv';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useAuthContext } from '../../../contexts/AuthContext';
import { uploadCvBgMobile } from '../../../lib/image';

// Dev-only escape hatch: passing `?previewBanners=1` (or `=all`,
// `=reminder`, `=cv`) on any v2 page forces the corresponding cards on
// so designers/engineers can preview the strip without touching
// IndexedDB or completing actions. Production behavior is unchanged.
const usePreviewOverrides = (): { reminder: boolean; cv: boolean } => {
  const router = useRouter();
  const raw = router?.query?.previewBanners;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return { reminder: false, cv: false };
  }
  if (value === '1' || value === 'all' || value === 'true') {
    return { reminder: true, cv: true };
  }
  return { reminder: value === 'reminder', cv: value === 'cv' };
};

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

const CompactReminderCat = (): ReactElement => (
  <ReadingReminderCatLaptop className="!m-0 h-24 w-28 shrink-0 self-center rounded-12 object-contain tablet:h-28 tablet:w-32" />
);

export const useHomepageTopBannersVisibility = (): {
  showReminder: boolean;
  showCv: boolean;
  hasAny: boolean;
} => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const reminder = useReadingReminderHero({ requireMobile: false });
  const { shouldShow: shouldShowCv } = useUploadCv();
  const preview = usePreviewOverrides();
  const enabled = isAuthReady && isLoggedIn;
  const showReminder = enabled && (reminder.shouldShow || preview.reminder);
  const showCv = enabled && (shouldShowCv || preview.cv);
  return { showReminder, showCv, hasAny: showReminder || showCv };
};

type HomepageTopBannersProps = {
  className?: string;
};

export const HomepageTopBanners = ({
  className,
}: HomepageTopBannersProps): ReactElement | null => {
  const reminder = useReadingReminderHero({ requireMobile: false });
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { onUpload, shouldShow: shouldShowCv } = useUploadCv();
  const { completeAction } = useActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preview = usePreviewOverrides();

  if (!isAuthReady || !isLoggedIn) {
    return null;
  }

  const cards: ReactElement[] = [];

  if (reminder.shouldShow || preview.reminder) {
    cards.push(
      <TopHero
        key="reminder"
        subtitle="Turn on your daily reading reminder and never miss a learning day."
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

  if (shouldShowCv || preview.cv) {
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

  if (cards.length === 0) {
    return null;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={fileValidation.acceptedExtensions
          .map((ext: string) => `.${ext}`)
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
          'grid grid-cols-1 gap-3',
          cards.length === 2 && 'tablet:grid-cols-2',
          className,
        )}
      >
        {cards}
      </div>
    </>
  );
};
