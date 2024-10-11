import React, { ReactElement } from 'react';
import { ManageSquadPageContainer } from '@dailydotdev/shared/src/components/squads/utils';
import {
  SquadTab,
  SquadTabs,
} from '@dailydotdev/shared/src/components/squads/SquadTabs';
import { SquadModerationList } from '@dailydotdev/shared/src/components/squads/moderation/SquadModerationList';
import {
  PageHeader,
  PageHeaderTitle,
} from '@dailydotdev/shared/src/components/layout/common';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import {
  getSquadStaticFields,
  SquadStaticData,
} from '@dailydotdev/shared/src/graphql/squads';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

interface ModerateSquadPageProps {
  squad: SquadStaticData;
}

export default function ModerateSquadPage({
  squad: squadProps,
}: ModerateSquadPageProps): ReactElement {
  const { squad } = useSquad({ handle: squadProps.handle });

  return (
    <ManageSquadPageContainer>
      <PageHeader className="border-b-0">
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<ArrowIcon className="-rotate-90" />}
        />
        <PageHeaderTitle className="typo-title3">
          Squad settings
        </PageHeaderTitle>
      </PageHeader>
      <SquadTabs
        active={SquadTab.PendingPosts}
        handle={squadProps.handle}
        pendingCount={squad?.moderationPostCount}
      />
      <SquadModerationList squad={squad} />
    </ManageSquadPageContainer>
  );
}

interface SquadPageParams extends ParsedUrlQuery {
  handle: string;
}

export async function getServerSideProps({
  params,
  res,
}: GetServerSidePropsContext<SquadPageParams>): Promise<
  GetServerSidePropsResult<ModerateSquadPageProps>
> {
  const setCacheHeader = () => {
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${oneHour}, stale-while-revalidate=${oneHour}`,
    );
  };

  try {
    const squad = await getSquadStaticFields(params.handle);

    setCacheHeader();

    if (!squad) {
      return { redirect: { destination: '/404', permanent: false } };
    }

    if (!squad.moderationRequired) {
      return { redirect: { destination: squad.permalink, permanent: false } };
    }

    return { props: { squad } };
  } catch (err) {
    return { redirect: { destination: '/404', permanent: false } };
  }
}

ModerateSquadPage.getLayout = getMainLayout;
