import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
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
  const enabled = isAuthReady && isLoggedIn;
  const showReminder = enabled && reminder.shouldShow;
  const showCv = enabled && shouldShowCv;
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
