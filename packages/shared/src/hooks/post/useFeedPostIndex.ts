import type { InfiniteData } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveFeedContext } from '../../contexts';
import type { FeedData } from '../../graphql/feed';

const useFeedPostIndex = ({ postId }: { postId: string }) => {
  const { queryKey } = useActiveFeedContext();
  const client = useQueryClient();
  const feedData = client.getQueryData(queryKey) as InfiniteData<FeedData>;

  let index = -1;
  const pageIndex = feedData.pages.findIndex(({ page }) => {
    index = page.edges.findIndex(({ node }) => node.id === postId);
    return index > -1;
  });

  const postIndex = feedData.pages[pageIndex].page.edges.findIndex(
    ({ node }) => node.id === postId,
  );

  return {
    pageIndex,
    postIndex,
  };
};

export default useFeedPostIndex;
