import { useMemo } from 'react';
import { PostType } from '../../graphql/posts';
import type { Post } from '../../graphql/posts';

export const usePostImage = (post: Post): string =>
  useMemo(() => {
    if (post?.type === PostType.SocialTwitter && post?.subType === 'thread') {
      return undefined;
    }

    const baseImage = post?.sharedPost?.image ?? post?.image;

    if (baseImage) {
      return baseImage;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(post?.contentHtml, 'text/html');
    const imgTag = doc.querySelector('img');
    if (imgTag) {
      return imgTag.getAttribute('src');
    }

    return undefined;
  }, [
    post?.contentHtml,
    post?.image,
    post?.sharedPost?.image,
    post?.subType,
    post?.type,
  ]);
