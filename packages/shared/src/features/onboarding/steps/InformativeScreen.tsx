'use client';

import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import StepHeadline from '../shared/StepHeadline';
import { Image } from '../../../components/image/Image';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import type { FunnelStepFact } from '../types/funnel';

const InformativeScreen = ({ parameters }: FunnelStepFact): ReactElement => {
  return (
    <div
      className="flex max-h-screen min-h-screen flex-col px-6 pb-4 pt-10"
      style={{
        background:
          'radial-gradient(192.5% 100% at 50% 100%, #CE3DF3 0%, rgba(113, 71, 237, 0.72) 50%, rgba(113, 71, 237, 0.00) 100%), #0E1217',
      }}
    >
      <div
        className={classNames(
          'flex flex-1 items-center justify-between',
          parameters?.reverse ? 'flex-col-reverse' : 'flex-col',
        )}
      >
        <StepHeadline
          headline={parameters?.headline}
          explainer={parameters?.explainer}
          align={parameters?.align as 'center' | 'left'}
          visualUrl={parameters?.visualUrl}
        />
        <Image
          src={parameters?.visualUrl}
          className="max-h-64 w-full"
          alt="Illustration"
        />
      </div>
      <div className="px-4">
        <Button className="w-full" variant={ButtonVariant.Primary}>
          {parameters?.cta ?? 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default InformativeScreen;
