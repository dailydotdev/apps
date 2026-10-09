import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadFavoriteButton } from '@dailydotdev/shared/src/components/squads/SquadFavoriteButton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  squadCategoriesPaths,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { useSquadPendingPosts } from '@dailydotdev/shared/src/hooks/squads/useSquadPendingPosts';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
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
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import {
  SquadDiscoverFrame,
  squadDiscoverGridClassName,
} from '@dailydotdev/shared/src/features/squads/components/discover/SquadDiscoverListPage';
import { SquadDiscoverRow } from '@dailydotdev/shared/src/features/squads/components/discover/SquadDiscoverRow';
import { usePromotedSquad } from '@dailydotdev/shared/src/features/squads/components/discover/usePromotedSquad';
import { SquadDiscoverSection } from '@dailydotdev/shared/src/features/squads/components/discover/common';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { defaultSeo, noindexSeoProps } from '../../../next-seo';

const isPrivilegedSquad = (squad: Squad): boolean => {
  const role = squad.currentMember?.role;

  return role === SourceMemberRole.Admin || role === SourceMemberRole.Moderator;
};

const moderatePath = `${webappUrl}squads/moderate`;

const PendingPostsButton = ({
  count,
  squadNames,
}: {
  count: number;
  squadNames: string[];
}): ReactElement => (
  <Link href={moderatePath} passHref>
    <a
      href={moderatePath}
      className="col-span-full mb-3 flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 transition-colors hover:bg-surface-hover"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-accent-bun-flat text-accent-bun-default">
        <TimerIcon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <Typography type={TypographyType.Callout} bold>
            Pending posts
          </Typography>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-8 bg-accent-cabbage-default px-1 font-bold tabular-nums text-surface-invert typo-caption1">
            {count}
          </span>
        </span>
        {squadNames.length > 0 && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            truncate
          >
            Waiting for your review in {squadNames.join(', ')}
          </Typography>
        )}
      </span>
      <ArrowIcon className="shrink-0 rotate-90 text-text-tertiary" />
    </a>
  </Link>
);

const GroupTitle = ({ title }: { title: string }): ReactElement => (
  <Typography
    tag={TypographyTag.H2}
    type={TypographyType.Callout}
    color={TypographyColor.Secondary}
    bold
    className="col-span-full mt-4 first:mt-0"
  >
    {title}
  </Typography>
);

const EmptyMySquads = (): ReactElement => (
  <div className="col-span-full flex flex-col items-start gap-1 pb-2">
    <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
      You&apos;re not in any Squads yet
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      Join a few from Discover and they&apos;ll show up here.
    </Typography>
    <Link href={squadCategoriesPaths.discover} passHref>
      <Button
        tag="a"
        href={squadCategoriesPaths.discover}
        variant={ButtonVariant.Primary}
        className="mt-3"
      >
        Discover Squads
      </Button>
    </Link>
  </div>
);

function MySquadsPage(): ReactElement | null {
  const { data, count, isModeratorInAnySquad } = useSquadPendingPosts();
  const pendingSquadNames = useMemo(
    () => [
      ...new Set(
        data?.pages
          .flatMap((page) => page.edges)
          .flatMap(({ node }) => node)
          .map((post) => post.source?.name)
          .filter((name): name is string => !!name),
      ),
    ],
    [data],
  );
  const { isAuthReady, user, squads } = useAuthContext();
  const router = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const spotlight = usePromotedSquad({ slot: 'my_squads', enabled: isLaptop });
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
  const groups = [
    { title: 'Admin and moderator', squads: privilegedSquads },
    { title: 'Member', squads: memberSquads },
  ].filter((group) => group.squads.length > 0);

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace(squadCategoriesPaths.discover);
    }
  }, [isAuthReady, router, user]);

  if (!user) {
    return null;
  }

  return (
    <SquadDirectoryLayout>
      <SquadDiscoverFrame
        spotlight={
          spotlight.ad &&
          spotlight.squad && (
            <SquadDiscoverRow
              squad={spotlight.squad}
              ad={spotlight.ad}
              section={SquadDiscoverSection.Spotlight}
              description
            />
          )
        }
      >
        <div className={squadDiscoverGridClassName}>
          {isModeratorInAnySquad && count > 0 && (
            <PendingPostsButton count={count} squadNames={pendingSquadNames} />
          )}
          {!groups.length && count === 0 && <EmptyMySquads />}
          {groups.map((group) => (
            <React.Fragment key={group.title}>
              <GroupTitle title={group.title} />
              {group.squads.map((squad) => (
                <SquadDiscoverRow
                  key={squad.id}
                  squad={squad}
                  section={SquadDiscoverSection.MySquads}
                  join={false}
                  action={
                    <SquadFavoriteButton
                      squad={squad}
                      iconSize={IconSize.Medium}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </SquadDiscoverFrame>
    </SquadDirectoryLayout>
  );
}

const seo: NextSeoProps = {
  ...defaultSeo,
  title: 'My Squads',
  ...noindexSeoProps,
};

MySquadsPage.getLayout = getLayout;
MySquadsPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default MySquadsPage;
