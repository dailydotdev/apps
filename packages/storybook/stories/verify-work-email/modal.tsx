import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
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

// Real companies from the company table that have verified members, to
// show the badge works for any employer.
const companies = [
  {
    name: 'Google',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--S6zPbHD8--/f_auto/v1725262174/companies/google',
  },
  {
    name: 'Microsoft',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--RCg9CN2x--/f_auto/v1724917153/companies/microsoft',
  },
  {
    name: 'Amazon',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/s--yE0b9Mhz--/f_auto/v1725357243/companies/OiNYYeZQ_400x400',
  },
  {
    name: 'Meta',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--Gyqx2xMJ--/f_auto/v1731153028/companies/meta',
  },
  {
    name: 'Spotify',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--MFBPdz-Z--/f_auto/v1724959205/companies/spotify',
  },
  {
    name: 'Shopify',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--HIsiXx1a--/f_auto/v1725006297/companies/shopify',
  },
  {
    name: 'Stripe',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--O0Pomokl--/f_auto/v1726673397/companies/stripe',
  },
  {
    name: 'Atlassian',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s---mQsnJll--/f_auto/v1725303227/companies/atlassian',
  },
];

type Company = (typeof companies)[number];

const CYCLE_MS = 2200;
const FADE_MS = 300;

/**
 * Steps through the companies, fading between them. Holds on the first one
 * when the viewer prefers reduced motion.
 */
const useCyclingCompany = (): { company: Company; isShown: boolean } => {
  const [index, setIndex] = useState(0);
  const [isShown, setIsShown] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let swap: ReturnType<typeof setTimeout>;
    const tick = setInterval(() => {
      setIsShown(false);
      swap = setTimeout(() => {
        setIndex((current) => (current + 1) % companies.length);
        setIsShown(true);
      }, FADE_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(swap);
    };
  }, []);

  return { company: companies[index], isShown };
};

const fade = (isShown: boolean): string =>
  classNames(
    'transition-opacity duration-300',
    isShown ? 'opacity-100' : 'opacity-0',
  );

const CompanyImage = ({
  company,
  className,
}: {
  company: Company;
  className: string;
}): ReactElement => (
  <img
    src={company.image}
    alt=""
    className={classNames('shrink-0 rounded-full bg-white object-cover', className)}
  />
);

/** The member's name as others will see it once verified. */
const NamePreview = ({
  company,
  isShown,
}: {
  company: Company;
  isShown: boolean;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3">
    <Avatar />
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <Typography type={TypographyType.Callout} bold>
          {MEMBER.name}
        </Typography>
        <span className={classNames('flex items-center gap-1', fade(isShown))}>
          <CompanyImage company={company} className="size-4" />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {company.name}
          </Typography>
        </span>
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

const benefits = (
  company: Company,
  isShown: boolean,
): Array<{ icon: ReactNode; title: string; note: string }> => [
  {
    icon: (
      <span className={fade(isShown)}>
        <CompanyImage company={company} className="size-5" />
      </span>
    ),
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
  const { company, isShown } = useCyclingCompany();

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
          <NamePreview company={company} isShown={isShown} />
          <ul className="flex flex-col gap-3">
            {benefits(company, isShown).map(({ icon, title, note }) => (
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
