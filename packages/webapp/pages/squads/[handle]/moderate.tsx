import React, { ReactElement } from 'react';
import {
  ManageSquadPageContainer,
  SquadSettingsProps,
} from '@dailydotdev/shared/src/components/squads/utils';
import {
  SquadTab,
  SquadTabs,
} from '@dailydotdev/shared/src/components/squads/SquadTabs';
import { SquadModerationItem } from '@dailydotdev/shared/src/components/squads/moderation/SquadModerationItem';
import {
  PageHeader,
  PageHeaderTitle,
} from '@dailydotdev/shared/src/components/layout/common';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon, VIcon } from '@dailydotdev/shared/src/components/icons';

import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useSquadPendingPosts } from '@dailydotdev/shared/src/hooks/squads/useSquadPendingPosts';
import { useSquadPostModeration } from '@dailydotdev/shared/src/hooks/squads/useSquadPostModeration';

import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

export default function ModerateSquadPage({
  handle,
}: SquadSettingsProps): ReactElement {
  const { onApprove, onReject, isLoading } = useSquadPostModeration();
  const { data } = useSquadPendingPosts();
  const [value] = data;

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
        {data?.length > 1 && (
          <span className="flex w-full flex-row justify-end border-b border-border-subtlest-tertiary px-4 py-3">
            <Button
              icon={<VIcon secondary />}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
            >
              Approve all {data.length} posts
            </Button>
          </span>
        )}
        <SquadModerationItem
          data={value}
          isLoading={isLoading}
          onReject={onReject}
          onApprove={(id) => onApprove([id])}
        />
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
