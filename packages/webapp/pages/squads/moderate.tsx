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
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

export default function ModerateSquadPage({
  handle,
}: SquadSettingsProps): ReactElement {
  const router = useRouter();
  const { squad, isLoading, isFetched } = useSquad({
    handle: router.query.handle as string,
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
        {handle && (
          <Button
            href={`/squads/${squad.handle}`}
            icon={<ArrowIcon className="-rotate-90" />}
            tag="a"
            variant={ButtonVariant.Tertiary}
          />
        )}
        <PageHeaderTitle bold type={TypographyType.Title3}>
          {isModerator ? 'Squad settings' : 'Pending posts'}
        </PageHeaderTitle>
      </PageHeader>
      {handle && <SquadTabs active={SquadTab.PendingPosts} squad={squad} />}
      <SquadModerationList squad={squad} />
    </ManageSquadPageContainer>
  );
}

ModerateSquadPage.getLayout = getMainLayout;
