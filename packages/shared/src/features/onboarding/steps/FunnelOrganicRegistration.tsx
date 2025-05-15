import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { FunnelStepOrganicRegistration } from '../types/funnel';
import { wrapperMaxWidth } from '../../../components/onboarding/common';
import { OnboardingHeadline } from '../../../components/auth';
import SignupDisclaimer from '../../../components/auth/SignupDisclaimer';
import { FooterLinks } from '../../../components/footer';
import AuthOptions from '../../../components/auth/AuthOptions';
import { AuthTriggers } from '../../../lib/auth';
import { useFeature } from '../../../components/GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';
import { AuthDisplay } from '../../../components/auth/common';
import { ExperimentWinner } from '../../../lib/featureValues';

interface FunnelOrganicRegistrationProps extends FunnelStepOrganicRegistration {
  formRef: React.RefObject<HTMLFormElement>;
}

export const FunnelOrganicRegistration = ({
  parameters,
  formRef,
}: FunnelOrganicRegistrationProps): ReactElement => {
  const { headline, explainer, image, experiments } = parameters;
  const onboardingVisual = useFeature(feature.onboardingVisual);
  const isMobile = useViewSize(ViewSize.MobileL);

  const imageSources = useMemo(() => {
    if (!image) {
      return {
        src: onboardingVisual?.fullBackground.mobile,
        srcSet: `${onboardingVisual?.fullBackground.mobile} 450w, ${onboardingVisual?.fullBackground.desktop} 1024w`,
      };
    }

    return image;
  }, [onboardingVisual, image]);

  return (
    <>
      <div className="z-3 flex flex-1 flex-col items-center overflow-x-hidden">
        {!!image && (
          <img
            {...image}
            alt="Onboarding background"
            aria-hidden
            className={classNames(
              'pointer-events-none absolute inset-0 -z-1 size-full object-cover',
              experiments.reorderRegistration && 'opacity-[.24] ',
            )}
            fetchPriority="high"
            loading="eager"
            role="presentation"
            sizes="(max-width: 655px) 450px, 1024px"
            {...imageSources}
          />
        )}
        <div
          className={classNames(
            'flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
            `${wrapperMaxWidth} mt-7.5 flex-1 content-center`,
          )}
        >
          <div className="mt-5 flex flex-1 flex-grow-0 flex-col tablet:mt-0 tablet:flex-grow laptop:mr-8 laptop:max-w-[27.5rem]">
            <OnboardingHeadline
              className={{
                title: 'tablet:typo-mega-1 typo-large-title',
                description:
                  'mb-8 text-text-primary typo-body tablet:typo-title2',
              }}
              title={headline}
              description={explainer}
            />
            <AuthOptions
              formRef={formRef}
              trigger={AuthTriggers.Onboarding}
              targetId={ExperimentWinner.OnboardingV4}
              simplified
              className={{
                container: classNames(
                  'w-full max-w-full rounded-none tablet:max-w-[30rem]',
                ),
                onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
              }}
              onboardingSignupButton={{
                size: isMobile ? ButtonSize.Medium : ButtonSize.Large,
                variant: ButtonVariant.Primary,
              }}
              defaultDisplay={AuthDisplay.OnboardingSignup}
              forceDefaultDisplay
              experiments={experiments}
            />
            {!experiments.reorderRegistration && (
              <SignupDisclaimer className="mb-4" />
            )}
          </div>
          <div className="flex flex-1 tablet:ml-auto tablet:flex-1 laptop:max-w-[37.5rem]" />
        </div>
        <FooterLinks className="mx-auto pb-6" />
      </div>
    </>
  );
};

export default FunnelOrganicRegistration;
