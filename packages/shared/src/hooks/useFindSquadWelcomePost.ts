import { useContext, useMemo } from 'react';
import { InfiniteData, useQueryClient } from 'react-query';
import { FeedData, Post, PostType } from '../graphql/posts';
import { Squad } from '../graphql/sources';
import AuthContext from '../contexts/AuthContext';
import { baseFeedSupportedTypes } from '../graphql/feed';

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
      supportedTypes: baseFeedSupportedTypes.concat(PostType.Welcome),
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
