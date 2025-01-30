import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
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
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

interface ModerateSquadPageProps {
  handle: string | null;
}

export const getServerSideProps: GetServerSideProps<
  ModerateSquadPageProps
> = async ({ query }) => {
  return {
    props: {
      handle: (query.handle as string) || null,
    },
  };
};

export default function ModerateSquadPage({
  handle,
}: ModerateSquadPageProps): ReactElement {
  const router = useRouter();
  const { squad, isLoading, isFetched } = useSquad({
    handle,
  });
  const isModerator =
    verifyPermission(squad, SourcePermissions.ModeratePost) || !handle;

  useEffect(() => {
    if (isLoading || !isFetched) {
      return;
    }

    if (handle && !squad.moderationRequired) {
      router.push(`/squads/${handle}`);
    }
  }, [handle, isFetched, isLoading, router, squad]);

  if (isLoading) {
    return null;
  }

  return (
    <ManageSquadPageContainer>
      <PageHeader className="border-b-0">
        <Button
          onClick={() =>
            handle ? router.push(`/squads/${handle}`) : router.back()
          }
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
        />
        <PageHeaderTitle bold type={TypographyType.Title3}>
          {isModerator ? 'Squad settings' : 'Pending posts'}
        </PageHeaderTitle>
      </PageHeader>
      {handle && <SquadTabs active={SquadTab.PendingPosts} handle={handle} />}
      <SquadModerationList squad={squad} isModerator={isModerator} />
    </ManageSquadPageContainer>
  );
}

ModerateSquadPage.getLayout = getMainLayout;
