import type { ReactElement } from 'react';
import React from 'react';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { PageProps } from './page';
import { HybridPostPage, RedesignPostPage } from './page';
import { ClassicPostPage } from './classic';

export enum Version {
  Hybrid = 'Hybrid',
  Redesign = 'Redesign',
  Classic = 'Classic',
}

export const versionLabel: Record<Version, string> = {
  [Version.Hybrid]: 'Hybrid',
  [Version.Redesign]: 'Redesign, as the experiment shipped',
  [Version.Classic]: 'Classic, production today',
};

// The redesign never covered these: briefs, polls and X posts kept their
// own layouts there. The hybrid brings polls and X posts into the new
// column; briefs keep theirs everywhere.
const keepsClassicLayout = (version: Version, type: PostType): boolean =>
  type === PostType.Brief ||
  (version === Version.Redesign &&
    [PostType.Poll, PostType.SocialTwitter].includes(type));

export const PostPage = ({
  version = Version.Hybrid,
  ...props
}: PageProps & { version?: Version }): ReactElement => {
  if (
    version === Version.Classic ||
    keepsClassicLayout(version, props.post.type)
  ) {
    return <ClassicPostPage {...props} />;
  }

  if (version === Version.Redesign) {
    return <RedesignPostPage {...props} />;
  }

  return <HybridPostPage {...props} />;
};
