import React, { ReactElement, type ReactNode } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';
import { BottomBannerContainer } from '../banners';
import { ButtonVariant } from '../buttons/common';
import { Image } from '../image/Image';
import {
  cloudinaryAuthBannerBackground as bg,
  cloudinaryAuthBannerBackground1440w as laptopBg,
  cloudinaryAuthBannerBackground1920w as desktopBg,
} from '../../lib/image';

const Section = classed('div', 'flex flex-col');
export const authGradientBg =
  'bg-background-default bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100%';
type AuthenticationBannerProps = {
  children?: ReactNode | ReactNode[];
};
export function AuthenticationBanner({
  children,
}: AuthenticationBannerProps): ReactElement {
  const { showLogin } = useAuthContext();

  return (
    <BottomBannerContainer
      className={classNames(
        'gap-24 border-t border-accent-cabbage-default py-10 shadow-3 laptopL:gap-32',
      )}
    >
      <Image
        className="absolute left-0 top-0 -z-1 h-full w-full"
        src={bg}
        srcSet={`${laptopBg} 1440w, ${desktopBg} 1920w, ${bg} 2880w`}
        sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
      />
      <Section className="w-[32.5rem] gap-4">
        {children}
        {!children && (
          <OnboardingHeadline
            className={{
              title: 'typo-mega3',
              description: 'mb-8 typo-title3',
            }}
          />
        )}
      </Section>
      <Section className="w-[23.25rem] pt-2">
        <AuthOptions
          ignoreMessages
          formRef={null}
          trigger={AuthTriggers.Onboarding}
          simplified
          defaultDisplay={AuthDisplay.OnboardingSignup}
          forceDefaultDisplay
          className={{
            onboardingSignup: classNames('!gap-4'),
          }}
          onAuthStateUpdate={(props) =>
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: {
                formValues: {
                  email: props?.email,
                },
              },
            })
          }
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
    </BottomBannerContainer>
  );
}
