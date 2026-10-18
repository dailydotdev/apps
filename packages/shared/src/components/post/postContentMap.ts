import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { PostContentProps } from './common';
import { PostType } from '../../graphql/posts';

type PostContentComponent = ComponentType<PostContentProps>;

const PostContent = dynamic(() =>
  import(/* webpackChunkName: "lazyPostContent" */ './PostContent').then(
    (module) => module.PostContent,
  ),
);

const SquadPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazySquadPostContent" */ './SquadPostContent'
  ).then((module) => module.SquadPostContent),
);

const CollectionPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyCollectionPostContent" */ './collection/CollectionPostContent'
  ).then((module) => module.CollectionPostContent),
);

const BriefPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyBriefPostContent" */ './brief/BriefPostContent'
  ).then((module) => module.BriefPostContent),
);

const PollPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyPollPostContent" */ './poll/PollPostContent'
  ).then((module) => module.PollPostContent),
);

const SocialTwitterPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazySocialTwitterPostContent" */ './SocialTwitterPostContent'
  ).then((module) => module.SocialTwitterPostContent),
);

const DigestPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyDigestPostContent" */ './digest/DigestPostContent'
  ).then((module) => module.DigestPostContent),
);

export const POST_CONTENT_MAP: Record<PostType, PostContentComponent> = {
  [PostType.Article]: PostContent as PostContentComponent,
  [PostType.Share]: SquadPostContent as PostContentComponent,
  [PostType.Freeform]: SquadPostContent as PostContentComponent,
  [PostType.VideoYouTube]: PostContent as PostContentComponent,
  [PostType.Collection]: CollectionPostContent as PostContentComponent,
  [PostType.Brief]: BriefPostContent as PostContentComponent,
  [PostType.Poll]: PollPostContent as PostContentComponent,
  [PostType.SocialTwitter]: SocialTwitterPostContent as PostContentComponent,
  [PostType.Digest]: DigestPostContent as PostContentComponent,
};
