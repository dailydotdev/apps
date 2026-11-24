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
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  LfgBadgeMark,
  LfgBadgeSize,
} from '@dailydotdev/shared/src/features/lfg/components/LfgAvatarBadge';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { avatar, completion } from './providers';
import { BrowserChrome, Phone } from '../open-links-in/kit';

// The new CV entry points, drawn with production's pieces where there is no
// production page to put them on. Copy is a placeholder until product picks
// the direction.

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

// The edit square opens a menu with Edit profile and Import from CV,
// instead of linking straight to settings.
const EditSquare = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative">
      <Button
        variant={ButtonVariant.Float}
        icon={<EditIcon />}
        aria-label="Edit profile"
        pressed={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute right-0 top-12 z-1 flex w-56 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
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
  );
};

const ProfileTop = ({ wide }: { wide?: boolean }): ReactElement => (
  <div className="relative">
    <div className={wide ? 'h-40 bg-surface-float' : 'h-28 bg-surface-float'} />
    <img
      src={avatar}
      alt=""
      className={
        wide
          ? 'absolute left-6 top-24 size-[7.5rem] rounded-16 object-cover'
          : 'absolute left-4 top-16 size-20 rounded-16 object-cover ring-4 ring-background-default'
      }
    />
    <div
      className={
        wide ? 'flex justify-end px-6 pt-3' : 'flex justify-end px-4 pt-2'
      }
    >
      <EditSquare />
    </div>
    <div
      className={
        wide
          ? 'flex flex-col gap-1 px-6 pt-12'
          : 'flex flex-col gap-1 px-4 pt-8'
      }
    >
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
  </div>
);

export const ProfileEditMenu = (): ReactElement => (
  <Phone browser={BrowserChrome.None} height={640}>
    <ProfileTop />
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

const AddWorkFields = (): ReactElement => (
  <>
    <FillFromCvRow
      title="Skip the typing"
      description="Upload your CV and we fill in every role."
    />
    <Field label="Title" />
    <Field label="Company" />
    <Field label="Start date" />
    <Field label="Location" />
  </>
);

const SaveButton = (): ReactElement => (
  <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
    Save
  </Button>
);

export const AddWorkExperience = (): ReactElement => (
  <Phone browser={BrowserChrome.None} height={720}>
    <LeafHeader title="Add work experience" action={<SaveButton />} />
    <div className="flex flex-col gap-5 px-4 pt-2">
      <AddWorkFields />
    </div>
  </Phone>
);

// A laptop browser window with the app's sidebar, for the desktop views.
const Laptop = ({
  path,
  nav,
  children,
}: {
  path: string;
  nav: string[];
  children: ReactNode;
}): ReactElement => (
  <div className="flex h-[36rem] w-[60rem] max-w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-secondary bg-background-default shadow-3">
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-4">
      {[0, 1, 2].map((dot) => (
        <span key={dot} className="size-3 rounded-full bg-surface-float" />
      ))}
      <span className="mx-auto rounded-8 bg-surface-float px-24 py-1 text-text-tertiary typo-caption1">
        app.daily.dev/{path}
      </span>
    </div>
    <div className="flex min-h-0 flex-1">
      <div className="flex w-56 shrink-0 flex-col gap-1 border-r border-border-subtlest-tertiary p-3">
        {nav.map((row, index) => (
          <span
            key={row}
            className={
              index === 0
                ? 'rounded-10 bg-surface-float px-3 py-2 font-bold text-text-primary typo-callout'
                : 'px-3 py-2 text-text-tertiary typo-callout'
            }
          >
            {row}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const settingsNav = ['Work Experience', 'Education', 'Profile', 'Account'];

const SettingsTitle = ({
  title,
  action,
}: {
  title: string;
  action: ReactNode;
}): ReactElement => (
  <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-6 py-4">
    <Typography type={TypographyType.Title3} bold>
      {title}
    </Typography>
    {action}
  </div>
);

export const DesktopProfile = (): ReactElement => (
  <Laptop path="dana" nav={['My feed', 'Explore', 'Bookmarks', 'History']}>
    <div className="mx-auto max-w-[40rem]">
      <ProfileTop wide />
    </div>
  </Laptop>
);

export const DesktopAddWork = (): ReactElement => (
  <Laptop path="settings/profile/experience/edit" nav={settingsNav}>
    <SettingsTitle title="Add work experience" action={<SaveButton />} />
    <div className="flex max-w-[40rem] flex-col gap-5 px-6 py-4">
      <AddWorkFields />
    </div>
  </Laptop>
);

// The same card when work or education is missing: the CV is the action,
// the checklist drops to one line under it.
export const MenuCardCvFirst = (): ReactElement => (
  <div className="w-80 rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3">
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
  </div>
);
