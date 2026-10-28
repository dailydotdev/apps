import type { ReactElement, PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthOptions from './AuthOptions';
import { AuthTriggers } from '../../lib/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsLightTheme } from '../../hooks/utils/useThemedAsset';
import { authGradientBg, BottomBannerContainer } from '../marketing/banners';
import { useSidebarCompact } from '../../hooks/useSidebarCompact';
import { Image } from '../image/Image';
import {
  cloudinaryAuthBannerBackground as bg,
  cloudinaryAuthBannerBackground1440w as laptopBg,
  cloudinaryAuthBannerBackground1920w as desktopBg,
} from '../../lib/image';
import type { AuthOptionsProps } from './common';
import { AuthDisplay } from './common';

interface AuthenticationBannerProps extends PropsWithChildren {
  targetId?: string;
}

interface HeadlineClassName {
  pretitle?: string;
  title: string;
  description: string;
}

// Personalized banners pass their own headline as children, so they size it
// with this too.
export const authBannerHeadlineClassName: HeadlineClassName = {
  pretitle: '!text-text-primary typo-callout',
  title:
    '!mb-2 !bg-none !text-text-primary text-balance tracking-[-0.015em] typo-title1 laptopL:typo-large-title',
  description:
    'mx-0 max-w-[36rem] text-pretty !leading-[1.4] text-text-secondary typo-callout laptopXL:mx-auto',
};

const BannerArt = (): ReactElement => (
  <Image
    className="absolute left-0 top-0 -z-1 h-full w-full"
    src={bg}
    srcSet={`${laptopBg} 1440w, ${desktopBg} 1920w, ${bg} 2880w`}
    sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
  />
);

// One column that leaves the cookie card's lane free (below 1,668px), so the
// card never covers the auth buttons.
export function AuthenticationBanner({
  children,
  targetId,
}: AuthenticationBannerProps): ReactElement {
  const { showLogin } = useAuthContext();
  const isLightTheme = useIsLightTheme();
  const { value: isSidebarCompact } = useSidebarCompact();
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

  return (
    <BottomBannerContainer
      className={classNames(
        'min-h-[17.75rem] items-center border-t border-accent-cabbage-default px-10 py-4 pe-[388px] shadow-3 laptopXL:pe-10',
        // The banner pins to the window, but on laptop the rail sits fixed
        // along the left edge; start beside it or the headline runs under it.
        // Same width source as MainLayout's content padding, so they can't
        // drift apart.
        isSidebarCompact
          ? 'laptop:left-16 laptop:w-[calc(100%-4rem)]'
          : 'laptop:left-20 laptop:w-[calc(100%-5rem)]',
        authGradientBg,
      )}
    >
      {!isLightTheme && <BannerArt />}
      <div className="flex w-full max-w-3xl flex-col items-start text-start laptopXL:items-center laptopXL:text-center">
        {children || (
          <OnboardingHeadline className={authBannerHeadlineClassName} />
        )}
        <div className="mt-4 w-full max-w-[32rem]">
          <AuthOptions
            ignoreMessages
            formRef={null as unknown as AuthOptionsProps['formRef']}
            trigger={AuthTriggers.Onboarding}
            targetId={targetId}
            simplified
            defaultDisplay={AuthDisplay.OnboardingSignup}
            forceDefaultDisplay
            // Google is the one solid primary, GitHub steps down to a fill
            // and email is a text link.
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
