import React, { ReactElement } from 'react';
import { BottomBannerContainer } from '../banners';
import { OnboardingHeadline } from './OnboardingHeadline';
import { MemberAlready } from '../onboarding/MemberAlready';
import { AuthTriggers } from '../../lib/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { GetExtensionButton } from '../buttons/GetExtensionButton';
import { cloudinaryAuthBannerBackground as bg } from '../../lib/image';
import { Image } from '../image/Image';

const laptopBg = bg.replace('/f_auto', '/c_auto,g_center,w_1440/f_auto/');
const desktopBg = bg.replace('/f_auto', '/c_auto,g_center,w_1920/f_auto/');

export const AuthExtensionBanner = (): ReactElement => {
  const { showLogin } = useAuthContext();

  return (
    <BottomBannerContainer className="gap-10 border-t border-none border-accent-cabbage-default py-10 shadow-3">
      <Image
        className="absolute left-0 top-0 -z-1 h-full w-full"
        src={bg}
        srcSet={`${laptopBg} 1440w, ${desktopBg} 1920w, ${bg} 2880w`}
        sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
      />
      <section className="w-[36rem]">
        <OnboardingHeadline
          className={{ title: 'typo-mega3', description: 'typo-title3' }}
        />
      </section>
      <section className="flex w-[18rem] flex-col items-center justify-center gap-5">
        <GetExtensionButton />
        <MemberAlready
          onLogin={() =>
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: { isLogin: true },
            })
          }
          className={{
            container: '!text-lg leading-5 text-text-tertiary',
            login: '!text-lg font-bold !text-text-link',
          }}
        />
      </section>
    </BottomBannerContainer>
  );
};
