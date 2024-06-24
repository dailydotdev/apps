import React, { FormEvent, ReactElement } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import router, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import { SquadForm } from '@dailydotdev/shared/src/graphql/squads';
import {
  ManageSquadPageContainer,
  SquadSubTitle,
  SquadTitle,
} from '@dailydotdev/shared/src/components/squads/utils';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { useSquadCreate } from '@dailydotdev/shared/src/hooks/squads/useSquadCreate';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

const seo: NextSeoProps = {
  title: 'Create your Squad',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const NewSquad = (): ReactElement => {
  const { isReady: isRouteReady } = useRouter();
  const { user, isAuthReady, isFetched } = useAuthContext();
  const { onCreateSquad, isLoading } = useSquadCreate();

  const onCreate = async (e: FormEvent, squadForm: SquadForm) => {
    e.preventDefault();

    onCreateSquad(squadForm);
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
      <SquadDetails
        form={{ public: false }}
        onRequestClose={handleClose}
        onSubmit={onCreate}
        createMode
        isLoading={isLoading}
      >
        <div
          style={{
            backgroundImage: `url(${cloudinary.squads.createSquad})`,
          }}
          className="mb-6 flex h-52 w-full flex-col items-center justify-center bg-cover bg-center"
        >
          <SourceIcon size={IconSize.XXXLarge} />
          <SquadTitle className="mb-2">Create new Squad</SquadTitle>
          <SquadSubTitle>
            Create a group where you can learn and interact privately with other
            developers around topics that matter to you
          </SquadSubTitle>
        </div>
      </SquadDetails>
    </ManageSquadPageContainer>
  );
};

NewSquad.getLayout = getMainLayout;

export default NewSquad;
