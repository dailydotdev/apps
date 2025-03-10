import { useContext, useMemo } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedData, Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import type { Squad } from '../graphql/sources';
import AuthContext from '../contexts/AuthContext';
import { supportedTypesForPrivateSources } from '../graphql/feed';

const useFindSquadWelcomePost = ({
  id: squadId,
}: Pick<Squad, 'id'>): Post | undefined => {
  const client = useQueryClient();
  const { user } = useContext(AuthContext);

  const squadFeed = client.getQueryData<InfiniteData<FeedData>>([
    'sourceFeed',
    user?.id ?? 'anonymous',
    Object.values({
      source: squadId,
      ranking: 'TIME',
      supportedTypes: supportedTypesForPrivateSources,
    }),
  ]);

  const welcomePost = useMemo(
    () =>
      squadFeed?.pages?.[0]?.page.edges.find(
        (item) => item.node.type === PostType.Welcome,
      )?.node,
    [squadFeed],
  );

  return welcomePost;
};

export { useFindSquadWelcomePost };
