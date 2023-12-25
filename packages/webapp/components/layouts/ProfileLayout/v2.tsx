import React, { ReactElement, ReactNode } from 'react';
import { getProfileSSR, PublicProfile } from '@dailydotdev/shared/src/lib/user';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { ClientError } from 'graphql-request';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import { SourceMemberRole } from '@dailydotdev/shared/src/graphql/sources';
import { getLayout as getMainLayout } from '../MainLayout';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import { HeroImage } from '../../profile/HeroImage';
import { UserMetadata } from '../../profile/UserMetadata';
import { UserStats } from '../../profile/UserStats';
import { SocialChips } from '../../profile/SocialChips';
import { SquadsList, SquadsListProps } from '../../profile/SquadsList';
import NavBar, { tabs } from './NavBar';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../pages/404'),
);

export interface ProfileLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
}

const coverImage =
  'https://pbs.twimg.com/profile_banners/2865996981/1679327024/1500x500';

const stats = {
  reputation: 27180,
  views: 18092,
  upvotes: 1239089,
};

const social = {
  github: 'idoshamun',
  twitter: 'idoshamun',
  portfolio: 'https://shamun.dev',
};

const squads: SquadsListProps['squads'] = [
  {
    id: '1',
    name: 'AI',
    role: SourceMemberRole.Admin,
    handle: 'ai',
    membersCount: 3612,
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--0Nnn3lEU--/f_auto,q_auto/v1/squads/a6581605-a03b-4877-84f2-7d362a8ada28',
    permalink: 'https://daily.dev',
  },
  {
    id: '2',
    name: 'NextJS',
    handle: 'nextjs',
    membersCount: 1280,
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--ai0kromH--/f_auto,q_auto/v1698518496/squads/69088f45-3a20-4730-81c2-32d0d75fb8c6',
    permalink: 'https://daily.dev',
  },
  {
    id: '3',
    name: 'Cloud',
    handle: 'cloud',
    membersCount: 956,
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--STtbk7yk--/f_auto,q_auto/v1696255516/squads/6c4054c4-9a66-429d-9036-c0bc83592f8a',
    permalink: 'https://daily.dev',
  },
  {
    id: '4',
    name: 'Watercooler',
    handle: 'watercooler',
    membersCount: 1380,
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--RQny1uQt--/f_auto,q_auto/v1/squads/fd062672-63b7-4a10-87bd-96dcd10e9613',
    permalink: 'https://daily.dev',
  },
];

export default function ProfileLayout({
  profile: initialProfile,
  children,
}: ProfileLayoutProps): ReactElement {
  const router = useRouter();
  const { isFallback } = router;

  if (!isFallback && !initialProfile) {
    return <Custom404 />;
  }

  const profile = initialProfile;
  if (!profile) {
    return <></>;
  }

  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  return (
    <>
      {/* <Head> */}
      {/*  <link rel="preload" as="image" href={profile.image} /> */}
      {/* </Head> */}
      {/* <NextSeo {...Seo} /> */}
      <main
        className={classNames(
          pageBorders,
          pageContainerClassNames,
          'pb-12',
          'py-6',
        )}
      >
        <header className="flex px-4 h-8">
          <h2 className="font-bold typo-body">Profile</h2>
        </header>
        <HeroImage
          coverImage={coverImage}
          image={profile.image}
          username={profile.username}
          id={profile.id}
        />
        <div className="flex flex-col px-4">
          <UserMetadata
            username={profile.username}
            name={profile.name}
            createdAt={profile.createdAt}
          />
          <UserStats stats={stats} />
          <div className="text-theme-label-tertiary typo-callout">
            Bio here!!!
          </div>
        </div>
        <SocialChips links={social} />
        <div className="flex flex-col gap-3 pl-4 mb-4">
          <div className="typo-footnote text-theme-label-tertiary">
            Active in these squads
          </div>
          <SquadsList squads={squads} />
        </div>
        <NavBar selectedTab={selectedTab} profile={profile} />
        {children}
      </main>
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>, null),
  );

interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ProfileParams>): Promise<
  GetStaticPropsResult<Omit<ProfileLayoutProps, 'children'>>
> {
  const { userId } = params;
  try {
    const profile = await getProfileSSR(userId);

    return {
      props: {
        profile,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'FORBIDDEN') {
      return {
        props: { profile: null },
        revalidate: 60,
      };
    }
    throw err;
  }
}
