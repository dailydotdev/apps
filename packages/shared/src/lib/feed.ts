import { FeedItem, PostItem } from '../hooks/useFeed';
import { Post } from '../graphql/posts';

export function optimisticPostUpdateInFeed(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  mutationFunction: (post: Post) => Partial<Post>,
): ({ index }: { index: number }) => Promise<() => void> {
  return async ({ index }) => {
    const item = items[index] as PostItem;
    const { post } = item;
    updatePost(item.page, item.index, {
      ...post,
      ...mutationFunction(post),
    });
    return () => updatePost(item.page, item.index, post);
  };
}
