'use client';

import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { StepHeadlineAlign } from '../shared/StepHeadline';
import StepHeadline from '../shared/StepHeadline';
import { Image } from '../../../components/image/Image';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import type { FunnelStepFact } from '../types/funnel';

export type FunnelInformativeProps = FunnelStepFact & {
  onTransition: () => void;
};

const FunnelInformative = ({
  parameters,
  onTransition,
}: FunnelInformativeProps): ReactElement => {
  return (
    <div className="flex min-h-dvh flex-col px-6 pb-20 pt-10">
      <div
        data-testid="informative-content"
        className={classNames(
          'flex flex-1 items-center gap-6',
          parameters?.reverse
            ? 'flex-col-reverse justify-end'
            : 'flex-col justify-between',
        )}
      >
        <StepHeadline
          heading={parameters?.headline}
          description={parameters?.explainer}
          align={parameters?.align as StepHeadlineAlign}
        />
        {parameters?.visualUrl && (
          <Image
            src={parameters?.visualUrl}
            className="max-h-48 w-auto mobileL:max-h-64"
            alt="Supportive illustration for the information"
          />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-4 w-full px-4">
        <Button
          className="w-full"
          variant={ButtonVariant.Primary}
          onClick={onTransition}
        >
          {parameters?.cta ?? 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default FunnelInformative;
