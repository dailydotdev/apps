import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import {
  WorldBoot,
  WorldBootFallback,
  WorldUserContext,
} from '../../components/world/WorldBoot';
import { useUserWorld } from '../../components/world/useUserWorld';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

/**
 * The renderer is ~700 KB of three.js and a WebGL context, and it reads
 * `window` while it builds its own DOM. Both reasons point the same way: it
 * only ever exists in the browser, and it only ever exists on this page.
 */
const WorldView = dynamic(
  () =>
    import(
      /* webpackChunkName: "worldView" */ '../../components/world/WorldView'
    ).then((mod) => mod.WorldView),
  { ssr: false, loading: WorldBootFallback },
);

/**
 * A user's reading history as a place their curiosity built. Deliberately NOT
 * under the profile layout: the world is the page, and a sidebar beside it
 * would leave the map a quarter of the screen it needs all of.
 */
const ProfileWorldPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement | null => {
  const { isFallback } = useRouter();
  /* Asked for HERE rather than inside the view, which is the whole point: the
     renderer is most of a megabyte and the districts are one small query, and
     hanging the query off the view's mount put them end to end. Started on the
     page's first render they run against the download instead, and the world is
     usually raisable by the time there is anything to raise it with. */
  const world = useUserWorld(user?.id);

  if (!isFallback && !user) {
    return <Custom404 />;
  }

  /* Profiles are statically generated on demand, so the first paint of a world
     nobody has visited yet has no user on it. Every other profile page spends
     that moment inside the app shell; this one has no shell, so without this it
     is a blank screen for as long as the fallback lasts. */
  if (!user) {
    return <WorldBoot />;
  }

  const seo: NextSeoProps = getProfileSeoDefaults(
    user,
    {
      ...getPageSeoTitles(`${user.name}'s world (@${user.username})`),
      description: `The world ${user.name}'s reading built on daily.dev — every content niche they read is a district that grows the more they read it.`,
    },
    noindex,
  );

  return (
    <>
      <NextSeo {...seo} />
      <WorldUserContext.Provider value={user}>
        <WorldView user={user} world={world} />
      </WorldUserContext.Provider>
    </>
  );
};

export default ProfileWorldPage;
