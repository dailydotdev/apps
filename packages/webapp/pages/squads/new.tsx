import React, { ReactElement, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import router, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import {
  ManageSquadPageContainer,
  SquadSubTitle,
  SquadTitle,
} from '@dailydotdev/shared/src/components/squads/utils';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { useSquadCreate } from '@dailydotdev/shared/src/hooks/squads/useSquadCreate';
import {
  cloudinarySquadsCreateSquadMobile,
  cloudinarySquadsCreateSquadBiggerThanMobile,
} from '@dailydotdev/shared/src/lib/image';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useIntegrationQuery } from '@dailydotdev/shared/src/hooks/integrations/useIntegrationQuery';

import { useSlackConnectSourceMutation } from '@dailydotdev/shared/src/hooks/integrations/slack/useSlackConnectSourceMutation';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Create your Squad',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const NewSquad = (): ReactElement => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>();
  const { isReady: isRouteReady, query } = useRouter();
  const { user, isAuthReady, isFetched } = useAuthContext();
  const { onSave } = useSlackConnectSourceMutation();
  const shouldLoadIntegration = query?.fs && !query?.error;
  const integrationId = query?.iid as string;

  const { onCreateSquad, isLoading } = useSquadCreate({
    onSuccess: async (squad) => {
      if (selectedChannel) {
        await onSave({
          channelId: selectedChannel,
          integrationId,
          sourceId: squad.id,
        });
      }

      router.push(squad.permalink);
    },
  });
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data, isLoading: isIntegrationLoading } = useIntegrationQuery({
    id: integrationId,
    queryOptions: { enabled: !!shouldLoadIntegration && !!integrationId },
  });

  const initialHandle = data?.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

  const handleClose = async () => {
    router.push('/squads');
  };

  if (
    !isFetched ||
    !isAuthReady ||
    !isRouteReady ||
    (isIntegrationLoading && !!shouldLoadIntegration)
  ) {
    return <MangeSquadPageSkeleton />;
  }

  if (!user) {
    return <Unauthorized />;
  }

  return (
    <ManageSquadPageContainer>
      <NextSeo {...seo} titleTemplate="%s | daily.dev" noindex nofollow />
      <SquadDetails
        onRequestClose={handleClose}
        onSubmit={(e, form, channelId) => {
          setSelectedChannel(channelId);
          onCreateSquad(form);
        }}
        isLoading={isLoading}
        initialData={{
          name: data?.name,
          handle: initialHandle,
        }}
        integrationId={integrationId}
      >
        <div className="flex flex-col-reverse bg-cover bg-center tablet:flex-row">
          <div className="mx-6 my-5 flex flex-1 flex-col gap-2">
            <SquadTitle className="flex flex-row">
              <SourceIcon className="mr-0.5" size={IconSize.XLarge} />
              Create new Squad
            </SquadTitle>
            <SquadSubTitle>
              Create a group where you can learn and interact privately with
              other developers around topics that matter to you
            </SquadSubTitle>
          </div>
          <img
            className="w-full tablet:h-[9.6875rem] tablet:w-[15.625rem]"
            src={
              isMobile
                ? cloudinarySquadsCreateSquadMobile
                : cloudinarySquadsCreateSquadBiggerThanMobile
            }
            alt="A collection of other people's avatars"
          />
        </div>
      </SquadDetails>
    </ManageSquadPageContainer>
  );
};

NewSquad.getLayout = getMainLayout;

export default NewSquad;
