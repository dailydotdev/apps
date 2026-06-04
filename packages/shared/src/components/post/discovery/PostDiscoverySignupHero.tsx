import type { MutableRefObject, ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import AuthOptions from '../../auth/AuthOptions';
import { AuthDisplay, type AuthProps } from '../../auth/common';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '../../../lib/image';

interface PostDiscoverySignupHeroProps {
  post?: Post;
}

const surface = 'post_discovery_signup';

export const PostDiscoverySignupHero = ({
  post,
}: PostDiscoverySignupHeroProps): ReactElement => {
  const { showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const [isClient, setIsClient] = useState(false);

  const extra = useMemo(
    () =>
      JSON.stringify({
        origin: Origin.ArticlePage,
        post_id: post?.id,
        surface,
      }),
    [post?.id],
  );

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_id: surface,
    target_type: TargetType.ArticleAnonymousCTA,
    extra,
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onAuthStateUpdate = useCallback(
    (props: Partial<AuthProps>) => {
      logEvent({
        event_name: LogEvent.ClickArticleAnonymousCTA,
        target_id: surface,
        target_type: TargetType.ArticleAnonymousCTA,
        extra,
      });

      showLogin({
        trigger: AuthTriggers.PostPage,
        options: {
          isLogin: !!props.isLoginFlow,
          defaultDisplay: props.defaultDisplay,
          formValues: props.email ? { email: props.email } : undefined,
        },
      });
    },
    [extra, logEvent, showLogin],
  );

  return (
    <section className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
      <picture>
        <source
          media="(max-width: 655px)"
          srcSet={cloudinaryOnboardingFullBackgroundMobile}
        />
        <source
          media="(min-width: 656px)"
          srcSet={cloudinaryOnboardingFullBackgroundDesktop}
        />
        <img
          alt=""
          aria-hidden
          className="opacity-55 pointer-events-none absolute inset-0 size-full object-cover"
          role="presentation"
          src={cloudinaryOnboardingFullBackgroundDesktop}
        />
      </picture>
      <div className="bg-raw-pepper-90/55 pointer-events-none absolute inset-0" />
      <div className="via-raw-pepper-90/80 from-raw-pepper-90/60 pointer-events-none absolute inset-0 bg-gradient-to-b to-raw-pepper-90/40" />
      <div className="via-raw-pepper-90/70 pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
      <div className="dark relative z-1 mx-auto flex min-h-[20rem] w-full max-w-[48rem] flex-col items-center justify-center px-6 py-10 text-center tablet:min-h-[24rem] tablet:px-10 tablet:py-12">
        <div className="w-full max-w-[24rem] rounded-24 border border-border-subtlest-tertiary bg-white/[0.045] p-4 text-center backdrop-blur-md tablet:p-5">
          <h2 className="mb-4 text-balance font-bold text-white typo-title3 tablet:typo-title2">
            Where developers make every tab count.
          </h2>
          {isClient && (
            <AuthOptions
              compact
              className={{
                container: 'mx-auto !max-w-none !overflow-visible',
                onboardingSignup: '!gap-3',
              }}
              defaultDisplay={AuthDisplay.OnboardingSignup}
              forceDefaultDisplay
              formRef={null as unknown as MutableRefObject<HTMLFormElement>}
              ignoreMessages
              onAuthStateUpdate={onAuthStateUpdate}
              onboardingSignupButton={{
                size: ButtonSize.Large,
                variant: ButtonVariant.Primary,
              }}
              simplified
              trigger={AuthTriggers.PostPage}
            />
          )}
        </div>
      </div>
    </section>
  );
};
