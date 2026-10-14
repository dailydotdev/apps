import type { ReactElement, PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { authGradientBg, BottomBannerContainer } from '../marketing/banners';
import { Image } from '../image/Image';
import {
  cloudinaryAuthBannerBackground as bg,
  cloudinaryAuthBannerBackground1440w as laptopBg,
  cloudinaryAuthBannerBackground1920w as desktopBg,
} from '../../lib/image';
import type { AuthOptionsProps } from './common';
import { AuthDisplay } from './common';

const Section = classed('div', 'flex flex-col');

export type AuthBannerLayout = 'split' | 'column';

interface AuthenticationBannerProps extends PropsWithChildren {
  compact?: boolean;
  targetId?: string;
  layout?: AuthBannerLayout;
}

interface HeadlineClassName {
  pretitle?: string;
  title: string;
  description: string;
}

// Personalized banners pass their own headline as children, so they size it
// with this too.
export const getAuthBannerHeadlineClassName = ({
  compact,
  layout = 'split',
}: Pick<
  AuthenticationBannerProps,
  'compact' | 'layout'
>): HeadlineClassName => {
  if (layout === 'column') {
    return {
      pretitle: 'typo-title3',
      title:
        '!mb-2 !bg-none !text-text-primary text-balance tracking-[-0.015em] typo-title1 laptopL:typo-large-title',
      description:
        'signup-strip-description mx-auto max-w-[36rem] text-pretty !leading-[1.4] text-text-secondary typo-callout',
    };
  }

  return compact
    ? { title: 'typo-large-title', description: 'typo-body' }
    : { title: 'typo-mega3', description: 'typo-title3' };
};

const BannerArt = ({ className }: { className?: string }): ReactElement => (
  <Image
    className={classNames(
      'absolute left-0 top-0 -z-1 h-full w-full',
      className,
    )}
    src={bg}
    srcSet={`${laptopBg} 1440w, ${desktopBg} 1920w, ${bg} 2880w`}
    sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
  />
);

export function AuthenticationBanner({
  children,
  compact,
  targetId,
  layout = 'split',
}: AuthenticationBannerProps): ReactElement {
  const { showLogin } = useAuthContext();
  const headline = children || (
    <OnboardingHeadline
      className={getAuthBannerHeadlineClassName({ compact, layout })}
    />
  );
  const onAuthStateUpdate: AuthOptionsProps['onAuthStateUpdate'] = (props) => {
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: {
        isLogin: !!props.isLoginFlow,
        defaultDisplay: props.defaultDisplay,
        formValues: props.email ? { email: props.email } : undefined,
      },
    });
  };

  if (layout === 'column') {
    return (
      <BottomBannerContainer
        className={classNames(
          // Production's split-layout height, so both arms cover the same
          // slice of the feed. The cookie card's lane and the light theme
          // live in webapp/styles/signupStrip.css.
          'signup-strip-column min-h-[17.75rem] items-center border-t border-accent-cabbage-default px-10 py-4 shadow-3 transition-[padding] duration-300 motion-reduce:transition-none',
          authGradientBg,
        )}
      >
        <BannerArt className="signup-strip-art" />
        <div className="signup-strip-content flex w-full flex-col items-center text-center">
          {headline}
          <div className="mt-4 w-full max-w-[32rem]">
            <AuthOptions
              ignoreMessages
              formRef={null as unknown as AuthOptionsProps['formRef']}
              trigger={AuthTriggers.Onboarding}
              targetId={targetId}
              simplified
              defaultDisplay={AuthDisplay.OnboardingSignup}
              forceDefaultDisplay
              signupStyle="singlePrimary"
              inlineProviders
              inlineFooter
              preferGithub={false}
              className={{
                // The modal's width cap and scroll box clip the second Large
                // provider once the two sit side by side.
                container: '!min-h-0 !max-w-none !overflow-visible',
              }}
              onAuthStateUpdate={onAuthStateUpdate}
            />
          </div>
        </div>
      </BottomBannerContainer>
    );
  }

  return (
    <BottomBannerContainer
      className={classNames(
        'border-t border-accent-cabbage-default shadow-3',
        compact ? 'py-4' : 'py-10',
        authGradientBg,
      )}
    >
      <div
        className={classNames(
          'flex max-w-[63.75rem] flex-row justify-center gap-10',
          compact && 'items-center',
        )}
      >
        <BannerArt />
        <Section
          className={classNames(
            'max-w-full flex-grow basis-0',
            compact ? 'justify-center gap-2' : 'gap-4',
          )}
        >
          {headline}
        </Section>
        <Section className="w-[23.25rem]">
          <AuthOptions
            ignoreMessages
            formRef={null as unknown as React.MutableRefObject<HTMLFormElement>}
            trigger={AuthTriggers.Onboarding}
            targetId={targetId}
            simplified
            defaultDisplay={AuthDisplay.OnboardingSignup}
            forceDefaultDisplay
            // The horizon wall's CTA hierarchy: Google is the one solid
            // primary, GitHub steps down to a fill, email is a text link and
            // the divider goes — three identical buttons recommend nothing.
            signupStyle="singlePrimary"
            preferGithub={false}
            className={{
              // The signup display's min-height is modal sizing; here it
              // stretches both columns ~5rem past their content and the strip
              // ends in dead space instead of its own padding.
              container: '!min-h-0',
              onboardingSignup: compact ? '!gap-3' : '!gap-4',
            }}
            onAuthStateUpdate={onAuthStateUpdate}
            hideLoginLink={compact}
            compact={compact}
          />
        </Section>
      </div>
    </BottomBannerContainer>
  );
}
