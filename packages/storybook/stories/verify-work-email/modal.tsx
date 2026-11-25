import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
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
import VerifyExperienceModal from '@dailydotdev/shared/src/components/modals/VerifyExperienceModal';

// react-modal hides the app root from screen readers while open, and the
// shared Modal points it at Next's root, which Storybook doesn't have.
if (typeof document !== 'undefined' && !document.getElementById('__next')) {
  const root = document.createElement('div');
  root.id = '__next';
  document.body.appendChild(root);
}

export const MEMBER = { name: 'Maya', username: 'maya' };
export const COMPANY = { name: 'Acme', role: 'Senior Engineer' };

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
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {COMPANY.role}
      </Typography>
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

export type VerifyStep = 'benefits' | 'form';

/**
 * The one modal every entry point opens. It leads with what the badge gets
 * you; "Verify with work email" then opens the production
 * VerifyExperienceModal, unchanged: one form for the email and the code, and
 * a toast for the result. Benefits copy is a placeholder.
 */
export const VerifyBadgeModal = ({
  initialStep = 'benefits',
  onRequestClose,
}: {
  initialStep?: VerifyStep;
  onRequestClose: () => void;
}): ReactElement => {
  const [step, setStep] = useState<VerifyStep>(initialStep);

  if (step === 'form') {
    return <VerifyExperienceModal isOpen onRequestClose={onRequestClose} />;
  }

  return (
    <Modal
      isOpen
      kind={ModalKind.FixedCenter}
      size={ModalSize.Small}
      isDrawerOnMobile
      onRequestClose={onRequestClose}
    >
      <ModalHeader title="Get your verified badge" />
      <ModalBody>
        <div className="flex flex-col gap-4">
          <NamePreview isVerified={false} />
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
              onClick={() => setStep('form')}
            >
              Verify with work email
            </Button>
            <Button variant={ButtonVariant.Tertiary} onClick={onRequestClose}>
              Not now
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
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
