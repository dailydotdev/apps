import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import React from 'react';
import { useRouter } from 'next/router';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { canGoBackInApp } from '@dailydotdev/shared/src/components/shell/shellNav';
import { SquadModerationList } from '@dailydotdev/shared/src/components/squads/moderation/SquadModerationList';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons/MoveTo';
import {
  Typography,
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
  title: 'Moderation',
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
  // The queue opens from My Squads, so with nothing in-app to go back to it
  // returns there rather than off the site.
  const onBack = () =>
    canGoBackInApp()
      ? router.back()
      : router.push(squadCategoriesPaths['My Squads']);

  return (
    <>
      <ShellPage title="Moderation" onBack={onBack} />
      <main className="mx-auto flex w-full flex-col border-border-subtlest-tertiary laptop:my-4 laptop:max-w-3xl laptop:rounded-16 laptop:border">
        <header className="hidden h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-6 tablet:flex">
          <Button
            onClick={onBack}
            icon={<MoveToIcon className="rotate-180" />}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            aria-label="Back"
          />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Title3}
            bold
            truncate
          >
            Moderation
          </Typography>
        </header>
        <SquadModerationList squad={undefined} isModerator />
      </main>
    </>
  );
}

ModerateSquadPage.getLayout = getMainLayout;
ModerateSquadPage.layoutProps = { seo };
