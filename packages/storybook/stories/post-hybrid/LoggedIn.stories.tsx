import { PostKind } from './data';
import { Viewer } from './providers';
import type { Meta } from '@storybook/react-vite';
import type { PageArgs } from './pageStory';
import { kindStory, pageMeta } from './pageStory';

const meta: Meta<PageArgs> = {
  title: 'Post Page Hybrid/2. Logged in',
  ...pageMeta({ viewer: Viewer.Member }),
};

export default meta;

export const Article = kindStory(PostKind.Article);
export const Video = kindStory(PostKind.Video);
export const SquadPost = kindStory(PostKind.SquadPost);
export const SharedPost = kindStory(PostKind.SharedPost);
export const SharedLink = kindStory(PostKind.SharedLink);
export const SharedVideo = kindStory(PostKind.SharedVideo);
export const SharedXPost = kindStory(PostKind.SharedX);
export const XPost = kindStory(PostKind.XPost);
export const Collection = kindStory(PostKind.Collection);
export const Poll = kindStory(PostKind.Poll);
export const Brief = kindStory(PostKind.Brief);
