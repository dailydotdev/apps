import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  ArrowIcon,
  MailIcon,
  LockIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  providerMap,
  SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
import { Labeled, Page, Section } from '../kit';

// Static stand-ins built from the real buttons, icons and tokens, so options
// that don't exist in code yet can sit next to each other at the real size.
export const MockPopup = ({
  title,
  back,
  footer,
  sheet,
  children,
}: {
  title?: string;
  back?: boolean;
  footer?: ReactNode;
  sheet?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex w-full max-w-[25rem] flex-col overflow-hidden border border-border-subtlest-tertiary bg-background-default text-text-primary',
      sheet ? 'mt-auto rounded-t-24' : 'h-[40rem] rounded-16',
    )}
  >
    {title !== undefined && (
      <header className="flex h-14 items-center gap-2 border-b border-border-subtlest-tertiary pl-4 pr-2">
        {back && (
          <Button
            aria-label="Back"
            icon={<ArrowIcon className="-rotate-90" />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        )}
        <h3 className="flex-1 font-bold typo-body">{title}</h3>
        <CloseButton size={ButtonSize.Medium} />
      </header>
    )}
    <div className="flex flex-1 flex-col gap-3 px-6 py-6">{children}</div>
    {footer && (
      <footer className="flex h-[3.25rem] items-center justify-center gap-1 border-t border-border-subtlest-tertiary text-text-tertiary typo-callout">
        {footer}
      </footer>
    )}
  </div>
);

export const MockPhone = ({
  children,
  sheet,
}: {
  children: ReactNode;
  sheet?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex h-[41.5rem] w-full max-w-[24.375rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary',
      sheet ? 'bg-overlay-quaternary-onion p-0' : 'bg-background-default',
    )}
  >
    {children}
  </div>
);

export type MockProvider = `${SocialProvider}` | 'email';

export const ProviderButton = ({
  provider,
  variant = ButtonVariant.Primary,
}: {
  provider: MockProvider;
  variant?: ButtonVariant;
}): ReactElement => {
  const isEmail = provider === 'email';
  const icon = isEmail ? (
    <MailIcon secondary size={IconSize.Medium} />
  ) : (
    React.cloneElement(providerMap[provider as SocialProvider].icon, {
      size: IconSize.Medium,
    })
  );

  return (
    <Button
      className="w-full"
      icon={icon}
      size={ButtonSize.Large}
      tabIndex={-1}
      variant={variant}
    >
      Continue with{' '}
      {isEmail ? 'email' : providerMap[provider as SocialProvider].label}
    </Button>
  );
};

export const ProviderList = ({
  providers,
  lead,
}: {
  providers: MockProvider[];
  // Unset: every button white. 'none': every button outlined.
  lead?: MockProvider | 'none';
}): ReactElement => (
  <div className="flex flex-col gap-4">
    {providers.map((provider) => (
      <ProviderButton
        key={provider}
        provider={provider}
        variant={
          !lead || provider === lead
            ? ButtonVariant.Primary
            : ButtonVariant.Secondary
        }
      />
    ))}
  </div>
);

export const ALL_PROVIDERS: MockProvider[] = [
  SocialProvider.Google,
  SocialProvider.GitHub,
  SocialProvider.Apple,
  SocialProvider.Facebook,
];

export const LegalLine = (): ReactElement => (
  <p className="text-center text-text-secondary typo-caption1">
    By continuing, you agree to the <u>Terms of Service</u> and{' '}
    <u>Privacy Policy</u>.
  </p>
);

export const FooterLink = ({
  text,
  link,
}: {
  text: string;
  link: string;
}): ReactElement => (
  <>
    {text}
    <u className="text-text-primary">{link}</u>
  </>
);

export const Divider = (): ReactElement => (
  <div className="flex items-center gap-3 text-text-quaternary typo-callout">
    <span className="h-px flex-1 bg-border-subtlest-tertiary" />
    or
    <span className="h-px flex-1 bg-border-subtlest-tertiary" />
  </div>
);

export const MockField = ({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}): ReactElement => (
  <div className="flex h-12 items-center gap-2 rounded-14 border border-border-subtlest-tertiary bg-surface-float px-4 text-text-secondary typo-body">
    {icon}
    {label}
  </div>
);

export const EmailField = (): ReactElement => (
  <MockField
    label="Email"
    icon={<MailIcon aria-hidden size={IconSize.Small} />}
  />
);

export const PasswordField = (): ReactElement => (
  <MockField
    label="Password"
    icon={<LockIcon aria-hidden size={IconSize.Small} />}
  />
);

export const SecurityCheck = (): ReactElement => (
  <div className="mx-auto flex h-16 w-[18.75rem] items-center gap-3 border border-border-subtlest-secondary bg-surface-float px-3 text-text-secondary typo-callout">
    <span className="size-6 border-2 border-border-subtlest-primary" />
    <span className="flex-1">Verify you are human</span>
    <span className="font-bold text-text-tertiary typo-caption2">
      CLOUDFLARE
    </span>
  </div>
);

export const Note = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="text-center text-text-tertiary typo-footnote">{children}</p>
);

export interface DecisionOption {
  label: string;
  recommended?: boolean;
  mock: ReactNode;
  caption?: ReactNode;
}

// One open question: what's true today, the options mocked side by side, and
// the recommendation with its reasoning.
export const DecisionPage = ({
  number,
  title,
  question,
  today,
  options,
  recommendation,
  why,
  cost,
  children,
}: {
  number: number;
  title: string;
  question: string;
  today: ReactNode;
  options: DecisionOption[];
  recommendation: ReactNode;
  why: ReactNode[];
  cost: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <Page
    eyebrow={`Still to decide ${number} · ${question}`}
    title={title}
    goal={today}
  >
    <section className="flex flex-col gap-3 rounded-16 border border-accent-avocado-default p-5">
      <p className="self-start rounded-8 bg-accent-avocado-default px-2 py-0.5 font-bold text-white typo-caption1">
        Recommendation
      </p>
      <div className="font-bold typo-title3">{recommendation}</div>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
        {why.map((reason, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>{reason}</li>
        ))}
      </ul>
      <p className="text-text-tertiary typo-footnote">
        <strong>Cost:</strong> {cost}
      </p>
    </section>
    <Section title="Options">
      <div className="grid grid-cols-1 items-start gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
        {options.map(({ label, recommended, mock, caption }) => (
          <Labeled
            key={label}
            label={recommended ? `${label} · recommended` : label}
            tone={recommended ? 'proposed' : 'neutral'}
            caption={caption}
          >
            {mock}
          </Labeled>
        ))}
      </div>
    </Section>
    {children}
  </Page>
);
