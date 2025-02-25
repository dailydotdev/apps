import type { ReactElement, PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';
import { authGradientBg, BottomBannerContainer } from '../banners';
import { ButtonVariant } from '../buttons/common';
import { Image } from '../image/Image';
import {
  cloudinaryAuthBannerBackground as bg,
  cloudinaryAuthBannerBackground1440w as laptopBg,
  cloudinaryAuthBannerBackground1920w as desktopBg,
} from '../../lib/image';

const Section = classed('div', 'flex flex-col');

export function AuthenticationBanner({
  children,
}: PropsWithChildren): ReactElement {
  const { showLogin } = useAuthContext();

  return (
    <BottomBannerContainer
      className={classNames(
        'border-t border-accent-cabbage-default py-10 shadow-3',
        authGradientBg,
      )}
    >
      <div className="flex max-w-[63.75rem] flex-row  justify-center gap-10">
        <Image
          className="absolute left-0 top-0 -z-1 h-full w-full"
          src={bg}
          srcSet={`${laptopBg} 1440w, ${desktopBg} 1920w, ${bg} 2880w`}
          sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
        />
        <Section className="max-w-full flex-grow basis-0 gap-4">
          {children || (
            <OnboardingHeadline
              className={{
                title: 'typo-mega3',
                description: 'mb-8 typo-title3',
              }}
            />
          )}
        </Section>
        <Section className="w-[23.25rem]">
          <AuthOptions
            ignoreMessages
            formRef={null}
            trigger={AuthTriggers.Onboarding}
            simplified
            defaultDisplay={AuthDisplay.OnboardingSignup}
            forceDefaultDisplay
            className={{
              onboardingSignup: '!gap-4',
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
          />
          <MemberAlready
            onLogin={() =>
              showLogin({
                trigger: AuthTriggers.Onboarding,
                options: { isLogin: true },
              })
            }
            className={{
              container: 'justify-center text-text-secondary typo-callout',
              login: 'font-bold',
            }}
          />
        </Section>
      </div>
    </BottomBannerContainer>
  );
}
