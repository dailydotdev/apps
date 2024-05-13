import React, { ReactElement, useContext } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import router, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { SquadForm, createSquad } from '@dailydotdev/shared/src/graphql/squads';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import {
  ManageSquadPageContainer,
  ManageSquadPageMain,
} from '@dailydotdev/shared/src/components/squads/utils';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useActions } from '@dailydotdev/shared/src/hooks/useActions';
import { useSquads } from '@dailydotdev/shared/src/hooks/squads/useSquads';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

const seo: NextSeoProps = {
  title: 'Create your Squad',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const NewSquad = (): ReactElement => {
  const { isReady: isRouteReady } = useRouter();
  const { user, isAuthReady, isFetched } = useAuthContext();
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { addSquad } = useSquads();
  const { completeAction } = useActions();

  const onCreate = async (e, newSquadForm: SquadForm) => {
    e.preventDefault();
    const data = { ...newSquadForm } as SquadForm;

    try {
      const newSquad = await createSquad({ ...data });

      trackEvent({
        event_name: AnalyticsEvent.CompleteSquadCreation,
      });

      await addSquad(newSquad);
      completeAction(ActionType.CreateSquad);

      await router.replace(newSquad.permalink);
    } catch (err) {
      displayToast(DEFAULT_ERROR);
    }
  };

  const handleClose = async () => {
    router.push('/squads');
  };

  if (!isFetched || !isAuthReady || !isRouteReady) {
    return <MangeSquadPageSkeleton />;
  }

  if (!user) {
    return <Unauthorized />;
  }

  return (
    <ManageSquadPageContainer>
      <NextSeo {...seo} titleTemplate="%s | daily.dev" noindex nofollow />
      <ManageSquadPageMain>
        <SquadDetails
          className="p-8 pt-0"
          form={{ public: false }}
          onRequestClose={handleClose}
          onSubmit={onCreate}
          createMode
        />
      </ManageSquadPageMain>
    </ManageSquadPageContainer>
  );
};

NewSquad.getLayout = getMainLayout;

export default NewSquad;
