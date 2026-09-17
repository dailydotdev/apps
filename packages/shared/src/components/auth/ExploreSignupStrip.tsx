import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import AuthOptions from './AuthOptions';
import { ButtonSize } from '../buttons/Button';
import type { AuthOptionsProps } from './common';
import { AuthDisplay } from './common';
import type { HijackingCoverCopy } from './HijackingCoverStrip';
import {
  HijackingCoverCard,
  hijackingCoverBodyClassName,
  hijackingCoverHeadingClassName,
} from './HijackingCoverStrip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

// The new tab control strip's signed-out copy.
const copy: HijackingCoverCopy = {
  heading: 'Unlock the full daily.dev experience',
  body: 'Log in to pick up where you left off.',
};

// The card's height with the copy and auth stack in one left column.
export const exploreSignupStripMinHeight = 'min-h-[18rem]';

// The new tab's cover strip for anonymous visitors, tablet and up, with the
// sticky auth banner's signup stack in place of a sign up / log in pair.
export function ExploreSignupStrip({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const { isAuthReady, user, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isAnonymous = isAuthReady && !user;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: TargetId.ExploreStrip,
    }),
    { condition: isAnonymous && isTablet },
  );

  if (user) {
    return null;
  }

  // Holds the strip's slot in the server HTML until boot answers.
  if (!isAuthReady) {
    return (
      <section
        aria-hidden
        className={classNames('hidden w-full tablet:block', className)}
      >
        <div className={exploreSignupStripMinHeight} />
      </section>
    );
  }

  if (!isTablet) {
    return null;
  }

  const onAuthStateUpdate: AuthOptionsProps['onAuthStateUpdate'] = (props) => {
    if (props.isLoginFlow) {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.LoginButton,
        target_id: TargetId.ExploreStrip,
      });
    }

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
    <HijackingCoverCard
      className={className}
      // Scaled up and shifted right so the dev and dog sit past the column,
      // around three quarters across.
      artClassName="origin-[50%_88%] translate-x-[27%] scale-[2.2]"
    >
      <div className="cover-strip-blur-near pointer-events-none absolute inset-y-0 left-0 w-3/4" />
      <div className="cover-strip-blur-mid pointer-events-none absolute inset-y-0 left-0 w-3/4" />
      <div className="cover-strip-blur-far pointer-events-none absolute inset-y-0 left-0 w-3/4" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-raw-pepper-90/[0.85] via-raw-pepper-90/[0.45] to-transparent" />
      <div
        className={classNames(
          'dark relative z-1 flex flex-col items-start justify-center px-6 py-8 laptop:px-8',
          exploreSignupStripMinHeight,
        )}
      >
        <div className="flex w-full max-w-[26.25rem] flex-col items-start gap-1 text-left">
          <h3 className={hijackingCoverHeadingClassName}>{copy.heading}</h3>
          <p className={hijackingCoverBodyClassName}>{copy.body}</p>
          <AuthOptions
            ignoreMessages
            formRef={null as unknown as AuthOptionsProps['formRef']}
            trigger={AuthTriggers.Onboarding}
            targetId={TargetId.ExploreStrip}
            simplified
            defaultDisplay={AuthDisplay.OnboardingSignup}
            forceDefaultDisplay
            signupStyle="singlePrimary"
            inlineProviders
            preferGithub={false}
            onboardingSignupButton={{ size: ButtonSize.Medium }}
            className={{ container: 'mt-5 !min-h-0 !overflow-visible' }}
            onAuthStateUpdate={onAuthStateUpdate}
          />
        </div>
      </div>
    </HijackingCoverCard>
  );
}
