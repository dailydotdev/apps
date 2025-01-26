import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { useRouter } from 'next/router';
import {
  squadCategoriesPaths,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import type { NextSeoProps } from 'next-seo';

import { useSquadPendingPosts } from '@dailydotdev/shared/src/hooks/squads/useSquadPendingPosts';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons';

import {
  Typography,
  TypographyColor,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultSeo } from '../../../next-seo';

function MySquadsPage(): ReactElement {
  const { count, isModeratorInAnySquad } = useSquadPendingPosts();
  const { squads } = useAuthContext();
  const router = useRouter();

  if (squads?.length === 0 && count === 0) {
    router.push(squadCategoriesPaths.discover);
    return null;
  }

  return (
    <SquadDirectoryLayout className="gap-3">
      {isModeratorInAnySquad && count > 0 && (
        <Button
          className="!px-0"
          tag="a"
          href={`${webappUrl}squads/moderate`}
          variant={ButtonVariant.Option}
          icon={<TimerIcon />}
        >
          Pending posts
          <Typography
            color={TypographyColor.Tertiary}
            bold
            className="ml-auto flex h-10 w-[4.858125rem] items-center justify-center rounded-12 bg-surface-float"
          >
            {count}
          </Typography>
        </Button>
      )}
      {squads?.map((squad) => (
        <SquadList key={squad.handle} squad={squad} shouldShowCount={false} />
      ))}
    </SquadDirectoryLayout>
  );
}

const seo: NextSeoProps = { ...defaultSeo, title: 'My Squads' };

MySquadsPage.getLayout = getLayout;
MySquadsPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default MySquadsPage;
