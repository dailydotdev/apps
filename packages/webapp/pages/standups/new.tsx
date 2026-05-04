import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { CreateLiveRoomForm } from '@dailydotdev/shared/src/components/liveRooms/CreateLiveRoomForm';
import { WritePageContainer } from '@dailydotdev/shared/src/components/post/freeform/write/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Start a standup');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  nofollow: true,
  noindex: true,
  ...defaultSeo,
};

const NewStandupPage = (): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady, isFetched } = useAuthContext();

  if (!isFetched || !isAuthReady) {
    return (
      <WritePageContainer>
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      </WritePageContainer>
    );
  }

  if (!user) {
    return <Unauthorized />;
  }

  return (
    <WritePageContainer>
      <header className="flex h-16 flex-row items-center border-b border-border-subtlest-tertiary px-6 py-4">
        <h1 className="font-bold typo-title3">Start a standup</h1>
      </header>
      <div className="flex flex-col px-6 py-5">
        <CreateLiveRoomForm
          onCancel={() => router.push('/')}
          onCreated={(joinToken) => {
            router.push(`/standups/${joinToken.room.id}`);
          }}
        />
      </div>
    </WritePageContainer>
  );
};

NewStandupPage.getLayout = getMainLayout;
NewStandupPage.layoutProps = { seo };

export default NewStandupPage;
