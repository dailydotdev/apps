import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useDevCard } from '@dailydotdev/shared/src/hooks/profile/useDevCard';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  CommentShareCard,
  InviteShareCard,
  PlusShareCard,
  PostShareCard,
  ProfileShareCard,
  SourceShareCard,
  SquadShareCard,
  TagShareCard,
} from '../../../../components/image-generator/ShareCard';

// These pages render anonymously and are screenshotted, so they must query
// ONLY public fields. The app's data hooks (usePostById / SQUAD_QUERY / …)
// pull user-scoped fields (bookmark/user state, membership, content
// preferences) which require auth — an anonymous request to them returns
// "Access denied". So we use minimal, public-only queries (mirroring the old
// og.daily.dev Satori service) and fire them immediately — no boot/auth needed.

const OG_POST_QUERY = `
  query Post($id: ID!) {
    post(id: $id) {
      title
      summary
      image
      readTime
      numUpvotes
      numComments
      source { name image handle type }
      author { name username image }
      sharedPost { title summary image }
    }
  }
`;

const OG_COMMENT_QUERY = `
  query Comment($id: ID!) {
    comment(id: $id) {
      content
      numUpvotes
      author { name image }
      post { title }
      children { edges { node { id } } }
    }
  }
`;

const OG_SOURCE_QUERY = `
  query Source($id: ID!) {
    source(id: $id) {
      id
      name
      image
      description
      membersCount
    }
  }
`;

const OG_SQUAD_QUERY = `
  query Source($id: ID!) {
    source(id: $id) {
      id
      name
      image
      description
      membersCount
      flags { totalPosts totalUpvotes }
    }
  }
`;

// Minimal public user query — the exact shape the old referral og route used
// anonymously (avoids the auth-gated fields in the full devcard query).
const OG_USER_QUERY = `
  query User($id: ID!) {
    user(id: $id) {
      name
      image
    }
  }
`;

// Decorative community face pile. Per the designer, these are a fixed pool of
// AI-generated avatars (not real followers — there's no query for a source's
// follower avatars). We deterministically pick 3 from the pool seeded by the
// entity id, so a given source always shows the same 3 (stable across the
// preview and the cached screenshot) while different sources rotate.
// TODO: replace with the final 20 AI-generated avatars hosted on media.daily.dev.
const COMMUNITY_FACES = [
  'https://media.daily.dev/image/upload/s--FcI3RdS1--/f_auto/v1745335145/avatars/avatar_R9RafYjp15h3mJ9XdIkhy',
  'https://media.daily.dev/image/upload/s--AVEMGQgE--/f_auto/v1744349812/avatars/avatar_RVvUzGofSIHGyTxdjqDN1',
  'https://media.daily.dev/image/upload/s--CwdXky60--/f_auto/v1733031652/avatars/avatar_rmFJzNXUNPh163VaQkmF0',
];

const pickFaces = (seed: string, count = 3): string[] => {
  if (COMMUNITY_FACES.length === 0) {
    return [];
  }
  // Bounded string hash (kept under a prime to avoid float overflow without
  // bitwise ops) → a stable per-seed offset into the pool.
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  const start = hash % COMMUNITY_FACES.length;
  return Array.from(
    { length: Math.min(count, COMMUNITY_FACES.length) },
    (_, i) => COMMUNITY_FACES[(start + i) % COMMUNITY_FACES.length],
  );
};

interface OgUser {
  name?: string;
  image?: string;
}

interface OgPost {
  title?: string;
  summary?: string;
  image?: string;
  readTime?: number;
  numUpvotes?: number;
  numComments?: number;
  source?: { name?: string; image?: string; handle?: string; type?: string };
  author?: { name?: string; username?: string; image?: string };
  sharedPost?: { title?: string; summary?: string; image?: string };
}

interface OgComment {
  content: string;
  numUpvotes?: number;
  author?: { name?: string; image?: string };
  post?: { title?: string };
  children?: { edges?: Array<{ node?: { id?: string } }> };
}

interface OgSource {
  id?: string;
  name: string;
  image?: string;
  description?: string;
  membersCount?: number;
  flags?: { totalPosts?: number; totalUpvotes?: number };
}

const PostLoader = ({ id }: { id: string }): ReactElement | null => {
  const { query } = useRouter();
  const userId = query?.userid as string;
  const { data } = useQuery({
    queryKey: ['og-post', id],
    queryFn: () => gqlClient.request<{ post: OgPost }>(OG_POST_QUERY, { id }),
  });
  const { data: sharerData } = useQuery({
    queryKey: ['og-user', userId],
    queryFn: () =>
      gqlClient.request<{ user: OgUser }>(OG_USER_QUERY, { id: userId }),
    enabled: !!userId,
  });
  const post = data?.post;
  if (!post) {
    return null;
  }
  // Skip the generic placeholder cover, falling back to a shared post's image.
  const cover =
    post.image && !post.image.includes('public/Placeholder')
      ? post.image
      : post.sharedPost?.image;
  const sharer = sharerData?.user
    ? { name: sharerData.user.name, image: sharerData.user.image }
    : undefined;
  return (
    <PostShareCard
      data={{
        title: post.title ?? post.sharedPost?.title,
        summary: post.summary ?? post.sharedPost?.summary,
        image: cover,
        numUpvotes: post.numUpvotes,
        numComments: post.numComments,
        readTime: post.readTime,
        source: post.source,
        author: post.author,
        sharer,
      }}
    />
  );
};

const CommentLoader = ({ id }: { id: string }): ReactElement | null => {
  const { data } = useQuery({
    queryKey: ['og-comment', id],
    queryFn: () =>
      gqlClient.request<{ comment: OgComment }>(OG_COMMENT_QUERY, { id }),
  });
  const comment = data?.comment;
  if (!comment) {
    return null;
  }
  return (
    <CommentShareCard
      data={{
        content: comment.content,
        numUpvotes: comment.numUpvotes,
        author: {
          name: comment.author?.name ?? '',
          image: comment.author?.image,
        },
        postTitle: comment.post?.title,
        replies: comment.children?.edges?.length ?? 0,
      }}
    />
  );
};

const SourceLoader = ({ id }: { id: string }): ReactElement | null => {
  const { data } = useQuery({
    queryKey: ['og-source', id],
    queryFn: () =>
      gqlClient.request<{ source: OgSource }>(OG_SOURCE_QUERY, { id }),
  });
  const source = data?.source;
  if (!source) {
    return null;
  }
  return (
    <SourceShareCard
      data={{
        name: source.name,
        image: source.image,
        description: source.description,
        followers: source.membersCount,
        faces: pickFaces(source.id ?? id),
      }}
    />
  );
};

const SquadLoader = ({ id }: { id: string }): ReactElement | null => {
  const { query } = useRouter();
  const userId = query?.userid as string;
  const { data } = useQuery({
    queryKey: ['og-squad', id],
    queryFn: () =>
      gqlClient.request<{ source: OgSource }>(OG_SQUAD_QUERY, { id }),
  });
  const { data: sharerData } = useQuery({
    queryKey: ['og-user', userId],
    queryFn: () =>
      gqlClient.request<{ user: OgUser }>(OG_USER_QUERY, { id: userId }),
    enabled: !!userId,
  });
  const squad = data?.source;
  if (!squad) {
    return null;
  }
  return (
    <SquadShareCard
      data={{
        name: squad.name,
        image: squad.image,
        description: squad.description,
        members: squad.membersCount,
        posts: squad.flags?.totalPosts,
        upvotes: squad.flags?.totalUpvotes,
        sharer: sharerData?.user
          ? { name: sharerData.user.name, image: sharerData.user.image }
          : undefined,
      }}
    />
  );
};

const InviteLoader = ({ id }: { id: string }): ReactElement | null => {
  const { data } = useQuery({
    queryKey: ['og-user', id],
    queryFn: () => gqlClient.request<{ user: OgUser }>(OG_USER_QUERY, { id }),
  });
  const user = data?.user;
  if (!user) {
    return null;
  }
  return <InviteShareCard name={user.name ?? ''} image={user.image} />;
};

// Distinct profile card (Layout A) — reuses the public DevCard query for data
// (reputation, streak, posts read, most-read tags & sources) but renders the
// share-card layout, not the DevCard. Both can be tested side by side.
const ProfileLoader = ({ id }: { id: string }): ReactElement | null => {
  const { devcard } = useDevCard(id);
  const user = devcard?.user;
  if (!user) {
    return null;
  }
  return (
    <ProfileShareCard
      data={{
        name: user.name,
        handle: user.username,
        image: user.image,
        bio: user.bio,
        // reputation lives on the user (UserShortInfo), not the devCard root.
        reputation: user.reputation,
        streak: devcard.streak?.max,
        reads: devcard.articlesRead,
        tags: devcard.tags?.slice(0, 5),
        sources: devcard.sources
          ?.map((source) => source.image)
          .filter((image): image is string => !!image)
          .slice(0, 4),
      }}
    />
  );
};

interface ShareImagePageProps {
  type: string;
  id: string;
}

const ShareImagePage = ({ type, id }: ShareImagePageProps): ReactElement => {
  const card = ((): ReactElement | null => {
    switch (type) {
      case 'posts':
        return <PostLoader id={id} />;
      case 'comments':
        return <CommentLoader id={id} />;
      case 'sources':
        return <SourceLoader id={id} />;
      case 'squads':
        return <SquadLoader id={id} />;
      case 'profile':
        return <ProfileLoader id={id} />;
      case 'tags':
        return <TagShareCard tag={id} />;
      case 'invite':
        return <InviteLoader id={id} />;
      case 'plus':
        return <PlusShareCard />;
      default:
        return null;
    }
  })();

  return (
    <div id="screenshot_wrapper" className="h-[630px] w-[1200px]">
      {card}
    </div>
  );
};

export function getStaticPaths(): GetStaticPathsResult {
  return { paths: [], fallback: 'blocking' };
}

export function getStaticProps({
  params,
}: GetStaticPropsContext): GetStaticPropsResult<ShareImagePageProps> {
  const type = params?.type as string;
  const id = params?.id as string;
  if (!type || !id) {
    return { notFound: true, revalidate: false };
  }
  return { props: { type, id }, revalidate: 60 };
}

export default ShareImagePage;
