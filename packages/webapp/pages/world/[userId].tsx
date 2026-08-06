import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import dynamic from 'next/dynamic';
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useTrackQuestClientEvent } from '@dailydotdev/shared/src/hooks/useTrackQuestClientEvent';
import { ClientQuestEventType } from '@dailydotdev/shared/src/graphql/quests';
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

export const getStaticPaths = getProfileStaticPaths;

interface WorldPageProps extends ProfileLayoutProps {
  /** What the owner calls the place, or null if they have never named it. */
  worldName?: string | null;
  /**
   * Whether a plate has ever been captured for this world. Without one there is
   * nothing to compose a card around, so the link keeps the profile image the
   * profile SEO defaults already put on it.
   */
  hasPlate?: boolean;
  /** Cache-buster: a new plate has to reach crawlers that cached the old card. */
  plateVersion?: string | null;
  isPrivate?: boolean;
}

interface WorldParams extends ParsedUrlQuery {
  userId: string;
}

/**
 * One read of the world's own settings, at build time, for the share card.
 *
 * A plain fetch rather than the app's client: this runs on the server, where
 * there is no session to send and nothing to cache into. The same GraphQL error
 * the client reads as "private" is what keeps this page out of the index.
 * Anything else — a network blip, a schema change — resolves to nothing, which
 * costs the caller a field and leaves the page indexable: the harmless
 * direction to fail in.
 */
const querySettings = async (
  userId: string,
  fields: string,
): Promise<{
  settings: Record<string, string | null> | null;
  isPrivate: boolean;
}> => {
  try {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query UserWorldName($id: ID!) {
          userWorldSettings(id: $id) { ${fields} }
        }`,
        variables: { id: userId },
      }),
    });
    const body = await res.json();

    return {
      settings: body?.data?.userWorldSettings ?? null,
      isPrivate: !!body?.errors?.some(
        ({ extensions }: { extensions?: { code?: string } }) =>
          extensions?.code === 'FORBIDDEN',
      ),
    };
  } catch {
    return { settings: null, isPrivate: false };
  }
};

const getWorldSeoData = async (
  userId: string,
): Promise<{
  name: string | null;
  isPrivate: boolean;
  hasPlate: boolean;
  plateVersion: string | null;
}> => {
  /* Two requests rather than one, so that the plate cannot take the name down
     with it. GraphQL rejects a whole document over one unknown field, so asking
     for both together would mean this page silently losing its title and
     description for as long as the API in front of it predates plates. Split,
     the older API costs only the card. */
  const [named, plated] = await Promise.all([
    querySettings(userId, 'name'),
    querySettings(userId, 'plateUrl plateVersion'),
  ]);

  return {
    name: named.settings?.name ?? null,
    isPrivate: named.isPrivate,
    hasPlate: !!plated.settings?.plateUrl,
    plateVersion: plated.settings?.plateVersion ?? null,
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext<WorldParams>,
): Promise<GetStaticPropsResult<WorldPageProps>> {
  const result = (await getProfileStaticProps(
    context,
  )) as GetStaticPropsResult<ProfileLayoutProps>;

  if (!('props' in result) || !result.props.user) {
    return result as GetStaticPropsResult<WorldPageProps>;
  }

  const world = await getWorldSeoData(result.props.user.id);

  return {
    ...result,
    props: {
      ...result.props,
      worldName: world.name,
      hasPlate: world.hasPlate,
      plateVersion: world.plateVersion,
      isPrivate: world.isPrivate,
      // A world its owner has hidden has nothing to index, and a crawler that
      // followed a share link is exactly who this is for.
      noindex: result.props.noindex || world.isPrivate,
    },
  };
}

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
 *
 * It lives at `/world/:userId` rather than as a `/:userId/world` profile tab
 * for the same reason. A world is a place, not a view of a person, so the
 * zoom levels above and below it (a universe of many worlds, a realm inside
 * one) are path depth in this namespace instead of homeless siblings of the
 * profile. It still takes the profile's static props: the segment is a
 * username, and `params.userId` is what the shared loader reads.
 */
const ProfileWorldPage = ({
  user,
  noindex,
  worldName,
  hasPlate,
  plateVersion,
  isPrivate,
}: WorldPageProps): ReactElement | null => {
  const { isFallback } = useRouter();
  /* Asked for HERE rather than inside the view, which is the whole point: the
     renderer is most of a megabyte and the districts are one small query, and
     hanging the query off the view's mount put them end to end. Started on the
     page's first render they run against the download instead, and the world is
     usually raisable by the time there is anything to raise it with. */
  const world = useUserWorld(user?.id);
  const { user: viewer } = useAuthContext();
  /* Counted once the world has actually stood up for this viewer. A hidden one
     never does, and landing on the door of a place you cannot enter is not a
     visit to it. */
  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.VisitUserWorld,
    enabled:
      !!user &&
      !!viewer?.id &&
      viewer.id !== user.id &&
      !world.isPending &&
      !world.isPrivate &&
      !world.error,
    eventKey: user ? `world:${user.id}` : undefined,
  });

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

  /* The name its owner gave the place leads, because that is what the link is
     OF. Without one the page is still theirs, so it says whose it is — the same
     line it carried before a world could be named. */
  const title = worldName
    ? `${worldName} — ${user.name}'s world`
    : `${user.name}'s world (@${user.username})`;
  const seo: NextSeoProps = getProfileSeoDefaults(
    user,
    {
      ...getPageSeoTitles(title),
      description: `See ${worldName ? `${worldName}, the` : 'the'} world ${
        user.name
      }'s reading built on daily.dev. Every topic they read grows a district in it.`,
    },
    noindex,
  );

  /* Three cases, and the fallbacks are deliberately plain. A hidden world
     unfurls with NO image rather than a placeholder, because a placeholder
     still confirms the world exists. A world with no plate yet keeps whatever
     the profile defaults put there, which is the reader's DevCard: correct,
     already generated, and nobody's idea of a broken card. Only a world with a
     plate gets the card composed around it. */
  if (isPrivate) {
    seo.openGraph = { ...seo.openGraph, images: [] };
  } else if (hasPlate) {
    const image = new URL(
      `/og/world/${user.id}.jpg`,
      process.env.NEXT_PUBLIC_API_URL,
    );
    if (plateVersion) {
      image.searchParams.set('v', plateVersion);
    }
    seo.openGraph = {
      ...seo.openGraph,
      images: [
        {
          url: image.toString(),
          width: 1200,
          height: 630,
          alt: worldName
            ? `${worldName}, ${user.name}'s world`
            : `${user.name}'s world`,
        },
      ],
    };
  }

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
