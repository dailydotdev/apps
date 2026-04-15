import type { ExploreStory } from './exploreTypes';

export const getExploreStoryTitle = (story: ExploreStory): string =>
  story.title?.trim() ||
  story.sharedPost?.title?.trim() ||
  story.summary?.trim() ||
  'Untitled story';

export const getExploreStoryImage = (story: ExploreStory): string | undefined =>
  story.image || story.sharedPost?.image || undefined;

export const getExploreCommunityAuthorMeta = (
  story: ExploreStory,
): { name: string; image?: string | null } | null => {
  const name =
    story.author?.name ||
    story.scout?.name ||
    story.sharedPost?.author?.name ||
    story.creatorTwitterName ||
    story.creatorTwitter ||
    null;

  if (!name) {
    return null;
  }

  return {
    name,
    image:
      story.author?.image ||
      story.scout?.image ||
      story.sharedPost?.author?.image ||
      story.creatorTwitterImage ||
      null,
  };
};

/** Community Picks rows in topic clusters: always a display name (falls back to “Unknown”). */
export const getExploreCommunityPickPublisher = (
  story: ExploreStory,
): { name: string; image?: string } => {
  const meta = getExploreCommunityAuthorMeta(story);
  if (meta?.name) {
    return { name: meta.name, image: meta.image ?? undefined };
  }

  return { name: 'Unknown', image: undefined };
};
