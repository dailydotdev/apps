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
  LfgBadgeMark,
  LfgBadgeSize,
} from '@dailydotdev/shared/src/features/lfg/components/LfgAvatarBadge';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SignalIcon } from '@dailydotdev/shared/src/components/icons/Signal';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { avatar, completion, user } from './providers';
import { BrowserChrome, Phone } from '../open-links-in/kit';

// Tsahi's designs from the proposal video, drawn with production's pieces:
// one green progress ring, one progress card and one dashed CV row, reused
// everywhere the CV is asked for. Copy is his.

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
    }}
  />
);

// The rounded-square avatar with the profile progress drawn around it.
export const RingAvatar = ({
  isLarge,
  hasChip,
  hasLfg,
}: {
  isLarge?: boolean;
  hasChip?: boolean;
  hasLfg?: boolean;
}): ReactElement => (
  <div
    className={
      isLarge ? 'relative size-24 shrink-0 p-1.5' : 'relative size-9 p-1'
    }
  >
    <img
      src={avatar}
      alt=""
      className={
        isLarge
          ? 'size-full rounded-16 object-cover'
          : 'size-full rounded-8 object-cover'
      }
    />
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="24"
        pathLength={100}
        className="fill-none stroke-border-subtlest-tertiary"
        strokeWidth={isLarge ? 3 : 6}
      />
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="24"
        pathLength={100}
        className="fill-none stroke-accent-avocado-default"
        strokeWidth={isLarge ? 3 : 6}
        strokeLinecap="round"
        strokeDasharray={`${progress} 100`}
      />
    </svg>
    {hasChip && !hasLfg && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-8 bg-accent-avocado-default px-2.5 py-1 font-bold text-black typo-caption2">
        {progress}%
      </span>
    )}
    {hasLfg && (
      <span className="absolute inset-1.5 rounded-16 ring-2 ring-accent-avocado-default ring-offset-2 ring-offset-background-default">
        <LfgBadgeMark size={LfgBadgeSize.Ribbon} />
      </span>
    )}
  </div>
);

// The one CV row: the empty Experience section, the empty settings pages
// and Add work experience. Phones get the buttons under the text, with a
// way to finish on a laptop where the CV file is.
export const CvRow = ({
  isPhone,
  title = 'Fill your profile from your CV',
  description = 'Adds work, education, projects and skills. You review it all.',
}: {
  isPhone?: boolean;
  title?: string;
  description?: string | null;
}): ReactElement => {
  const upload = (
    <Button
      variant={ButtonVariant.Primary}
      size={isPhone ? ButtonSize.XSmall : ButtonSize.Small}
      icon={<UploadIcon size={IconSize.Small} />}
    >
      Upload CV
    </Button>
  );

  return (
    <div className="flex items-center gap-3 rounded-12 border border-dashed border-border-subtlest-secondary p-3">
      <span className="flex size-10 shrink-0 items-center justify-center self-start rounded-10 bg-surface-float text-accent-avocado-default">
        <UploadIcon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography type={TypographyType.Callout} bold>
          {title}
        </Typography>
        {description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {isPhone ? description : `${description} Or drop a PDF here.`}
          </Typography>
        )}
        {isPhone && (
          <div className="mt-2 flex gap-2">
            {upload}
            <Button variant={ButtonVariant.Float} size={ButtonSize.XSmall}>
              On my laptop
            </Button>
          </div>
        )}
      </div>
      {!isPhone && upload}
    </div>
  );
};

// The profile's one Experience section while it is empty: the progress the
// ring shows, and the CV row inside it.
export const ExperienceSection = ({
  isPhone,
}: {
  isPhone?: boolean;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <Typography type={TypographyType.Title3} bold>
        Experience
      </Typography>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<PlusIcon />}
      >
        Add
      </Button>
    </div>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Only you see this section until it has something in it.
    </Typography>
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
      <div className="flex items-baseline justify-between gap-2">
        <Typography type={TypographyType.Callout} bold>
          Profile {progress}% done
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Your CV takes it to {progressWithCv}%
        </Typography>
      </div>
      <ProfileProgressBar />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        The ring on your photo shows the same progress
      </Typography>
      <CvRow isPhone={isPhone} />
    </div>
  </section>
);

const LeafHeader = ({ title }: { title: string }): ReactElement => (
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
  </div>
);

const EditMenu = (): ReactElement => (
  <div className="absolute right-0 top-12 z-1 flex w-60 flex-col rounded-14 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
    <button
      type="button"
      className="flex items-center gap-3 rounded-10 px-3 py-2.5 text-left text-text-primary typo-callout hover:bg-surface-float"
    >
      <EditIcon />
      Edit profile details
    </button>
    <button
      type="button"
      className="flex items-center gap-3 rounded-10 px-3 py-2 text-left hover:bg-surface-float"
    >
      <UploadIcon />
      <span className="flex flex-col">
        <span className="text-text-primary typo-callout">Import from CV</span>
        <span className="text-text-tertiary typo-caption1">
          Fills work and education
        </span>
      </span>
    </button>
  </div>
);

// The pencil opens Edit profile details and Import from CV instead of
// going straight to settings.
const ProfileActions = ({
  isMenuOpen: isInitiallyOpen,
}: {
  isMenuOpen?: boolean;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(!!isInitiallyOpen);

  return (
    <div className="relative flex gap-2">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<EditIcon />}
        aria-label="Edit profile"
        pressed={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<LinkIcon />}
        aria-label="Copy profile link"
      />
      {isOpen && <EditMenu />}
    </div>
  );
};

// The LFG ribbon, out of the avatar and into the name row beside the Plus
// mark, so the progress ring and its chip keep the avatar to themselves.
const LfgChip = (): ReactElement => (
  <span className="flex items-center gap-0.5 rounded-8 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-white typo-caption2">
    <SignalIcon size={IconSize.XXSmall} secondary />
    LFG
  </span>
);

const ProfileHead = ({
  isMenuOpen,
  hasLfg,
}: {
  isMenuOpen?: boolean;
  hasLfg?: boolean;
}): ReactElement => (
  <div className="flex flex-col">
    <div className="h-24 rounded-16 bg-gradient-to-r from-accent-onion-default to-accent-cabbage-default" />
    <div className="-mt-12 flex items-end justify-between pl-2">
      <RingAvatar isLarge hasChip />
      <ProfileActions isMenuOpen={isMenuOpen} />
    </div>
    <div className="mt-3 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Typography type={TypographyType.Title2} bold>
          {user.name}
        </Typography>
        <DevPlusIcon
          className="text-action-plus-default"
          size={IconSize.Size16}
        />
        {hasLfg && <LfgChip />}
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        @{user.username}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {user.reputation} Reputation · 0 Followers · 0 Following
      </Typography>
    </div>
  </div>
);

// A laptop browser window with the app's icon rail; the ring sits on the
// rail's avatar too.
const Laptop = ({
  hasRail = true,
  children,
}: {
  hasRail?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className="flex h-[36rem] w-[60rem] max-w-full overflow-hidden rounded-16 border border-border-subtlest-secondary bg-background-default shadow-3">
    {hasRail && (
      <div className="flex w-16 shrink-0 flex-col items-center gap-5 border-r border-border-subtlest-tertiary pt-5 text-text-tertiary">
        <HomeIcon size={IconSize.Medium} />
        <SearchIcon size={IconSize.Medium} />
        <BellIcon size={IconSize.Medium} />
        <RingAvatar />
      </div>
    )}
    <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
  </div>
);

export const ProfilePhone = ({
  isMenuOpen,
  hasLfg,
}: {
  isMenuOpen?: boolean;
  hasLfg?: boolean;
}): ReactElement => (
  <Phone browser={BrowserChrome.None} height={440}>
    <LeafHeader title={user.name} />
    <div className="px-4">
      <ProfileHead isMenuOpen={isMenuOpen} hasLfg={hasLfg} />
    </div>
  </Phone>
);

export const ProfileDesktop = ({
  isMenuOpen,
}: {
  isMenuOpen?: boolean;
}): ReactElement => (
  <Laptop>
    <div className="max-w-[40rem] p-6">
      <ProfileHead isMenuOpen={isMenuOpen} />
    </div>
  </Laptop>
);

export const LfgRing = (): ReactElement => (
  <div className="flex flex-col items-center gap-6 rounded-16 bg-surface-float px-10 py-8">
    <RingAvatar isLarge hasLfg />
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="max-w-56 text-center"
    >
      Today an open LFG post adds its own green ring and this ribbon to the same
      avatar edge.
    </Typography>
  </div>
);

const Field = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="flex flex-col rounded-14 bg-surface-float px-3 py-2">
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
    <Typography type={TypographyType.Callout}>{value}</Typography>
  </div>
);

const AddWorkForm = ({ isPhone }: { isPhone?: boolean }): ReactElement => (
  <div className="flex flex-col gap-3">
    <Typography type={TypographyType.Title3} bold>
      Add work experience
    </Typography>
    <CvRow
      isPhone={isPhone}
      title="Skip the typing: import your CV"
      description={null}
    />
    <Field label="Title" value="Frontend Engineer" />
    <Field label="Company" value="Paperplane" />
    <Field label="Start" value="Mar 2020" />
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      className="self-end"
    >
      Save
    </Button>
  </div>
);

export const AddWorkPhone = (): ReactElement => (
  <Phone browser={BrowserChrome.None} height={560}>
    <LeafHeader title="Settings" />
    <div className="px-4">
      <AddWorkForm isPhone />
    </div>
  </Phone>
);

export const AddWorkDesktop = (): ReactElement => (
  <Laptop hasRail={false}>
    <div className="mx-auto max-w-[27rem] py-8">
      <AddWorkForm />
    </div>
  </Laptop>
);

const MenuRow = ({ label }: { label: string }): ReactElement => (
  <span className="rounded-10 px-3 py-2 text-text-secondary typo-callout">
    {label}
  </span>
);

// The profile menu: the completion card leads with the CV while work and
// education are missing.
const ProfileMenuPanel = (): ReactElement => (
  <div className="flex w-64 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2 shadow-2">
    <div className="flex items-center gap-2 px-1 pt-1">
      <RingAvatar />
      <div className="flex min-w-0 flex-col">
        <Typography type={TypographyType.Callout} bold>
          {user.name}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          @{user.username}
        </Typography>
      </div>
    </div>
    <div className="flex flex-col gap-2 rounded-14 bg-surface-float p-3">
      <div className="flex flex-col">
        <Typography type={TypographyType.Callout} bold>
          Profile {progress}% done
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Your CV fills work and education, +{progressWithCv - progress}%
        </Typography>
      </div>
      <ProfileProgressBar />
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<UploadIcon size={IconSize.Small} />}
      >
        Fill from CV
      </Button>
    </div>
    {['Your profile', 'Settings', 'Appearance', 'Log out'].map((label) => (
      <MenuRow key={label} label={label} />
    ))}
  </div>
);

export const ProfileMenuPhone = (): ReactElement => (
  <Phone browser={BrowserChrome.None} height={560}>
    <div className="flex h-[3.25rem] shrink-0 items-center justify-between px-4">
      <Typography type={TypographyType.Title3} bold>
        daily.dev
      </Typography>
      <RingAvatar />
    </div>
    <div className="px-4 [&>*]:w-full">
      <ProfileMenuPanel />
    </div>
  </Phone>
);

export const ProfileMenuDesktop = (): ReactElement => (
  <Laptop>
    <div className="p-4">
      <ProfileMenuPanel />
    </div>
  </Laptop>
);
