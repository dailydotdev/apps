import { useEffect, useState } from 'react';
import type { Post } from '../../../graphql/posts';
import type { ArticleChatter } from '../types';
import { getMockChatter } from '../mockData';

interface UseArticleChatter {
  chatter?: ArticleChatter;
  isLoading: boolean;
}

/**
 * POC: returns mocked cross-platform chatter after a short simulated fetch so
 * the loading state is exercised. Swap the timeout for a real query (keyed off
 * the post permalink / yggdrasilId) when the backend exists.
 */
export const useArticleChatter = (post: Post): UseArticleChatter => {
  const [chatter, setChatter] = useState<ArticleChatter>();

  useEffect(() => {
    setChatter(undefined);
    const timeout = setTimeout(() => setChatter(getMockChatter()), 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  return { chatter, isLoading: !chatter };
};
