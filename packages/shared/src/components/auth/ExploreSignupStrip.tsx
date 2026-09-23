import type { CSSProperties, ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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

const stripMinHeight = 'min-h-[14.5rem]';

type SlotBox = Pick<CSSProperties, 'left' | 'width'>;

// The slot's box in the window, kept current as the page's column resizes.
const useSlotBox = (ref: RefObject<HTMLElement>): SlotBox | undefined => {
  const [box, setBox] = useState<SlotBox>();

  useEffect(() => {
    const slot = ref.current;

    if (!slot || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const measure = () => {
      const { left, width } = slot.getBoundingClientRect();
      setBox({ left, width });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return box;
};

interface ExploreSignupStripProps {
  className?: string;
}

// The public pages' signup card for anonymous visitors, tablet and up. The
// slot goes at the end of the page's content column, in the same box the
// inline strip used to fill: it keeps the last of the content reachable, and
// the card pins over the bottom of the window at exactly the slot's width.
export function ExploreSignupStrip({
  className,
}: ExploreSignupStripProps): ReactElement | null {
  const { isAuthReady, user, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isAnonymous = isAuthReady && !user;
  const slotRef = useRef<HTMLDivElement>(null);
  const slotBox = useSlotBox(slotRef);

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: TargetId.ExploreStrip,
    }),
    { condition: isAnonymous && isTablet },
  );

  if (!isAnonymous || !isTablet) {
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
    <>
      <div aria-hidden className={classNames('mb-4 w-full', className)}>
        <div ref={slotRef} className={stripMinHeight} />
      </div>
      {!!slotBox && (
        <div className="fixed bottom-4 z-modal" style={slotBox}>
          <HijackingCoverCard>
            <div className="cover-strip-blur pointer-events-none absolute bottom-0 left-1/2 h-3/5 w-[24rem] -translate-x-1/2" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-raw-pepper-90/[0.9] via-raw-pepper-90/[0.55] to-transparent" />
            <div
              className={classNames(
                'dark relative z-1 flex flex-col items-center justify-center px-6 py-6 text-center',
                stripMinHeight,
              )}
            >
              <div className="flex w-full max-w-[26.25rem] flex-col items-center gap-1">
                <h3
                  className={classNames(
                    'text-balance',
                    hijackingCoverHeadingClassName,
                  )}
                >
                  {copy.heading}
                </h3>
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
                  className={{
                    container: 'mt-4 !min-h-[6.75rem] !overflow-visible',
                  }}
                  onAuthStateUpdate={onAuthStateUpdate}
                />
              </div>
            </div>
          </HijackingCoverCard>
        </div>
      )}
    </>
  );
}
