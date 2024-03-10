import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions, { AuthDisplay } from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { MemberAlready } from '../onboarding/MemberAlready';
import { useAuthContext } from '../../contexts/AuthContext';
import { BottomBannerContainer } from '../banners';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PostPageOnboarding } from '../../lib/featureValues';
import { cloudinary } from '../../lib/image';

const Section = classed('div', 'flex flex-col');
export const authGradientBg =
  'bg-background-default bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100%';

export function AuthenticationBanner(): ReactElement {
  const { showLogin } = useAuthContext();
  const postPageOnboarding = useFeature(feature.postPageOnboarding);

  return (
    <BottomBannerContainer
      className={classNames(
        'gap-24 border-t border-theme-color-cabbage py-10 shadow-3 laptopL:gap-32',
        authGradientBg,
      )}
    >
      <Section className="w-[32.5rem]">
        <OnboardingHeadline
          className={{ title: 'typo-mega3', description: 'typo-title3' }}
        />
        {postPageOnboarding === PostPageOnboarding.V3 && (
          <img
            src={cloudinary.postPageOnboarding.image}
            alt="Daily dev social proof showing product of the year and 2000+ reviews on Chrome store"
            className="hidden laptop:block"
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
          className={{ onboardingSignup: '!gap-4' }}
          onAuthStateUpdate={() =>
            showLogin({ trigger: AuthTriggers.Onboarding })
          }
        />
        <MemberAlready
          onLogin={() =>
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: { isLogin: true },
            })
          }
          className={{
            container: 'justify-center text-theme-label-secondary typo-callout',
            login: 'font-bold',
          }}
        />
      </Section>
    </BottomBannerContainer>
  );
}
