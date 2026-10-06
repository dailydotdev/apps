import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import type { AuthTriggersType } from '../../lib/auth';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import AuthOptions from './AuthOptions';
import { AuthDisplay } from './common';

const gradientStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, var(--theme-accent-cabbage-default) 0%, var(--theme-accent-onion-default) 30%, var(--theme-accent-water-default) 60%, var(--theme-accent-cabbage-default) 100%)',
  backgroundSize: '200% auto',
  animation: 'signup-widget-gradient-shift 10s ease-in-out infinite',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

/*
 * Reaching into the auth form, because the prop that would do this politely
 * (`className.onboardingSignup`) is declared on OnboardingRegistrationForm and
 * never read, and wiring it up would move three other surfaces that pass it
 * today expecting nothing to happen.
 *
 * `overflow-visible` is the one that matters: the form's own `overflow-y-auto`
 * reserves a scrollbar gutter, which leaves the provider buttons a dozen pixels
 * narrower than everything else in the column and reads as clipped corners.
 */
const denseContainer =
  '!overflow-visible [&_ul]:!gap-2 [&_[aria-label="Login/Register options"]]:!gap-2 [&_[aria-label="Signup using email"]]:!mb-0';

interface SignupWidgetProps {
  title: string;
  description: string;
  children?: ReactNode;
  /** Which surface is asking, for the analytics on the resulting signup. */
  trigger: AuthTriggersType;
  /**
   * For a column that is already full. Drops the card chrome and takes the
   * heading and the provider buttons down a size, enough to fit under a
   * ranking without putting the rail into a scroll. The legal strip stays.
   */
  dense?: boolean;
  centered?: boolean;
  className?: string;
}

/**
 * A signup card that does the signing up: the real social buttons, in place,
 * rather than a button that opens the modal. Fluid: it has been asked to hold
 * a 340px post sidebar and a 320px one, and the provider buttons shrink to fit.
 *
 * Copy is the caller's, because the argument for making an account is only ever
 * as good as the thing the reader is already looking at.
 */
export function SignupWidget({
  title,
  description,
  trigger,
  dense,
  centered = false,
  className,
  children,
}: SignupWidgetProps): ReactElement {
  const { showLogin } = useAuthContext();

  return (
    <div
      className={classNames(
        'flex flex-col',
        !dense && 'rounded-16 border border-border-subtlest-tertiary',
        !dense && !centered && 'p-4',
        centered &&
          'relative isolate items-center overflow-hidden bg-background-subtle px-5 py-8 text-center tablet:px-8 tablet:py-10',
        className,
      )}
    >
      {centered && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-1 h-40 bg-gradient-to-b from-theme-overlay-active-cabbage to-transparent"
        />
      )}
      <style>
        {`@keyframes signup-widget-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }`}
      </style>
      <h3
        className={classNames(
          'font-bold',
          !centered && (dense ? 'typo-callout' : 'typo-title3'),
          centered && 'max-w-lg text-balance typo-title2 tablet:typo-title1',
        )}
        style={gradientStyle}
      >
        {title}
      </h3>
      <p
        className={classNames(
          'text-text-tertiary',
          !centered && (dense ? 'mt-1 typo-caption1' : 'mt-2 typo-footnote'),
          centered && 'mt-3 max-w-sm text-balance typo-callout',
        )}
      >
        {description}
      </p>
      {children}
      <div
        className={classNames(
          centered && 'mt-6 w-full max-w-[26.25rem]',
          !centered && (dense ? 'mt-3' : 'mt-4'),
        )}
      >
        <AuthOptions
          ignoreMessages
          formRef={null as unknown as React.MutableRefObject<HTMLFormElement>}
          trigger={trigger}
          simplified
          defaultDisplay={AuthDisplay.OnboardingSignup}
          forceDefaultDisplay
          signupStyle={centered ? 'singlePrimary' : undefined}
          onAuthStateUpdate={(props) => {
            showLogin({
              trigger,
              options: {
                isLogin: !!props.isLoginFlow,
                defaultDisplay: props.defaultDisplay,
                formValues: props.email ? { email: props.email } : undefined,
              },
            });
          }}
          onboardingSignupButton={{
            variant: ButtonVariant.Primary,
            size: dense ? ButtonSize.Small : ButtonSize.Medium,
          }}
          className={{
            container: classNames(
              centered && '!min-h-0 !overflow-visible',
              !centered && dense && denseContainer,
            ),
          }}
          hideLoginLink
          compact
        />
      </div>
    </div>
  );
}
