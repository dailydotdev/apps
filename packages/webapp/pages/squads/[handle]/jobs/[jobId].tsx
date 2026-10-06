import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { SquadJobPage } from '@dailydotdev/shared/src/features/squads/components/jobs/SquadJobs';
import type { SquadRouteProps } from '../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  SquadRoute,
} from '../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../next-seo';

interface SquadJobRouteProps extends SquadRouteProps {
  jobId: string;
}

// A role's own page: a squad sub-page, like Products or Members.
const SquadJobRoute = ({ handle, jobId }: SquadJobRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadJobPage jobId={jobId} />
  </SquadRoute>
);

SquadJobRoute.getLayout = getSquadRouteLayout;
SquadJobRoute.layoutProps = {
  seo: { title: 'Squad role', ...noindexSeoProps },
};

interface Params extends ParsedUrlQuery {
  handle: string;
  jobId: string;
}

export const getServerSideProps: GetServerSideProps<
  SquadJobRouteProps,
  Params
> = async ({ params }) => {
  if (!params?.handle || !params.jobId) {
    return { notFound: true };
  }

  return { props: { handle: params.handle, jobId: params.jobId } };
};

export default SquadJobRoute;
