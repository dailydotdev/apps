import classed from '../../../lib/classed';
import { PostType } from '../../../graphql/posts';

/**
 * The post types /articles may render, all of which carry content beyond the ad
 * slots. Deliberately excludes squad/user-generated types (share, welcome,
 * freeform, poll) — paid traffic never targets them and their content is our
 * members', not landing-page material — and internal types (brief, digest).
 */
export const READ_ELIGIBLE_POST_TYPES = new Set<PostType>([
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Collection,
]);

/**
 * Same two-column shell the classic post layout uses, without the fixed
 * navigation branch — this template never enters modal/navigation mode.
 */
export const PostContentContainerRaw = classed(
  'div',
  'm-auto flex w-full flex-col bg-background-default pb-6 laptop:flex-row laptop:border-x laptop:border-border-subtlest-tertiary',
);
