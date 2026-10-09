import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import { ManageSquadPageContainer } from '@dailydotdev/shared/src/components/squads/utils';
import { SquadModerationList } from '@dailydotdev/shared/src/components/squads/moderation/SquadModerationList';
import { PageHeaderTitle } from '@dailydotdev/shared/src/components/layout/common';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import {
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
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
  // The queue opens from My Squads, so arriving from outside the app goes
  // back there rather than off the site.
  const onBack = () =>
    document.referrer.startsWith(window.location.origin)
      ? router.back()
      : router.push(squadCategoriesPaths['My Squads']);

  return (
    <>
      {isPhone ? (
        <ShellPage title="Squad settings" />
      ) : (
        <header
          className={classNames(pageHeaderClassName, 'hidden tablet:flex')}
        >
          <Button
            onClick={onBack}
            icon={<ArrowIcon className="-rotate-90" />}
            variant={ButtonVariant.Tertiary}
            aria-label="Back"
          />
          <PageHeaderTitle
            bold
            type={TypographyType.Title3}
            tag={TypographyTag.H1}
          >
            Squad settings
          </PageHeaderTitle>
        </header>
      )}
      <ManageSquadPageContainer>
        <SquadModerationList squad={undefined} isModerator />
      </ManageSquadPageContainer>
    </>
  );
}

ModerateSquadPage.getLayout = getMainLayout;
ModerateSquadPage.layoutProps = { seo };
