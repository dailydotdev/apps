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
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
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
  const isMobile = useViewSize(ViewSize.MobileL);

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
        form={{}}
        onRequestClose={handleClose}
        onSubmit={onCreate}
        createMode
        isLoading={isLoading}
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
                ? cloudinary.squads.createSquad.mobile
                : cloudinary.squads.createSquad.biggerThanMobile
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
