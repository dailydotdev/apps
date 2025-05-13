import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepOrganicRegistration } from '../types/funnel';
import { wrapperMaxWidth } from '../../../components/onboarding/common';
import { OnboardingHeadline } from '../../../components/auth';

export const FunnelOrganicRegistration = ({
  parameters,
}: FunnelStepOrganicRegistration): ReactElement => {
  const { headline, explainer, image, experiments: isExperiment } = parameters;

  return (
    <div className="z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden">
      {!!image && (
        <img
          {...image}
          alt="Onboarding background"
          aria-hidden
          className={classNames(
            'pointer-events-none absolute inset-0 -z-1 h-full w-full object-cover transition-opacity duration-300 tablet:object-center',
            isExperiment.reorderRegistration && 'opacity-[.24] ',
          )}
          fetchPriority="high"
          loading="eager"
          role="presentation"
          src={image.src}
          srcSet={image.srcSet}
          sizes="(max-width: 655px) 450px, 1024px"
        />
      )}
      <div
        className={classNames(
          'flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
          isExperiment.reorderRegistration &&
            `${wrapperMaxWidth} mt-7.5 flex-1 content-center`,
        )}
      >
        <div className="mt-5 flex flex-1 flex-grow-0 flex-col tablet:mt-0 tablet:flex-grow laptop:mr-8 laptop:max-w-[27.5rem]">
          <OnboardingHeadline
            className={{
              title: 'tablet:typo-mega-1 typo-large-title',
              description: 'mb-8 typo-body tablet:typo-title2',
            }}
          />
        </div>
      </div>
    </div>
  );
};
