import React, { ReactElement, useEffect } from 'react';
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

import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

export default function ModerateSquadPage({
  handle,
}: SquadSettingsProps): ReactElement {
  const router = useRouter();
  const { squad, isLoading } = useSquad({ handle });
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);

  useEffect(() => {
    if (!isLoading && squad && !squad.moderationRequired) {
      router.push(`/squads/${handle}`);
    }

    if (!isLoading && !squad) {
      router.push(`/404`);
    }
  }, [handle, isLoading, router, squad]);

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
        <PageHeaderTitle className="typo-title3">Squad</PageHeaderTitle>
      </PageHeader>
      <SquadTabs
        active={SquadTab.PendingPosts}
        handle={handle}
        pendingCount={squad?.moderationPostCount}
        showSettings={isModerator}
      />
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
