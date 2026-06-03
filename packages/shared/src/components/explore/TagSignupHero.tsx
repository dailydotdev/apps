import type { MutableRefObject, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import AuthOptions from '../auth/AuthOptions';
import type { AuthOptionsProps } from '../auth/common';
import { AuthDisplay } from '../auth/common';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface TagSignupHeroProps {
  tag: string;
  className?: string;
}

const TARGET_ID = 'tag_page';

// A signup-first hero shown above everything on a tag page for logged-out
// visitors — the same "Where developers make every tab count" auth surface as
// the new-tab hijacking strip (#6127), inline and compact. The social options
// (Google / GitHub / email) come from the shared AuthOptions onboarding-signup
// display. Renders nothing when logged in.
export function TagSignupHero({
  tag,
  className,
}: TagSignupHeroProps): ReactElement | null {
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const formRef = useRef<HTMLFormElement>(null);
  const impressionLogged = useRef(false);

  const show = isAuthReady && !isLoggedIn;

  useEffect(() => {
    if (show && !impressionLogged.current) {
      impressionLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.SignupButton,
        target_id: TARGET_ID,
      });
    }
  }, [show, logEvent]);

  if (!show) {
    return null;
  }

  const onAuthStateUpdate: AuthOptionsProps['onAuthStateUpdate'] = (props) => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: props.isLoginFlow
        ? TargetType.LoginButton
        : TargetType.SignupButton,
      target_id: TARGET_ID,
    });
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: {
        isLogin: !!props.isLoginFlow,
        defaultDisplay: props.defaultDisplay,
        formValues: props.email ? { email: props.email } : undefined,
      },
    });
  };

  return (
    <aside
      className={classNames(
        'relative overflow-hidden rounded-16 border border-border-subtlest-tertiary',
        className,
      )}
    >
      <picture>
        <source
          media="(max-width: 655px)"
          srcSet={cloudinaryOnboardingFullBackgroundMobile}
        />
        <source
          media="(min-width: 656px)"
          srcSet={cloudinaryOnboardingFullBackgroundDesktop}
        />
        <img
          alt=""
          aria-hidden
          role="presentation"
          src={cloudinaryOnboardingFullBackgroundDesktop}
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      </picture>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-overlay-primary-pepper"
      />
      <div className="dark relative z-1 mx-auto flex w-full max-w-screen-tablet flex-col items-center gap-4 px-6 py-8 text-center">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
          center
        >
          Where developers make every tab count.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          center
          className="max-w-[28rem]"
        >
          Sign up to follow {tag} and turn daily.dev into your personalized
          feed.
        </Typography>
        <div className="w-full max-w-[22rem] rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 backdrop-blur-md">
          <AuthOptions
            ignoreMessages
            compact
            simplified
            forceDefaultDisplay
            defaultDisplay={AuthDisplay.OnboardingSignup}
            trigger={AuthTriggers.Onboarding}
            formRef={formRef as unknown as MutableRefObject<HTMLFormElement>}
            className={{
              container: 'mx-auto !max-w-none !overflow-visible',
              onboardingSignup: '!gap-3',
            }}
            onboardingSignupButton={{
              variant: ButtonVariant.Primary,
              size: ButtonSize.Large,
            }}
            onAuthStateUpdate={onAuthStateUpdate}
          />
        </div>
      </div>
    </aside>
  );
}
