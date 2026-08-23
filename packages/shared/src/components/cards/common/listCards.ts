import type React from 'react';
import { PostType } from '../../../graphql/posts';
import { ArticleList } from '../article/ArticleList';
import { ShareList } from '../share/ShareList';
import { FreeformList } from '../Freeform/FreeformList';
import { CollectionList } from '../collection/CollectionList';
import { PollList } from '../poll/PollList';
import { SocialTwitterList } from '../socialTwitter/SocialTwitterList';
import { LiveRoomPostList } from '../liveRoom/LiveRoomPostList';
import { BriefCard } from '../brief/BriefCard/BriefCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PostTypeToListCard: Record<PostType, React.ComponentType<any>> = {
  [PostType.Article]: ArticleList,
  [PostType.Share]: ShareList,
  [PostType.Welcome]: FreeformList,
  [PostType.Freeform]: FreeformList,
  [PostType.VideoYouTube]: ArticleList,
  [PostType.Collection]: CollectionList,
  [PostType.Brief]: BriefCard,
  [PostType.Poll]: PollList,
  [PostType.SocialTwitter]: SocialTwitterList,
  [PostType.Digest]: ArticleList,
  [PostType.LiveRoom]: LiveRoomPostList,
};
