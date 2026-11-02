import type { Meta } from '@storybook/react-vite';
import { PostKind } from './data';
import { Viewer } from './providers';
import type { PageArgs, PageStory } from './pageStory';
import { pageMeta } from './pageStory';
import { Version } from './versions';

const meta: Meta<PageArgs> = {
  title: 'Post Page Hybrid, ad slots/2. Pages',
  ...pageMeta({ viewer: Viewer.Anonymous, programmatic: true }),
};

export default meta;

export const Article: PageStory = { args: { kind: PostKind.Article } };

export const Video: PageStory = { args: { kind: PostKind.Video } };

export const ArticleWithStickyTower: PageStory = {
  args: { kind: PostKind.Article, stickyRail: true },
};

export const ArticleRedesign: PageStory = {
  args: { kind: PostKind.Article, version: Version.Redesign },
};

export const ArticleClassic: PageStory = {
  args: { kind: PostKind.Article, version: Version.Classic },
};
