import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons/Info';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons/MoveTo';
import { SignalIcon } from '@dailydotdev/shared/src/components/icons/Signal';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { completion } from './providers';

// The new pieces from Tsahi's proposal video, built from production's
// components so they can sit on the production pages in frames.tsx: one
// progress ring, one progress card and one dashed CV row.

const progress = completion.percentage;
const progressWithCv = 80;

// The profile's own progress bar, as the achievement cards draw it.
const ProfileProgressBar = (): ReactElement => (
  <ProgressBar
    percentage={progress}
    shouldShowBg
    className={{
      wrapper: 'h-1.5 rounded-14',
      bar: 'h-full rounded-14',
      barColor: 'bg-brand-default',
    }}
  />
);

// The profile progress around the avatar, for ProfileHeader's avatarBadge
// slot, which covers the avatar exactly. The chip sits centered on the
// ring's bottom edge.
export const ProgressRing = ({
  hasChip = true,
}: {
  hasChip?: boolean;
}): ReactElement => (
  <>
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="absolute -inset-1.5 size-[calc(100%+0.75rem)]"
    >
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="20"
        pathLength={100}
        className="fill-none stroke-accent-pepper-subtler"
        strokeWidth="4"
      />
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="20"
        pathLength={100}
        className="fill-none stroke-brand-default"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${progress} 100`}
      />
    </svg>
    {hasChip && (
      <span className="absolute left-1/2 top-[calc(100%+0.25rem)] -translate-x-1/2 -translate-y-1/2 rounded-8 bg-brand-default px-2.5 py-1 font-bold text-white typo-caption2">
        {progress}%
      </span>
    )}
  </>
);

// LfgBadgeMark's ribbon, out of the avatar and into the name row.
export const LfgChip = (): ReactElement => (
  <span className="flex items-center gap-0.5 rounded-8 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-raw-pepper-90 typo-caption2">
    <SignalIcon size={IconSize.XXSmall} secondary />
    LFG
  </span>
);

// The one CV row: the empty settings pages and Add work experience, and
// bare inside the profile's progress card. Phones get the button under the
// text.
export const CvRow = ({
  isPhone,
  isBare,
  title = 'Fill your profile from your CV',
  description = 'Adds work, education, projects and skills. You review it all.',
}: {
  isPhone?: boolean;
  // Inside a card that already frames it.
  isBare?: boolean;
  title?: string | null;
  description?: string | null;
}): ReactElement => {
  const upload = (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<UploadIcon />}
    >
      Upload CV
    </Button>
  );

  return (
    <div
      className={
        isBare
          ? 'flex items-center gap-3'
          : 'flex items-center gap-3 rounded-12 border border-dashed border-border-subtlest-secondary p-3'
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && (
          <Typography type={TypographyType.Callout} bold>
            {title}
          </Typography>
        )}
        {description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {isPhone ? description : `${description} Or drop a PDF here.`}
          </Typography>
        )}
        {isPhone && <div className="mt-2 flex">{upload}</div>}
      </div>
      {!isPhone && upload}
    </div>
  );
};

// The profile's one Experience section while it is empty, headed like
// UserExperienceList: the progress the ring shows, and the CV row.
export const ExperienceSection = ({
  isPhone,
}: {
  isPhone?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-3 py-4">
    <div className="flex flex-row items-center justify-between">
      <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
        Experience
      </Typography>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={<EditIcon />}
        aria-label="Edit Experience"
      />
    </div>
    <div className="flex flex-col gap-3 rounded-12 border border-dashed border-border-subtlest-secondary p-3">
      <Typography type={TypographyType.Callout} bold>
        Profile {progress}% done
      </Typography>
      <ProfileProgressBar />
      <CvRow isPhone={isPhone} isBare title={null} />
    </div>
  </div>
);

// ProfileCompletion's card with the CV as its action while work or
// education is missing, in place of the link to the first missing item.
export const CvCompletionCard = (): ReactElement => (
  <div className="flex flex-col border border-action-help-active bg-action-help-float laptop:rounded-16">
    <div className="flex justify-end px-2 pt-2">
      <CloseButton size={ButtonSize.XSmall} />
    </div>
    <div className="flex flex-col gap-3 p-4 pt-0">
      <div className="flex w-full items-center gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1">
            <InfoIcon size={IconSize.XSmall} className="text-text-secondary" />
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
            >
              Profile Completion
            </Typography>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <MoveToIcon
              size={IconSize.XSmall}
              className="shrink-0 text-text-secondary"
            />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
            >
              Your CV fills work and education, +{progressWithCv - progress}%
            </Typography>
          </div>
        </div>
        <div className="flex shrink-0 leading-none">
          <ProgressCircle
            progress={progress}
            size={50}
            showPercentage
            color="help"
          />
        </div>
      </div>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<UploadIcon />}
      >
        Fill from CV
      </Button>
    </div>
  </div>
);
