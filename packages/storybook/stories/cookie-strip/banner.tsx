import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import type { AuthOptionsProps } from '@dailydotdev/shared/src/components/auth/common';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth/OnboardingHeadline';
import {
  authGradientBg,
  BottomBannerContainer,
} from '@dailydotdev/shared/src/components/marketing/banners/common';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { geoToCountry } from '@dailydotdev/shared/src/lib/geo';
import {
  cloudinaryAuthBannerBackground as bg,
  cloudinaryAuthBannerBackground1440w as laptopBg,
  cloudinaryAuthBannerBackground1920w as desktopBg,
  cloudinaryPatchyWaiting,
} from '@dailydotdev/shared/src/lib/image';

/* ------------------------------------------------------------------------ */
/* The proposed layout, written against shared only so it can move into      */
/* packages/shared/src/components/auth/AuthenticationBanner.tsx unchanged.   */
/* See README.md in this folder for the full implementation plan.            */
/* ------------------------------------------------------------------------ */

export type StageAccent = 'patchy' | 'sources';

/** The figure the product already states (HackathonTracks). */
const SOURCE_COUNT = '1,300+';

/** Publications developers recognize on sight; logos from media.daily.dev. */
export const FEATURED_SOURCES = [
  {
    id: 'devto',
    name: 'DEV',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
  },
  {
    id: 'next',
    name: 'Next.js',
    image:
      'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/a7460ee33d92486cb5afd0fca36a116d',
  },
  {
    id: 'fireship',
    name: 'Fireship',
    image:
      'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
  },
  {
    id: 'bytebytego',
    name: 'ByteByteGo',
    image:
      'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/35be29234ee14d01a9cd049c52e12753',
  },
  {
    id: 'techworldwithnana',
    name: 'TechWorld with Nana',
    image:
      'https://media.daily.dev/image/upload/s--k4AAsort--/f_auto/v1728072817/logos/techworldwithnana',
  },
  {
    id: 'tanstack-blog',
    name: 'TanStack',
    image:
      'https://media.daily.dev/image/upload/s--TVIrvIT7--/f_auto,q_auto/v1787487634/logos/tanstack-blog',
  },
];

const SourceLogo = ({
  name,
  image,
  className,
}: {
  name: string;
  image: string;
  className?: string;
}): ReactElement => {
  const [failed, setFailed] = useState(false);
  const shape = classNames(
    'h-6 w-6 shrink-0 rounded-full border-2 border-background-default',
    className,
  );

  if (failed) {
    return (
      <span
        aria-hidden
        className={classNames(
          shape,
          'flex items-center justify-center bg-surface-float font-bold text-text-secondary typo-caption2',
        )}
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={image}
      alt=""
      onError={() => setFailed(true)}
      className={classNames(shape, 'bg-background-default object-cover')}
    />
  );
};

const SourcesRow = (): ReactElement => (
  <div className="mb-2 flex items-center gap-2">
    <div className="flex shrink-0">
      {FEATURED_SOURCES.map((source, i) => (
        <SourceLogo
          key={source.id}
          name={source.name}
          image={source.image}
          className={i > 0 ? '-ml-1.5' : undefined}
        />
      ))}
    </div>
    <p className="text-text-tertiary typo-footnote">
      <strong className="tabular-nums text-text-secondary">
        {SOURCE_COUNT} sources
      </strong>{' '}
      in one feed
    </p>
  </div>
);

/**
 * Publishes the strip's height on <html> while it is mounted, so the docked
 * cookie card can center itself on the strip (`--dd-strip-h`).
 */
const usePublishedHeight = (enabled: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) {
      return undefined;
    }
    const root = document.documentElement;
    root.classList.add('dd-strip-dock');
    const observer = new ResizeObserver(() =>
      root.style.setProperty('--dd-strip-h', `${el.offsetHeight}px`),
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.classList.remove('dd-strip-dock');
      root.style.removeProperty('--dd-strip-h');
    };
  }, [enabled]);
  return ref;
};

/** Shows "Privacy choices saved" for a moment once the card is answered. */
const useJustAnswered = (consentOpen: boolean): boolean => {
  const [saved, setSaved] = useState(false);
  const wasOpen = useRef(consentOpen);

  useEffect(() => {
    const answered = wasOpen.current && !consentOpen;
    wasOpen.current = consentOpen;
    if (!answered) {
      return undefined;
    }
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 2200);
    return () => clearTimeout(timer);
  }, [consentOpen]);

  return saved;
};

interface AuthenticationBannerStageProps extends PropsWithChildren {
  targetId?: string;
  accent?: StageAccent;
  /** Dock the cookie card as the strip's right column (Handoff dock). */
  dock?: boolean;
  /** Whether the iubenda card is on screen; drives the dock's confirmation. */
  consentOpen?: boolean;
}

export function AuthenticationBannerStage({
  children,
  targetId,
  accent,
  dock = false,
  consentOpen = false,
}: AuthenticationBannerStageProps): ReactElement {
  const { showLogin } = useAuthContext();
  const ref = usePublishedHeight(dock);
  const saved = useJustAnswered(consentOpen) && dock;

  return (
    <BottomBannerContainer
      ref={ref}
      className={classNames(
        // Production's height (17.75rem) with the column centered in it, so the
        // treatments cover exactly as much of the feed as control.
        'min-h-[17.75rem] items-center border-t border-accent-cabbage-default px-10 py-4 shadow-3 transition-[padding] duration-300',
        dock
          ? '[.dd-consent-open_&]:pr-[26.25rem]'
          : '[.dd-consent-open_&]:pr-[24.25rem]',
        authGradientBg,
      )}
    >
      <Image
        className="absolute left-0 top-0 -z-1 h-full w-full"
        src={bg}
        srcSet={`${laptopBg} 1440w, ${desktopBg} 1920w, ${bg} 2880w`}
        sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
      />
      {dock && (
        <div className="absolute inset-y-8 right-[25rem] hidden w-px bg-border-subtlest-tertiary [.dd-consent-open_&]:block" />
      )}
      {saved && (
        <div className="absolute inset-y-0 right-10 flex items-center">
          <p className="dd-saved flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2 font-bold text-text-primary typo-callout">
            <VIcon className="text-accent-avocado-default" />
            Privacy choices saved
          </p>
        </div>
      )}
      <div className="relative flex w-full max-w-[48rem] flex-col items-start">
        {accent === 'patchy' && (
          <img
            src={cloudinaryPatchyWaiting}
            alt=""
            className="pointer-events-none absolute -top-40 right-0 h-36 w-auto"
          />
        )}
        {accent === 'sources' && <SourcesRow />}
        {children}
        <div className="dd-stage-auth mt-4 w-full max-w-[32rem]">
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
            preferGithub={false}
            className={{
              // The modal's width cap and scroll box would clip the second
              // provider once the two sit side by side.
              container: '!min-h-0 !max-w-none !overflow-visible',
            }}
            onAuthStateUpdate={(props) => {
              showLogin({
                trigger: AuthTriggers.Onboarding,
                options: {
                  isLogin: !!props.isLoginFlow,
                  defaultDisplay: props.defaultDisplay,
                  formValues: props.email ? { email: props.email } : undefined,
                },
              });
            }}
          />
        </div>
      </div>
    </BottomBannerContainer>
  );
}

/* ------------------------------------------------------------------------ */
/* Headlines: the production copy and gradient, a step smaller              */
/* ------------------------------------------------------------------------ */

export type HeadlineCopy = 'geo' | 'default';

/** OnboardingHeadline's gradient title, a step smaller. */
const compactHeadline = {
  title: '!mb-2 typo-title2',
  description: 'text-text-secondary typo-callout',
};

/** GeoPersonalizedBanner's copy, verbatim, for a visitor in Israel. */
export const StageHeadline = ({ copy }: { copy: HeadlineCopy }): ReactElement =>
  copy === 'geo' ? (
    <OnboardingHeadline
      className={compactHeadline}
      title={`daily.dev is the fastest growing developer platform in ${geoToCountry(
        'IL',
      )}!`}
      description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
    />
  ) : (
    <OnboardingHeadline className={compactHeadline} />
  );
