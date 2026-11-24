import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  JobIcon,
  PlusIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { VerifiedBadge } from '@dailydotdev/shared/src/features/profile/components/experience/VerifiedBadge';
import { Avatar, COMPANY, CompanyLogo, MEMBER, VerifyButton } from './modal';

// Each surface is a slice of the real page, drawn with the app's tokens,
// with the new ask where it would sit. `onVerify` opens the shared modal.
type SurfaceProps = { onVerify: () => void };

const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4',
      className,
    )}
  >
    {children}
  </div>
);

/** The ask itself: one line on what you get, one button. */
const AskRow = ({
  children,
  onVerify,
  label,
}: SurfaceProps & { children: ReactNode; label?: string }): ReactElement => (
  <div className="flex flex-wrap items-center gap-3 rounded-12 bg-surface-float p-3">
    <CompanyLogo className="size-6" />
    <Typography
      className="min-w-0 flex-1"
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
    >
      {children}
    </Typography>
    <VerifyButton label={label} onClick={onVerify} />
  </div>
);

const JobLine = ({ isVerified = false }: { isVerified?: boolean }) => (
  <div className="flex gap-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-float">
      <CompanyLogo className="size-5" />
    </span>
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex flex-wrap items-center gap-1">
        <Typography type={TypographyType.Subhead} bold>
          {COMPANY.role}
        </Typography>
        <span className="rounded-4 bg-surface-float px-1.5 py-[1px] text-text-tertiary typo-caption2">
          Current
        </span>
        {isVerified && <VerifiedBadge />}
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        {COMPANY.name}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Mar 2023 – Present
      </Typography>
    </div>
  </div>
);

/** 1. Settings › Experience, the moment a current job is saved. */
export const AfterSavingJob = ({ onVerify }: SurfaceProps): ReactElement => (
  <Card>
    <div className="flex items-center gap-2 rounded-12 bg-accent-avocado-flat px-3 py-2 text-accent-avocado-default">
      <VIcon size={IconSize.Small} />
      <Typography type={TypographyType.Footnote} bold>
        Job saved
      </Typography>
    </div>
    <JobLine />
    <AskRow onVerify={onVerify}>
      Put the {COMPANY.name} logo next to your name.
    </AskRow>
  </Card>
);

/**
 * 2. Your profile's Experience list. The "Verify company" chip already opens
 * VerifyExperienceModal here; the row replaces it with the new modal.
 */
export const UnverifiedJobRow = ({ onVerify }: SurfaceProps): ReactElement => (
  <Card>
    <Typography type={TypographyType.Body} bold>
      Experience
    </Typography>
    <JobLine />
    <AskRow onVerify={onVerify}>
      Not verified yet. Add a Verified tag to this job.
    </AskRow>
  </Card>
);

/** 3. Your own profile header, where a verified member's company sits. */
export const ProfileHeaderChip = ({ onVerify }: SurfaceProps): ReactElement => (
  <Card>
    <div className="h-16 rounded-12 bg-surface-float" />
    <div className="-mt-10 flex flex-col gap-2 px-2">
      <Avatar className="size-16 border-4 border-background-default typo-title2" />
      <div className="flex flex-wrap items-center gap-2">
        <Typography type={TypographyType.Title3} bold>
          {MEMBER.name}
        </Typography>
        <button
          type="button"
          onClick={onVerify}
          className="flex items-center gap-1 rounded-8 border border-dashed border-border-subtlest-secondary px-2 py-0.5 text-text-secondary typo-footnote hover:border-text-link hover:text-text-link"
        >
          <PlusIcon size={IconSize.Size16} />
          Add badge
        </button>
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        @{MEMBER.username} · {COMPANY.role} at {COMPANY.name}
      </Typography>
    </div>
  </Card>
);

/** 4. Right after a CV upload fills in the profile. */
export const AfterCvUpload = ({ onVerify }: SurfaceProps): ReactElement => (
  <Card>
    <div className="flex flex-col gap-1">
      <Typography type={TypographyType.Body} bold>
        Your profile is filled in
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        From your CV: 3 jobs, 2 schools, 14 skills.
      </Typography>
    </div>
    <ol className="flex flex-col gap-2">
      {['Upload your CV', 'Check what we added'].map((label) => (
        <li
          key={label}
          className="flex items-center gap-2 text-text-tertiary typo-footnote"
        >
          <VIcon size={IconSize.Size16} className="text-accent-avocado-default" />
          <span className="line-through">{label}</span>
        </li>
      ))}
    </ol>
    <AskRow onVerify={onVerify} label="Verify">
      <strong className="text-text-primary">Next:</strong> verify your job at{' '}
      {COMPANY.name}.
    </AskRow>
  </Card>
);

/**
 * 5. Someone else's verified badge. Today it's a tooltip that points to
 * account settings; here it gets a button.
 */
export const OthersBadge = ({ onVerify }: SurfaceProps): ReactElement => (
  <Card>
    <div className="flex gap-3">
      <Avatar name="Dana" className="size-8 typo-footnote" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <Typography type={TypographyType.Footnote} bold>
            Dana
          </Typography>
          <span className="flex items-center gap-1 rounded-6 bg-surface-float px-1 ring-1 ring-text-link">
            <CompanyLogo name="Globex" className="size-4" />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              Globex
            </Typography>
          </span>
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          We moved our CI to ephemeral runners last quarter…
        </Typography>
      </div>
    </div>
    {/* The badge's tooltip, held open. */}
    <div className="ml-11 flex w-64 max-w-full flex-col gap-2 rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-2 font-medium text-text-primary shadow-2 typo-caption1">
      <span>Verified as a Globex employee.</span>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.XSmall}
        icon={<JobIcon />}
        className="self-start"
        onClick={onVerify}
      >
        Get your badge
      </Button>
    </div>
  </Card>
);
