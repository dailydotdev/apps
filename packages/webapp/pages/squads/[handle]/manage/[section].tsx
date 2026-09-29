import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import type { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { isSquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import type { SquadRouteProps } from '../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  SquadRoute,
} from '../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../next-seo';

interface SquadManageSectionProps extends SquadRouteProps {
  section: SquadManageSection;
}

const SquadManageSectionPage = ({
  handle,
  section,
}: SquadManageSectionProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage key={section} section={section} />
  </SquadRoute>
);

SquadManageSectionPage.getLayout = getSquadRouteLayout;
SquadManageSectionPage.layoutProps = {
  seo: { title: 'Manage Squad', ...noindexSeoProps },
};

interface Params extends ParsedUrlQuery {
  handle: string;
  section: string;
}

export const getServerSideProps: GetServerSideProps<
  SquadManageSectionProps,
  Params
> = async ({ params }) => {
  if (!params?.handle || !isSquadManageSection(params.section)) {
    return { notFound: true };
  }

  return { props: { handle: params.handle, section: params.section } };
};

export default SquadManageSectionPage;
