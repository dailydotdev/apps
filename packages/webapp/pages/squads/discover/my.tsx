import React, { ReactElement } from 'react';
import { NextSeo } from 'next-seo';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { useRouter } from 'next/router';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultSeo } from '../../../next-seo';

function MySquadsPage(): ReactElement {
  const { squads } = useAuthContext();
  const router = useRouter();

  if (squads?.length === 0) {
    router.push(squadCategoriesPaths.discover);
    return null;
  }

  return (
    <SquadDirectoryLayout className="gap-3">
      <NextSeo {...defaultSeo} title="My Squads" />
      {squads?.map((squad) => (
        <SquadList key={squad.handle} squad={squad} shouldShowCount={false} />
      ))}
    </SquadDirectoryLayout>
  );
}

MySquadsPage.getLayout = getLayout;
MySquadsPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default MySquadsPage;
