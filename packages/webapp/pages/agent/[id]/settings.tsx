import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { featureInterestAgent } from '@dailydotdev/shared/src/lib/featureManagement';
import type { UpdateInterestInput } from '@dailydotdev/shared/src/graphql/interests';
import { interestQueryOptions } from '@dailydotdev/shared/src/features/interests/queries';
import { useUpdateInterest } from '@dailydotdev/shared/src/features/interests/hooks/useUpdateInterest';
import { useDeleteInterest } from '@dailydotdev/shared/src/features/interests/hooks/useDeleteInterest';
import { useAgentShellHeight } from '@dailydotdev/shared/src/features/interests/shell';
import { AgentSettingsPane } from '@dailydotdev/shared/src/features/interests/components/AgentSettingsPane';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../components/layouts/MainLayout';
import ProtectedPage from '../../../components/ProtectedPage';
import { getPageSeoTitles } from '../../../components/layouts/utils';

const Block = ({ className }: { className: string }): ReactElement => (
  <ElementPlaceholder
    className={classNames('agent-skeleton rounded-8', className)}
  />
);

const SettingsSkeleton = (): ReactElement => (
  <>
    <FlexRow
      className="h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:px-4"
      aria-busy
      aria-label="Loading the agent settings"
    >
      <Block className="size-8 rounded-10" />
      <Block className="h-4 w-40" />
    </FlexRow>
    <div className="min-h-0 flex-1 overflow-hidden px-5 tablet:px-8 laptop:px-10">
      <FlexCol className="mx-auto w-full max-w-[45rem] gap-8 pt-6">
        <FlexCol className="gap-2.5">
          <Block className="h-4 w-40" />
          <Block className="h-10 w-full rounded-12" />
        </FlexCol>
        <FlexCol className="gap-2.5">
          <Block className="h-4 w-56" />
          <Block className="h-10 w-full rounded-12" />
        </FlexCol>
        <FlexCol className="gap-2.5">
          <Block className="h-4 w-48" />
          <Block className="h-6 w-2/3 rounded-12" />
        </FlexCol>
      </FlexCol>
    </div>
  </>
);

const AgentSettingsPage = ({ id }: { id: string }): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isAuthReady && !!user,
  });
  const isGatedOut = isAuthReady && !!user && !showAgent;
  const isQueryEnabled = showAgent && !!user?.id && !!id;

  const interestQuery = useQuery({
    ...interestQueryOptions(id, user),
    enabled: isQueryEnabled,
  });
  const { isUpdating, updateInterest } = useUpdateInterest(id);
  const { isDeleting, deleteInterest } = useDeleteInterest({
    onDeleted: () => router.push(`${webappUrl}agent`),
  });
  const shellHeight = useAgentShellHeight();

  const interest = interestQuery.data ?? undefined;

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isGatedOut) {
    return null;
  }

  const update = (data: UpdateInterestInput) => {
    if (!interest) {
      return;
    }

    updateInterest(data).catch(() => undefined);
  };

  return (
    <ProtectedPage>
      <FlexCol
        className={classNames(
          'w-full overflow-hidden laptop:pt-2',
          shellHeight,
        )}
      >
        {interest ? (
          <AgentSettingsPane
            interest={interest}
            update={update}
            isUpdating={isUpdating}
            backHref={`${webappUrl}agent/${id}`}
            onDelete={() => deleteInterest(id).catch(() => undefined)}
            isDeleting={isDeleting}
          />
        ) : (
          <SettingsSkeleton />
        )}
      </FlexCol>
    </ProtectedPage>
  );
};

const Page = (): ReactElement | null => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  return <AgentSettingsPage id={router.query.id as string} />;
};

const getAgentLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Interest'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getAgentLayout;
Page.layoutProps = { seo, screenCentered: false, hideFeedbackWidget: true };

export default Page;
