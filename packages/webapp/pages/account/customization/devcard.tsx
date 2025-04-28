import React, { useState } from 'react';
import type { ReactElement } from 'react';

import dynamic from 'next/dynamic';
import type { NextSeoProps } from 'next-seo';

import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { defaultOpenGraph } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { getAccountLayout } from '../../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../../components/layouts/AccountLayout/AccountPageContainer';

const DevCardStep1 = dynamic(() =>
  import(
    /* webpackChunkName: "devCardStep1" */ '../../../components/layouts/AccountLayout/Customization/DevCard/DevCardStep1'
  ).then((mod) => mod.DevCardStep1),
);

const DevCardStep2 = dynamic(() =>
  import(
    /* webpackChunkName: "devCardStep1" */ '../../../components/layouts/AccountLayout/Customization/DevCard/DevCardStep2'
  ).then((mod) => mod.DevCardStep2),
);

const seo: NextSeoProps = {
  title: getTemplatedTitle('Grab your DevCard'),
  description:
    'DevCard will show you stats about the publications and topics you love to read. Generate yours now.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
    site_name: 'daily.dev',
  },
};

const Page = (): ReactElement => {
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { user, loadingUser } = useAuthContext();
  const isDevCardGenerated = checkHasCompleted(ActionType.DevCardGenerate);
  const [devCardSrc, setDevCarSrc] = useState<string>();
  const { logEvent } = useLogContext();

  const onGenerateDevCard = (url: string) => {
    setDevCarSrc(url);
    completeAction(ActionType.DevCardGenerate);
    logEvent({
      event_name: LogEvent.GenerateDevcard,
    });
  };

  if ((loadingUser || user) && !isActionsFetched) {
    return null;
  }
  return (
    <AccountPageContainer
      title="DevCard"
      className={{ section: 'gap-4 !px-0' }}
    >
      {isDevCardGenerated ? (
        <DevCardStep2 initialDevCardSrc={devCardSrc} />
      ) : (
        <DevCardStep1 onGenerateImage={onGenerateDevCard} />
      )}
    </AccountPageContainer>
  );
};

Page.getLayout = getAccountLayout;
Page.layoutProps = { seo };

export default Page;
