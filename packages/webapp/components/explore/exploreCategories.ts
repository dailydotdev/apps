export const EXPLORE_CATEGORIES = [
  { id: 'explore', label: 'Explore', path: '/explore' },
  { id: 'videos', label: 'Videos', path: '/explore/videos', isVideos: true },
  { id: 'agentic', label: 'Agentic', path: '/explore/agentic', tag: 'agentic' },
  { id: 'webdev', label: 'Webdev', path: '/explore/webdev', tag: 'webdev' },
  { id: 'backend', label: 'Backend', path: '/explore/backend', tag: 'backend' },
  {
    id: 'databases',
    label: 'Databases',
    path: '/explore/databases',
    tag: 'databases',
  },
  { id: 'career', label: 'Career', path: '/explore/career', tag: 'career' },
  { id: 'golang', label: 'Golang', path: '/explore/golang', tag: 'golang' },
  { id: 'rust', label: 'Rust', path: '/explore/rust', tag: 'rust' },
  {
    id: 'opensource',
    label: 'Opensource',
    path: '/explore/opensource',
    tag: 'open-source',
  },
  { id: 'testing', label: 'Testing', path: '/explore/testing', tag: 'testing' },
  { id: 'php', label: 'PHP', path: '/explore/php', tag: 'php' },
  { id: 'java', label: 'Java', path: '/explore/java', tag: 'java' },
] as const;

export type ExploreCategory = (typeof EXPLORE_CATEGORIES)[number];
export type ExploreCategoryId = ExploreCategory['id'];

export const getExploreCategoryById = (
  id: string | undefined,
): ExploreCategory | undefined =>
  EXPLORE_CATEGORIES.find((category) => category.id === id);

const TOPIC_CLUSTER_START_INDEX = EXPLORE_CATEGORIES.findIndex(
  (category) => category.id === 'agentic',
);

/** Categories rendered as agentic topic clusters (everything after Agentic in the nav). */
export const EXPLORE_TOPIC_CLUSTER_CATEGORIES: ExploreCategory[] =
  EXPLORE_CATEGORIES.slice(TOPIC_CLUSTER_START_INDEX + 1);

export const EXPLORE_TOPIC_CLUSTER_CATEGORY_IDS =
  EXPLORE_TOPIC_CLUSTER_CATEGORIES.map(
    (category) => category.id,
  ) as ExploreCategoryId[];
