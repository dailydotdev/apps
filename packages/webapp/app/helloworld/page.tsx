import type { AppPageProps } from '@dailydotdev/shared/src/features/common/types/page';
import type { ReactElement } from 'react';
import React from 'react';
import { cookies } from 'next/headers';
import { HydrationBoundary } from '@tanstack/react-query';
import InformativeScreen from '@dailydotdev/shared/src/features/onboarding/steps/InformativeScreen';
import type { FunnelStepFact } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { getAppBootData } from '../app-boot';

async function getIdAndVersion({
  params,
  searchParams,
}): Promise<Partial<Record<'id' | 'version', string>>> {
  const { id } = await params;
  const { version } = await searchParams;

  return { id, version };
}

const funnelStepFact: FunnelStepFact = {
  parameters: {
    headline: 'Staying motivated is about to become easier',
    explainer:
      'Even the most driven people hit roadblocks. We’re here to help turn your ambition into consistent progress. Ready?',
    visualUrl: 'https://i.imgur.com/OtR3Igy.png',
    align: 'center',
    // reverse: false,
  },
  type: FunnelStepType.Fact,
  id: '1',
  transitions: [],
};

export default async function Page(props: AppPageProps): Promise<ReactElement> {
  const allCookies = (await cookies()).toString();
  const { state } = await getAppBootData({
    cookies: allCookies,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, version } = await getIdAndVersion(props);

  return (
    <HydrationBoundary state={state}>
      {/* <h1 className="mb-4 text-xl font-bold">Hello world funnel</h1>
      <p>
        <strong>Server</strong> says user is {boot?.user?.id ?? 'not logged'} -{' '}
        {boot?.user?.email ?? 'no email'}
      </p>
      <ClientTest /> */}
      <InformativeScreen {...funnelStepFact} />
    </HydrationBoundary>
  );
}
