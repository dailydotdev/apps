import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import type { SquadRouteProps } from '../../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  SquadRoute,
} from '../../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../../next-seo';

interface SquadEditJobProps extends SquadRouteProps {
  jobId: string;
}

const SquadEditJob = ({ handle, jobId }: SquadEditJobProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage section={SquadManageSection.Jobs} jobId={jobId} />
  </SquadRoute>
);

SquadEditJob.getLayout = getSquadRouteLayout;
SquadEditJob.layoutProps = {
  seo: { title: 'Edit role', ...noindexSeoProps },
};

interface Params extends ParsedUrlQuery {
  handle: string;
  jobId: string;
}

export const getServerSideProps: GetServerSideProps<
  SquadEditJobProps,
  Params
> = async ({ params }) => {
  if (!params?.handle || !params.jobId) {
    return { notFound: true };
  }

  return { props: { handle: params.handle, jobId: params.jobId } };
};

export default SquadEditJob;
