import React, { ReactElement } from 'react';
import {
  ManageSquadPageContainer,
  SquadSettingsProps,
} from '@dailydotdev/shared/src/components/squads/utils';
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
import { sharePost } from '@dailydotdev/shared/__tests__/fixture/post';

import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import {
  SourcePostModeration,
  SourcePostModerationStatus,
} from '@dailydotdev/shared/src/graphql/squads';

import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

export default function ModerateSquadPage({
  handle,
}: SquadSettingsProps): ReactElement {
  const [data]: SourcePostModeration[] = [
    {
      postId: '1',
      moderatorId: null,
      sourceId: 'a',
      status: SourcePostModerationStatus.Pending,
      createdAt: new Date(),
      post: sharePost,
    },
  ];

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
      <SquadTabs active={SquadTab.PendingPosts} handle={handle} />
      <div className="flex flex-col">
        <SquadModerationList data={data} />
      </div>
    </ManageSquadPageContainer>
  );
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface SquadPageParams extends ParsedUrlQuery {
  handle: string;
}

export function getStaticProps({
  params,
}: GetStaticPropsContext<SquadPageParams>): GetStaticPropsResult<SquadSettingsProps> {
  return {
    props: {
      handle: params.handle,
    },
  };
}

ModerateSquadPage.getLayout = getMainLayout;
