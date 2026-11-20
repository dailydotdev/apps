import type { ReactElement } from 'react';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import type { Post } from '../../graphql/posts';
import type { PatchyPostRequest } from './PatchyPostModalHost';

// Loaded on first use: the post modal pulls in most of the post page, and
// importing it up front from the rail makes an import cycle.
const PatchyPostModalHost = lazy(
  () =>
    import(
      /* webpackChunkName: "patchyPostModalHost" */ './PatchyPostModalHost'
    ),
);

type Opener = (post: Post) => void;
let opener: Opener | null = null;

// Opens a post Patchy suggested the way the feed does, in the post modal.
// Returns false when nothing is mounted to open it, so the caller navigates.
export const openPatchyPost = (post: Post): boolean => {
  if (!opener) {
    return false;
  }
  opener(post);
  return true;
};

// Mounted once next to the rail.
export const PatchyPostModal = (): ReactElement | null => {
  const [request, setRequest] = useState<PatchyPostRequest | null>(null);

  useEffect(() => {
    opener = (post) => setRequest({ post, at: Date.now() });
    return () => {
      opener = null;
    };
  }, []);

  return request ? (
    <Suspense fallback={null}>
      <PatchyPostModalHost request={request} />
    </Suspense>
  ) : null;
};
