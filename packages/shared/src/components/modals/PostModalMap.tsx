import dynamic from 'next/dynamic';
import { PostType } from '../../graphql/posts';

const ArticlePostModal = dynamic(
  () => import(/* webpackChunkName: "articlePostModal" */ './ArticlePostModal'),
);
const SharePostModal = dynamic(
  () => import(/* webpackChunkName: "sharePostModal" */ './SharePostModal'),
);
const CollectionPostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "collectionPostModal" */ './CollectionPostModal'
    ),
);
const BriefPostModal = dynamic(
  () => import(/* webpackChunkName: "briefPostModal" */ './BriefPostModal'),
);
const PollPostModal = dynamic(
  () => import(/* webpackChunkName: "pollPostModal" */ './PollPostModal'),
);
const SocialTwitterPostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "socialTwitterPostModal" */ './SocialTwitterPostModal'
    ),
);

/**
 * The modal each post type opens in from a card: the feed's, and any other
 * surface that opens a post the way the feed does.
 */
export const PostModalMap: Partial<Record<PostType, typeof ArticlePostModal>> =
  {
    [PostType.Article]: ArticlePostModal,
    [PostType.Share]: SharePostModal,
    [PostType.Freeform]: SharePostModal,
    [PostType.VideoYouTube]: ArticlePostModal,
    [PostType.Collection]: CollectionPostModal,
    [PostType.Brief]: BriefPostModal,
    [PostType.Digest]: ArticlePostModal,
    [PostType.Poll]: PollPostModal,
    [PostType.SocialTwitter]: SocialTwitterPostModal,
  };
