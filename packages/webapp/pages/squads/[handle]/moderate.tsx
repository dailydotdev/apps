import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { SquadSettingsProps } from '@dailydotdev/shared/src/components/squads/utils';
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
import { useSquad } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

export default function ModerateSquadPage({
  handle,
}: SquadSettingsProps): ReactElement {
  const router = useRouter();
  const { squad, isLoading, isFetched } = useSquad({ handle });
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);

  useEffect(() => {
    if (isLoading || !isFetched) {
      return;
    }

    if (!squad) {
      router.push(`/404`);
      return;
    }

    if (!squad.moderationRequired) {
      router.push(`/squads/${handle}`);
    }
  }, [handle, isFetched, isLoading, router, squad]);

  if (isLoading || !squad) {
    return null;
  }

  return (
    <ManageSquadPageContainer>
      <PageHeader className="border-b-0">
        <Button
          href={`/squads/${squad.handle}`}
          icon={<ArrowIcon className="-rotate-90" />}
          tag="a"
          variant={ButtonVariant.Tertiary}
        />
        <PageHeaderTitle bold type={TypographyType.Title3}>
          {isModerator ? 'Squad settings' : 'Pending posts'}
        </PageHeaderTitle>
      </PageHeader>
      <SquadTabs active={SquadTab.PendingPosts} squad={squad} />
      <SquadModerationList squad={squad} />
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
