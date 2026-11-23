import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalBody } from '@dailydotdev/shared/src/components/modals/common/ModalBody';
import { ModalHeader } from '@dailydotdev/shared/src/components/modals/common/ModalHeader';
import {
  ModalKind,
  ModalSize,
} from '@dailydotdev/shared/src/components/modals/common/types';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { CodeField } from '@dailydotdev/shared/src/components/fields/CodeField';
import {
  EyeIcon,
  JobIcon,
  MailIcon,
  ShieldCheckIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { VerifiedBadge } from '@dailydotdev/shared/src/features/profile/components/experience/VerifiedBadge';

// react-modal hides the app root from screen readers while open, and the
// shared Modal points it at Next's root, which Storybook doesn't have.
if (typeof document !== 'undefined' && !document.getElementById('__next')) {
  const root = document.createElement('div');
  root.id = '__next';
  document.body.appendChild(root);
}

// The modal turns into a drawer on phones, and the drawer's portal reads the
// query client.
const queryClient = new QueryClient();

export const MEMBER = { name: 'Maya', username: 'maya' };
export const COMPANY = { name: 'Acme', role: 'Senior Engineer' };
export const WORK_EMAIL = 'maya@acme.com';

/** A stand-in company logo, so the stories need no network. */
export const CompanyLogo = ({
  name = COMPANY.name,
  className = 'size-4',
}: {
  name?: string;
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-full bg-accent-cabbage-default font-bold text-white typo-caption2',
      className,
    )}
  >
    {name[0]}
  </span>
);

export const Avatar = ({
  name = MEMBER.name,
  className = 'size-10',
}: {
  name?: string;
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-12 bg-accent-bun-default font-bold text-white typo-callout',
      className,
    )}
  >
    {name[0]}
  </span>
);

/** The member's name as others will see it once verified. */
const NamePreview = ({ isVerified }: { isVerified: boolean }): ReactElement => (
  <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3">
    <Avatar />
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <Typography type={TypographyType.Callout} bold>
          {MEMBER.name}
        </Typography>
        <CompanyLogo
          className={classNames(
            'size-4 transition-opacity',
            !isVerified && 'opacity-40',
          )}
        />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          {COMPANY.name}
        </Typography>
      </div>
      <div className="flex items-center gap-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {COMPANY.role}
        </Typography>
        <span className={classNames(!isVerified && 'opacity-40')}>
          <VerifiedBadge />
        </span>
      </div>
    </div>
  </div>
);

const benefits: Array<{ icon: ReactNode; title: string; note: string }> = [
  {
    icon: <CompanyLogo className="size-5" />,
    title: 'Your company logo next to your name',
    note: 'On your posts, comments and profile.',
  },
  {
    icon: <ShieldCheckIcon size={IconSize.Small} />,
    title: 'A Verified tag on your job',
    note: 'People know your experience is real.',
  },
  {
    icon: <EyeIcon size={IconSize.Small} />,
    title: 'Visible to recruiters',
    note: 'Verified jobs stand out when they look for people like you.',
  },
];

export type VerifyStep = 'benefits' | 'email' | 'code' | 'verified' | 'pending';

const titles: Record<VerifyStep, string> = {
  benefits: 'Get your verified badge',
  email: 'Your work email',
  code: 'Check your inbox',
  verified: 'You’re verified',
  pending: 'Almost there',
};

/**
 * The one modal every entry point opens. It leads with what the badge gets
 * you, then runs the same email and code steps as VerifyExperienceModal.
 * Copy is a placeholder.
 */
export const VerifyBadgeModal = ({
  isOpen = true,
  initialStep = 'benefits',
  isKnownCompany = true,
  onRequestClose,
}: {
  isOpen?: boolean;
  initialStep?: VerifyStep;
  /** Registered companies verify at once; new ones wait for a review. */
  isKnownCompany?: boolean;
  onRequestClose: () => void;
}): ReactElement => {
  const [step, setStep] = useState<VerifyStep>(initialStep);
  const [email, setEmail] = useState(WORK_EMAIL);
  const [code, setCode] = useState('');
  const isDone = step === 'verified' || step === 'pending';

  return (
    <QueryClientProvider client={queryClient}>
      <Modal
        isOpen={isOpen}
        kind={ModalKind.FixedCenter}
        size={ModalSize.Small}
        isDrawerOnMobile
        onRequestClose={onRequestClose}
      >
        <ModalHeader title={titles[step]} />
        <ModalBody>
          <div className="flex flex-col gap-4">
            {(step === 'benefits' || isDone) && (
              <NamePreview isVerified={step === 'verified'} />
            )}

            {step === 'benefits' && (
              <>
                <ul className="flex flex-col gap-3">
                  {benefits.map(({ icon, title, note }) => (
                    <li key={title} className="flex gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-primary">
                        {icon}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <Typography type={TypographyType.Callout} bold>
                          {title}
                        </Typography>
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Tertiary}
                        >
                          {note}
                        </Typography>
                      </div>
                    </li>
                  ))}
                </ul>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Free. Takes a minute: we send a code to your work email.
                </Typography>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={ButtonVariant.Primary}
                    icon={<MailIcon />}
                    onClick={() => setStep('email')}
                  >
                    Verify with work email
                  </Button>
                  <Button
                    variant={ButtonVariant.Tertiary}
                    onClick={onRequestClose}
                  >
                    Not now
                  </Button>
                </div>
              </>
            )}

            {step === 'email' && (
              <>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Use the email you have at {COMPANY.name}. We’ll send it a
                  6-digit code.
                </Typography>
                <TextField
                  leftIcon={<MailIcon />}
                  type="email"
                  inputId="verify_work_email"
                  name="work_email"
                  label="Work email"
                  value={email}
                  valueChanged={setEmail}
                />
                <Button
                  variant={ButtonVariant.Primary}
                  disabled={!email}
                  onClick={() => setStep('code')}
                >
                  Send code
                </Button>
              </>
            )}

            {step === 'code' && (
              <>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  We sent a code to <strong>{email}</strong>.{' '}
                  <button
                    type="button"
                    className="text-text-link"
                    onClick={() => setStep('email')}
                  >
                    Change email
                  </button>
                </Typography>
                <CodeField onChange={setCode} onSubmit={setCode} />
                <Button
                  variant={ButtonVariant.Primary}
                  disabled={code.length < 6}
                  onClick={() => setStep(isKnownCompany ? 'verified' : 'pending')}
                >
                  Verify
                </Button>
              </>
            )}

            {step === 'verified' && (
              <>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  The {COMPANY.name} logo now shows next to your name, and your
                  job has a Verified tag.
                </Typography>
                <Button variant={ButtonVariant.Primary} onClick={onRequestClose}>
                  See my profile
                </Button>
              </>
            )}

            {step === 'pending' && (
              <>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  {COMPANY.name} is new to us, so we’ll review it shortly. We’ll
                  let you know when your badge is live.
                </Typography>
                <Button variant={ButtonVariant.Primary} onClick={onRequestClose}>
                  Got it
                </Button>
              </>
            )}
          </div>
        </ModalBody>
      </Modal>
    </QueryClientProvider>
  );
};

/** A small primary trigger that opens the modal, used by every surface. */
export const VerifyButton = ({
  label = 'Verify',
  onClick,
}: {
  label?: string;
  onClick: () => void;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Primary}
    size={ButtonSize.Small}
    icon={<JobIcon />}
    onClick={onClick}
  >
    {label}
  </Button>
);
