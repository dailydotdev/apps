import React, { ReactElement, useContext, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import router, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { SquadForm, createSquad } from '@dailydotdev/shared/src/graphql/squads';
import { useBoot } from '@dailydotdev/shared/src/hooks/useBoot';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons';
import {
  SquadTitle,
  SquadSubTitle,
  ManageSquadPageContainer,
  ManageSquadPageMain,
} from '@dailydotdev/shared/src/components/squads/utils';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useActions } from '@dailydotdev/shared/src/hooks/useActions';
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
  const { addSquad } = useBoot();
  const { completeAction } = useActions();
  const [form] = useState<Partial<SquadForm>>({
    public: false,
  });

  const onCreate = async (e, newSquadForm: SquadForm) => {
    e.preventDefault();
    const data = { ...newSquadForm } as SquadForm;

    try {
      const newSquad = await createSquad({ ...data });

      trackEvent({
        event_name: AnalyticsEvent.CompleteSquadCreation,
      });

      addSquad(newSquad);
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
      <NextSeo {...seo} titleTemplate="%s | daily.dev" />
      <ManageSquadPageMain>
        <div
          style={{
            backgroundImage: `url(${cloudinary.squads.createSquad})`,
          }}
          className="mb-6 flex h-52 w-full flex-col items-center justify-center bg-cover"
        >
          <SourceIcon size={IconSize.XXXLarge} />
          <SquadTitle className="mb-2">Create new Squad</SquadTitle>
          <SquadSubTitle>
            Create a group where you can learn and interact privately with other
            developers around topics that matter to you
          </SquadSubTitle>
        </div>
        <SquadDetails
          className="p-8 pt-0"
          form={form}
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
