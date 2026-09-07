import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { TopHero } from './HeroBottomBanner';
import ReadingReminderCatLaptop from './ReadingReminderCatLaptop';
import { useReadingReminderHero } from '../../../hooks/notifications/useReadingReminderHero';
import {
  fileValidation,
  uploadCvOpportunitySuccessContent,
  uploadCvProfileSuccessContent,
  useUploadCv,
} from '../../../features/profile/hooks/useUploadCv';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useAuthContext } from '../../../contexts/AuthContext';
import { uploadCvBgMobile } from '../../../lib/image';
import { useJobsFeature } from '../../../hooks/useJobsFeature';
import { usePreferredSource } from '../../../hooks/usePreferredSource';
import { GoogleIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { ButtonVariant } from '../../buttons/common';

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

// Deliberately not `illustrationFrameClass`: that frame is wider than it is
// tall (w-32 around a size-24 tile), which leaves 16px of slack on each side.
// Added to the section's own pl-3 that put 28px to the left of the tile against
// 8px above and below it. A square frame removes the slack, and `!pl-2` on the
// section trims the remaining left padding to match `py-2`.
const GoogleIllustration = (): ReactElement => (
  <div
    className="!m-0 flex size-24 shrink-0 items-center justify-center self-center tablet:size-28"
    aria-hidden
  >
    <span className="flex size-24 items-center justify-center rounded-12 bg-surface-float tablet:size-28">
      <GoogleIcon secondary size={IconSize.Size80} />
    </span>
  </div>
);

const CompactReminderCat = (): ReactElement => (
  <ReadingReminderCatLaptop className="!m-0 h-24 w-28 shrink-0 self-center rounded-12 object-contain tablet:h-28 tablet:w-32" />
);

export const useHomepageTopBannersVisibility = ({
  enabled: isEnabled = true,
}: { enabled?: boolean } = {}): {
  showReminder: boolean;
  showCv: boolean;
  showPreferredSource: boolean;
  hasAny: boolean;
} => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const reminder = useReadingReminderHero({
    requireMobile: false,
    enabled: isEnabled,
  });
  const { shouldShow: shouldShowCv } = useUploadCv();
  const { isEligible: showPreferredSource } = usePreferredSource({
    placement: 'homepage hero',
  });
  const enabled = isEnabled && isAuthReady && isLoggedIn;
  const showReminder = enabled && reminder.shouldShow;
  const showCv = enabled && shouldShowCv;
  return {
    showReminder,
    showCv,
    showPreferredSource,
    hasAny: showReminder || showCv || showPreferredSource,
  };
};

type HomepageTopBannersProps = {
  className?: string;
};

export const HomepageTopBanners = ({
  className,
}: HomepageTopBannersProps): ReactElement | null => {
  const reminder = useReadingReminderHero({ requireMobile: false });
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { isJobsEnabled } = useJobsFeature();
  const { onUpload, shouldShow: shouldShowCv } = useUploadCv({
    modalContent: isJobsEnabled
      ? uploadCvOpportunitySuccessContent
      : uploadCvProfileSuccessContent,
  });
  const { completeAction } = useActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preferredSource = usePreferredSource({ placement: 'homepage hero' });

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

  // Last of the three: the reminder and the CV upload are both about the
  // reader's own routine, and this one is a favour to us.
  if (preferredSource.isEligible) {
    cards.push(
      <TopHero
        key="preferred-source"
        // Left padding down to py-2's 8px so the tile sits as far from the
        // card's left edge as it does from its top and bottom.
        className="!pl-2"
        subtitle="Add daily.dev and it shows up more often in Top Stories and AI Overviews."
        ctaLabel="Add as preferred source"
        ctaVariant={ButtonVariant.Primary}
        illustration={<GoogleIllustration />}
        onCtaClick={preferredSource.onAdd}
        onClose={preferredSource.onDismiss}
      />,
    );
  }

  if (shouldShowCv) {
    cards.push(
      <TopHero
        key="cv"
        subtitle={
          isJobsEnabled
            ? 'Upload your CV and let your next job quietly come to you.'
            : 'Upload your CV to autofill your profile in seconds.'
        }
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
