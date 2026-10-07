import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import React from 'react';
import { useRouter } from 'next/router';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import { ManageSquadPageContainer } from '@dailydotdev/shared/src/components/squads/utils';
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
import { TypographyType } from '@dailydotdev/shared/src/components/typography/Typography';
import {
  getSquadManageUrl,
  SquadManageSection,
} from '@dailydotdev/shared/src/features/squads/lib/routes';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { noindexSeoProps } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Squad settings',
  ...noindexSeoProps,
};

// One squad's queue lives in its Manage area; this page keeps the queue of
// every squad the viewer moderates.
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const handle = typeof query.handle === 'string' ? query.handle : undefined;

  if (handle) {
    return {
      redirect: {
        destination: getSquadManageUrl(handle, SquadManageSection.Moderation),
        permanent: true,
      },
    };
  }

  return { props: {} };
};

export default function ModerateSquadPage(): ReactElement {
  const router = useRouter();
  const isPhone = useIsPhone();

  return (
    <ManageSquadPageContainer>
      {isPhone ? (
        <ShellPage title="Squad settings" />
      ) : (
        <PageHeader className="hidden border-b-0 tablet:flex">
          <Button
            onClick={() => router.back()}
            icon={<ArrowIcon className="-rotate-90" />}
            variant={ButtonVariant.Tertiary}
          />
          <PageHeaderTitle bold type={TypographyType.Title3}>
            Squad settings
          </PageHeaderTitle>
        </PageHeader>
      )}
      <SquadModerationList squad={undefined} isModerator />
    </ManageSquadPageContainer>
  );
}

ModerateSquadPage.getLayout = getMainLayout;
ModerateSquadPage.layoutProps = { seo };
