import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import AuthOptions from './AuthOptions';
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

// The card's height with the auth stack: stacked under the copy until laptop,
// beside it from there.
export const exploreSignupStripMinHeight = 'min-h-[22rem] laptop:min-h-[17rem]';

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
    <HijackingCoverCard className={className}>
      <div className="from-raw-pepper-90/[0.9] via-raw-pepper-90/[0.55] pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t to-transparent laptop:inset-y-0 laptop:left-auto laptop:h-auto laptop:w-3/5 laptop:bg-gradient-to-l" />
      <div
        className={classNames(
          'dark relative z-1 flex flex-col items-center gap-6 px-5 py-8 text-center',
          'laptop:flex-row laptop:justify-between laptop:gap-10 laptop:px-10',
          'laptop:text-left',
          exploreSignupStripMinHeight,
        )}
      >
        <div className="flex max-w-[34rem] flex-col gap-1 laptop:min-w-0 laptop:flex-1">
          <h3 className={hijackingCoverHeadingClassName}>{copy.heading}</h3>
          <p className={hijackingCoverBodyClassName}>{copy.body}</p>
        </div>
        <div className="w-full max-w-[23.25rem] shrink-0">
          <AuthOptions
            ignoreMessages
            formRef={null as unknown as AuthOptionsProps['formRef']}
            trigger={AuthTriggers.Onboarding}
            targetId={TargetId.ExploreStrip}
            simplified
            defaultDisplay={AuthDisplay.OnboardingSignup}
            forceDefaultDisplay
            signupStyle="singlePrimary"
            preferGithub={false}
            className={{ container: '!min-h-0 !overflow-visible' }}
            onAuthStateUpdate={onAuthStateUpdate}
          />
        </div>
      </div>
    </HijackingCoverCard>
  );
}
