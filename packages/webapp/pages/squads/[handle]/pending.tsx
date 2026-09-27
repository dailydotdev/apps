import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SquadPendingPostsPage } from '@dailydotdev/shared/src/features/squads/components/SquadSubPages';
import { useSquadPageContext } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import {
  getSquadManageUrl,
  SquadManageSection,
} from '@dailydotdev/shared/src/features/squads/lib/routes';
import type { SquadRouteProps } from '../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  getSquadRouteProps,
  SquadRoute,
} from '../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../next-seo';

// Moderators review the whole queue in Manage, not their own posts here.
const PendingPosts = (): ReactElement | null => {
  const router = useRouter();
  const { squad, isViewerReady } = useSquadPageContext();
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);

  useEffect(() => {
    if (isViewerReady && isModerator) {
      router.replace(
        getSquadManageUrl(squad.handle, SquadManageSection.Moderation),
      );
    }
  }, [isModerator, isViewerReady, router, squad.handle]);

  if (!isViewerReady || isModerator) {
    return null;
  }

  return <SquadPendingPostsPage />;
};

const SquadPendingPosts = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <PendingPosts />
  </SquadRoute>
);

SquadPendingPosts.getLayout = getSquadRouteLayout;
SquadPendingPosts.layoutProps = {
  seo: { title: 'Pending posts', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadPendingPosts;
