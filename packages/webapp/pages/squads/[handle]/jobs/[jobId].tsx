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

interface SquadJobProps extends SquadRouteProps {
  jobId: string;
}

const SquadJob = ({ handle, jobId }: SquadJobProps): ReactElement => (
  <SquadRoute handle={handle} feature="jobs">
    <SquadJobPage jobId={jobId} />
  </SquadRoute>
);

SquadJob.getLayout = getSquadRouteLayout;
SquadJob.layoutProps = {
  seo: { title: 'Squad job', ...noindexSeoProps },
};

interface Params extends ParsedUrlQuery {
  handle: string;
  jobId: string;
}

export const getServerSideProps: GetServerSideProps<
  SquadJobProps,
  Params
> = async ({ params }) => {
  if (!params?.handle || !params.jobId) {
    return { notFound: true };
  }

  return { props: { handle: params.handle, jobId: params.jobId } };
};

export default SquadJob;
