import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import { isDevelopment } from '../../../lib/constants';
import { GivebackProvider } from '../GivebackContext';
import { GivebackHero } from './GivebackHero';
import { CommunityGoalProgress } from './CommunityGoalProgress';
import { PersonalRoadmap } from './PersonalRoadmap';
import { GivebackReviewToggle } from './GivebackReviewToggle';

export const GivebackPage = (): ReactElement => {
  return (
    <GivebackProvider>
      <FlexCol className="mx-auto w-full max-w-3xl gap-6 px-4 py-6 tablet:py-10">
        <GivebackHero />
        <CommunityGoalProgress />
        <PersonalRoadmap />
      </FlexCol>
      {isDevelopment && <GivebackReviewToggle />}
    </GivebackProvider>
  );
};
