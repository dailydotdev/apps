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
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../components/layouts/MainLayout';
import ProtectedPage from '../../../components/ProtectedPage';
import { getPageSeoTitles } from '../../../components/layouts/utils';

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
        <AgentSettingsPane
          interest={interest}
          update={update}
          isUpdating={isUpdating}
          backHref={`${webappUrl}agent/${id}`}
          onDelete={() => deleteInterest(id).catch(() => undefined)}
          isDeleting={isDeleting}
        />
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
