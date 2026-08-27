import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';

/**
 * The share card for a world, composed around a plate the owner's browser
 * rendered. Screenshotted by daily-api at `#screenshot_wrapper`, never visited
 * by a reader.
 *
 * Everything is fetched in getStaticProps rather than on the client: the page
 * is captured on `networkidle0`, so the fewer round trips it makes after load,
 * the sooner the shot is correct. What is left on the wire is the plate and the
 * avatar, which are exactly the two things the capture must wait for anyway.
 *
 * It runs anonymously, so it may only ask for public fields.
 */

interface WorldShareCardProps {
  plateUrl: string | null;
  worldName: string | null;
  userName: string;
  handle: string | null;
  avatar: string | null;
}

const SHARE_CARD_QUERY = `
  query WorldShareCard($id: ID!) {
    user(id: $id) {
      name
      username
      image
    }
    userWorld(id: $id) {
      reads
    }
    userWorldSettings(id: $id) {
      name
      plateUrl
    }
  }
`;

interface ShareCardResponse {
  data?: {
    user?: { name?: string; username?: string; image?: string } | null;
    userWorld?: { reads: number }[] | null;
    userWorldSettings?: {
      name?: string | null;
      plateUrl?: string | null;
    } | null;
  };
  errors?: { extensions?: { code?: string } }[];
}

const WorldShareCardPage = ({
  plateUrl,
  worldName,
  userName,
  handle,
  avatar,
}: WorldShareCardProps): ReactElement => (
  <div
    id="screenshot_wrapper"
    className="relative h-[630px] w-[1200px] overflow-hidden bg-background-default"
  >
    {!!plateUrl && (
      <img
        src={plateUrl}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover"
      />
    )}

    {/* The sky is the owner's to choose, and several of the palettes are pale
        at the horizon, which is exactly where the type sits. So this starts at
        the solid background rather than at the 64% the overlay tokens top out
        at, and fades through one to nothing. */}
    <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-background-default via-overlay-primary-pepper to-transparent" />

    {/* The same plate the world wears in the app, scaled for a card. */}
    <div className="absolute right-12 top-11 flex items-center rounded-16 border border-border-subtlest-tertiary bg-background-default px-6 py-4">
      <Logo
        position={LogoPosition.Initial}
        logoClassName={{ container: 'h-8' }}
      />
    </div>

    <div className="absolute inset-x-14 bottom-12">
      <div className="mb-4 flex items-center gap-3">
        {!!avatar && (
          <img
            src={avatar}
            alt=""
            className="size-[46px] rounded-14 object-cover"
          />
        )}
        {/* Whose place this is leads, and the name it was given lands. Without
            a name there is nothing for the line below to say, so the whole
            billing moves down and the handle takes the eyebrow. */}
        <span className="text-[28px] text-text-secondary">
          {worldName ? `${userName}'s world` : `@${handle ?? userName}`}
        </span>
      </div>

      <h1 className="text-[84px] font-extrabold leading-none tracking-tighter text-text-primary">
        {worldName || `${userName}'s world`}
      </h1>
    </div>
  </div>
);

export function getStaticPaths(): GetStaticPathsResult {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ userId: string }>): Promise<
  GetStaticPropsResult<WorldShareCardProps>
> {
  const userId = params?.userId;
  if (!userId) {
    return { notFound: true, revalidate: false };
  }

  try {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SHARE_CARD_QUERY,
        variables: { id: userId },
      }),
    });
    const body: ShareCardResponse = await res.json();

    // A hidden world has no card at all. The world page already omits the
    // og:image for one, so reaching here means someone guessed the URL.
    const isPrivate = !!body?.errors?.some(
      ({ extensions }) => extensions?.code === 'FORBIDDEN',
    );
    const user = body?.data?.user;
    if (isPrivate || !user) {
      return { notFound: true, revalidate: 60 };
    }

    // `userWorld` keys off the real user id and answers an unknown one with an
    // empty list rather than an error, while `user` resolves a username
    // happily. Without this, a link built with a handle would render a card for
    // a world that was never there. An unbuilt world lands here too, and has
    // nothing to put on a card either.
    if (!body?.data?.userWorld?.length) {
      return { notFound: true, revalidate: 60 };
    }

    return {
      props: {
        plateUrl: body?.data?.userWorldSettings?.plateUrl ?? null,
        worldName: body?.data?.userWorldSettings?.name ?? null,
        userName: user.name ?? '',
        handle: user.username ?? null,
        avatar: user.image ?? null,
      },
      revalidate: 60,
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}

export default WorldShareCardPage;
