import { useMemo } from 'react';
import { Post } from '../../graphql/posts';

export const usePostImage = (post: Post): string =>
  useMemo(() => {
    if (post?.image) {
      return post?.image;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(post?.contentHtml, 'text/html');
    const imgTag = doc.querySelector('img');
    if (imgTag) {
      return imgTag.getAttribute('src');
    }

    return undefined;
  }, [post?.contentHtml, post?.image]);
