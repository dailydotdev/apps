import type { ReactElement, PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { authGradientBg, BottomBannerContainer } from '../banners';
import { ButtonVariant } from '../buttons/common';
import { Image } from '../image/Image';
import {
  cloudinaryAuthBannerBackground as bg,
  cloudinaryAuthBannerBackground1440w as laptopBg,
  cloudinaryAuthBannerBackground1920w as desktopBg,
} from '../../lib/image';
import { AuthDisplay } from './common';

const Section = classed('div', 'flex flex-col');

interface AuthenticationBannerProps extends PropsWithChildren {
  compact?: boolean;
}

export function AuthenticationBanner({
  children,
  compact,
}: AuthenticationBannerProps): ReactElement {
  const { showLogin } = useAuthContext();

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
        <Image
          className="absolute left-0 top-0 -z-1 h-full w-full"
          src={bg}
          srcSet={`${laptopBg} 1440w, ${desktopBg} 1920w, ${bg} 2880w`}
          sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
        />
        <Section
          className={classNames(
            'max-w-full flex-grow basis-0',
            compact ? 'justify-center gap-2' : 'gap-4',
          )}
        >
          {children ||
            (compact ? (
              <OnboardingHeadline
                className={{
                  title: 'typo-large-title',
                  description: 'typo-body',
                }}
              />
            ) : (
              <OnboardingHeadline
                className={{
                  title: 'typo-mega3',
                  description: 'mb-8 typo-title3',
                }}
              />
            ))}
        </Section>
        <Section className="w-[23.25rem]">
          <AuthOptions
            ignoreMessages
            formRef={null as unknown as React.MutableRefObject<HTMLFormElement>}
            trigger={AuthTriggers.Onboarding}
            simplified
            defaultDisplay={AuthDisplay.OnboardingSignup}
            forceDefaultDisplay
            className={{
              onboardingSignup: compact ? '!gap-3' : '!gap-4',
            }}
            onAuthStateUpdate={(props) => {
              showLogin({
                trigger: AuthTriggers.Onboarding,
                options: { isLogin: true, formValues: props },
              });
            }}
            onboardingSignupButton={{
              variant: ButtonVariant.Primary,
            }}
            hideLoginLink={compact}
            compact={compact}
          />
        </Section>
      </div>
    </BottomBannerContainer>
  );
}
