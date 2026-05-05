import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
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
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  SourceMemberRole,
  type Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultSeo } from '../../../next-seo';

interface SquadSectionProps {
  squads: Squad[];
  title: string;
}

const getCurrentMemberRole = (squad: Squad): SourceMemberRole => {
  const role = squad.currentMember?.role;

  if (!role) {
    throw new Error(
      `Missing current member role for joined squad "${squad.handle}"`,
    );
  }

  return role;
};

const isPrivilegedSquad = (squad: Squad): boolean => {
  const role = getCurrentMemberRole(squad);

  return [SourceMemberRole.Admin, SourceMemberRole.Moderator].includes(role);
};

const SquadSection = ({ squads, title }: SquadSectionProps): ReactElement => {
  return (
    <section className="flex flex-col gap-3">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        bold
      >
        {title}
      </Typography>
      <div className="flex flex-col gap-3" role="list">
        {squads.map((squad) => (
          <SquadList
            role="listitem"
            key={squad.handle}
            squad={squad}
            shouldShowCount={false}
          />
        ))}
      </div>
    </section>
  );
};

function MySquadsPage(): ReactElement | null {
  const { count, isModeratorInAnySquad } = useSquadPendingPosts();
  const { isAuthReady, squads } = useAuthContext();
  const router = useRouter();
  const { privilegedSquads, memberSquads } = useMemo(() => {
    return (squads ?? []).reduce(
      (result, squad) => {
        if (isPrivilegedSquad(squad)) {
          result.privilegedSquads.push(squad);
          return result;
        }

        result.memberSquads.push(squad);
        return result;
      },
      {
        privilegedSquads: [] as Squad[],
        memberSquads: [] as Squad[],
      },
    );
  }, [squads]);

  useEffect(() => {
    if (!isAuthReady || squads?.length !== 0 || count > 0) {
      return;
    }

    router.replace(squadCategoriesPaths.discover);
  }, [count, isAuthReady, router, squads?.length]);

  if (isAuthReady && squads?.length === 0 && count === 0) {
    return null;
  }

  return (
    <SquadDirectoryLayout className="gap-6">
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
      {privilegedSquads.length > 0 && (
        <SquadSection title="Admin and moderator" squads={privilegedSquads} />
      )}
      {memberSquads.length > 0 && (
        <SquadSection title="Member" squads={memberSquads} />
      )}
    </SquadDirectoryLayout>
  );
}

const seo: NextSeoProps = { ...defaultSeo, title: 'My Squads' };

MySquadsPage.getLayout = getLayout;
MySquadsPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default MySquadsPage;
