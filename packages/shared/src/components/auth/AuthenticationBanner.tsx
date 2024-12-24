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
import { checkIsBrowser, checkIsExtension, UserAgent } from '../../lib/func';
import { featurePostBannerExtensionPrompt } from '../../lib/featureManagement';
import { useConditionalFeature } from '../../hooks';
import { GetExtensionButton } from '../buttons/GetExtensionButton';

const Section = classed('div', 'flex flex-col');

export function AuthenticationBanner({
  children,
}: PropsWithChildren): ReactElement {
  const isCompatibleBrowser =
    (checkIsBrowser(UserAgent.Chrome) || checkIsBrowser(UserAgent.Edge)) &&
    !checkIsExtension();

  const { value: showExtensionCTA } = useConditionalFeature({
    feature: featurePostBannerExtensionPrompt,
    shouldEvaluate: isCompatibleBrowser,
  });

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
        <Section className={classNames('max-w-full flex-grow basis-0 gap-4')}>
          {children || (
            <OnboardingHeadline
              className={{
                title: 'typo-mega3',
                description: classNames(
                  'typo-title3',
                  !showExtensionCTA && 'mb-8',
                ),
              }}
            />
          )}
        </Section>
        <Section
          className={classNames(
            showExtensionCTA && 'my-auto flex flex-col gap-4',
            !showExtensionCTA && 'w-[23.25rem]',
          )}
        >
          {showExtensionCTA ? (
            <GetExtensionButton />
          ) : (
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
          )}
          <MemberAlready
            onLogin={() =>
              showLogin({
                trigger: AuthTriggers.Onboarding,
                options: { isLogin: true },
              })
            }
            className={{
              container: showExtensionCTA
                ? '!text-lg leading-5 text-text-tertiary'
                : 'justify-center text-text-secondary typo-callout',
              login: showExtensionCTA
                ? '!text-lg font-bold !text-text-link'
                : 'font-bold',
            }}
          />
        </Section>
      </div>
    </BottomBannerContainer>
  );
}
