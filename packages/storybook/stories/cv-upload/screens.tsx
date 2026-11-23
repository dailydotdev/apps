import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { ProfileCompletion } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ProfileCompletion';
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  LfgBadgeMark,
  LfgBadgeSize,
} from '@dailydotdev/shared/src/features/lfg/components/LfgAvatarBadge';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { cloudinaryCharmEmptyProfile } from '@dailydotdev/shared/src/lib/image';
import { avatar, completion } from './providers';
import { BrowserChrome, Phone } from '../open-links-in/kit';

// The CV entry points: the ones in production rendered with their own
// components, the new ones drawn with production's pieces. Copy on the new
// ones is a placeholder until product picks the direction.

const noUpload = (): Promise<void> => Promise.resolve();

const LeafHeader = ({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}): ReactElement => (
  <div className="flex h-[3.25rem] shrink-0 items-center gap-3 px-4">
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<ArrowIcon className="-rotate-90" />}
      aria-label="Back"
    />
    <Typography type={TypographyType.Body} bold className="flex-1">
      {title}
    </Typography>
    {action}
  </div>
);

// One row the same size everywhere it appears: the empty sections, the
// form, the edit menu.
export const FillFromCvRow = ({
  title = 'Fill from your CV',
  description = 'PDF or DOCX. We fill in the fields, you review them.',
}: {
  title?: string;
  description?: string;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-action-help-float text-action-help-default">
      <UploadIcon />
    </span>
    <div className="flex min-w-0 flex-1 flex-col">
      <Typography type={TypographyType.Callout} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </div>
    <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
      Upload
    </Button>
  </div>
);

// Today: the 30 and 60-day popover from Customer.io campaign 48. Stopping
// the campaign removes it with the banner; no code change.
export const CampaignPopover = (): ReactElement => (
  <div className="flex w-80 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2">
    <div className="flex items-center justify-between">
      <span className="rounded-6 bg-overlay-float-avocado px-1.5 py-0.5 text-accent-avocado-default typo-caption2">
        Recommended
      </span>
      <MiniCloseIcon className="text-text-tertiary" />
    </div>
    <Typography type={TypographyType.Title3} bold>
      Your skills deserve better job matches
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Upload your CV and we&apos;ll quietly match you with roles that make
      sense. 100% private. No spam.
    </Typography>
    <div className="h-28 rounded-12 bg-surface-float" />
    <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
      Upload your CV
    </Button>
  </div>
);

// A progress ring drawn around the avatar's rounded square.
const Ring = ({ progress }: { progress: number }): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 100 100"
    className="pointer-events-none absolute -inset-1.5 size-[calc(100%+0.75rem)]"
  >
    <rect
      x="2"
      y="2"
      width="96"
      height="96"
      rx="22"
      pathLength={100}
      className="fill-none stroke-border-subtlest-secondary"
      strokeWidth="4"
    />
    <rect
      x="2"
      y="2"
      width="96"
      height="96"
      rx="22"
      pathLength={100}
      className="fill-none stroke-action-help-default"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray={`${progress} 100`}
    />
  </svg>
);

export const AvatarRing = ({ lfg }: { lfg?: boolean }): ReactElement => (
  <div className="flex flex-col items-center gap-6 rounded-16 bg-surface-float px-10 py-8">
    <div className="relative size-[7.5rem]">
      <img src={avatar} alt="" className="size-full rounded-16 object-cover" />
      <Ring progress={completion.percentage} />
      {lfg && <LfgBadgeMark size={LfgBadgeSize.Ribbon} />}
    </div>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="max-w-56 text-center"
    >
      {lfg
        ? 'The LFG ribbon sits on the ring’s bottom edge and breaks it.'
        : 'Profile 40% complete.'}
    </Typography>
  </div>
);

// The profile page on a phone: the edit square opens a menu with Edit
// profile and Import from CV.
export const ProfileEditMenu = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Phone browser={BrowserChrome.None} height={640}>
      <div className="h-28 bg-surface-float" />
      <img
        src={avatar}
        alt=""
        className="absolute left-4 top-16 size-20 rounded-16 object-cover ring-4 ring-background-default"
      />
      <div className="relative flex justify-end gap-2 px-4 pt-2">
        <Button
          variant={ButtonVariant.Float}
          icon={<EditIcon />}
          aria-label="Edit profile"
          pressed={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        />
        {isOpen && (
          <div className="absolute right-4 top-14 z-1 flex w-56 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
            {[
              { label: 'Edit profile', icon: <EditIcon /> },
              { label: 'Import from CV', icon: <UploadIcon /> },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 items-center gap-2 rounded-10 px-3 text-text-secondary typo-callout hover:bg-surface-float hover:text-text-primary"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-4 pt-8">
        <Typography type={TypographyType.Title2} bold>
          Dev Dana
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          @dana
        </Typography>
      </div>
    </Phone>
  );
};

// In production: ExperienceEmptyState, as the profile's Experience section
// and the Work Experience and Education settings pages render it.
export const ExperienceEmpty = ({ title }: { title: string }): ReactElement => (
  <Phone browser={BrowserChrome.None} height={720}>
    <LeafHeader title={title} />
    <div className="flex flex-col items-center px-4">
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Page}
        image={cloudinaryCharmEmptyProfile}
        imageAlt="daily.dev charm with an empty profile"
        title={`No ${title.toLowerCase()} added yet`}
        description="Add it here and it shows on your profile."
        action={{ label: 'Add', icon: <PlusIcon />, onClick: () => undefined }}
      />
      <AutofillProfileBanner
        targetId={TargetId.ProfileSettingsMenu}
        onUpload={noUpload}
        showManualButton={false}
      />
    </div>
  </Phone>
);

const Field = ({ label }: { label: string }): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography type={TypographyType.Footnote} bold>
      {label}
    </Typography>
    <div className="h-12 rounded-14 bg-surface-float" />
  </div>
);

export const AddWorkExperience = (): ReactElement => (
  <Phone browser={BrowserChrome.None} height={720}>
    <LeafHeader
      title="Add work experience"
      action={
        <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
          Save
        </Button>
      }
    />
    <div className="flex flex-col gap-5 px-4 pt-2">
      <FillFromCvRow
        title="Skip the typing"
        description="Upload your CV and we fill in every role."
      />
      <Field label="Title" />
      <Field label="Company" />
      <Field label="Start date" />
      <Field label="Location" />
    </div>
  </Phone>
);

const MenuFrame = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex w-80 flex-col gap-3 rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3">
    {children}
    <div className="flex items-center gap-3 py-1.5">
      <img src={avatar} alt="" className="size-10 rounded-12" />
      <div className="flex flex-col">
        <Typography type={TypographyType.Callout} bold>
          Dev Dana
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          @dana
        </Typography>
      </div>
    </div>
    <div className="h-px bg-border-subtlest-tertiary" />
    {['Profile', 'Settings', 'Appearance'].map((row) => (
      <span key={row} className="px-1 text-text-tertiary typo-callout">
        {row}
      </span>
    ))}
  </div>
);

// In production: the profile menu's ProfileCompletion card, which links to
// the first missing item (here Experience level).
export const MenuCardToday = (): ReactElement => (
  <MenuFrame>
    <ProfileCompletion />
  </MenuFrame>
);

// The same card when work or education is missing: the CV is the action,
// the checklist drops to one line under it.
export const MenuCardCvFirst = (): ReactElement => (
  <MenuFrame>
    <div className="flex flex-col gap-3 rounded-16 border border-action-help-active bg-action-help-float p-4">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography type={TypographyType.Callout} bold>
            Fill your profile from your CV
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
          >
            Work, education and experience level in one upload.
          </Typography>
        </div>
        <ProgressCircle
          progress={completion.percentage}
          size={40}
          showPercentage
          color="help"
        />
        <CloseButton size={ButtonSize.XSmall} />
      </div>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<UploadIcon size={IconSize.Small} />}
      >
        Upload CV
      </Button>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="text-center"
      >
        or add them by hand
      </Typography>
    </div>
  </MenuFrame>
);
