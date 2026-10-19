import type { RawPerson, RawPost, RawSource, RawSquad } from './raw';
import {
  productionLists,
  rawByTag,
  rawCommunities,
  rawPosts,
  rawSources,
} from './raw';

// The real sources, shaped for the layouts. Production's own lists keep
// every source type; the redesigned lists keep publications only (machine
// sources, minus daily.dev's own Changelog), which is fix #1 from the
// analysis.

/** When raw.ts was fetched, so "new" stays new in the story. */
export const DATA_DATE = new Date('2026-10-18T09:00:00Z');

export interface Post extends Omit<RawPost, 'createdAt'> {
  createdAt: Date;
}

export interface Source extends Omit<RawSource, 'createdAt'> {
  createdAt: Date;
  permalink: string;
  isPublication: boolean;
  tags: string[];
  latest: Post[];
}

/**
 * The squad directory's categories. Sources aren't filed under categories
 * the way Squads are, so each one gathers the sources of a few tags.
 */
export const categories: { slug: string; title: string; tags: string[] }[] = [
  { slug: 'ai-ml', title: 'AI & ML', tags: ['ai', 'machine-learning', 'llm'] },
  {
    slug: 'languages',
    title: 'Languages',
    tags: ['javascript', 'python', 'rust', 'golang', 'java', 'typescript'],
  },
  {
    slug: 'web-frontend',
    title: 'Web & Frontend',
    tags: ['webdev', 'frontend', 'react', 'css'],
  },
  {
    slug: 'backend',
    title: 'Backend & Architecture',
    tags: ['backend', 'architecture', 'nodejs', 'microservices'],
  },
  { slug: 'security', title: 'Security', tags: ['security'] },
  {
    slug: 'devops-cloud',
    title: 'DevOps & Cloud',
    tags: ['devops', 'cloud', 'kubernetes', 'aws', 'docker'],
  },
  {
    slug: 'systems',
    title: 'Systems & Hardware',
    tags: ['linux', 'hardware', 'embedded', 'c'],
  },
  {
    slug: 'devtools',
    title: 'DevTools & Productivity',
    tags: ['productivity', 'vscode', 'git'],
  },
  {
    slug: 'data',
    title: 'Data & Databases',
    tags: ['database', 'sql', 'postgresql', 'data-science', 'data-engineering'],
  },
  {
    slug: 'career',
    title: 'Career & Leadership',
    tags: ['career', 'leadership'],
  },
  {
    slug: 'open-source',
    title: 'Open Source',
    tags: ['open-source', 'github'],
  },
  { slug: 'games', title: 'Games', tags: ['gaming', 'game-development'] },
  {
    slug: 'mobile',
    title: 'Mobile',
    tags: ['mobile', 'android', 'ios', 'flutter', 'react-native'],
  },
];

const tagsBySource = Object.entries(rawByTag).reduce<Record<string, string[]>>(
  (map, [tag, ids]) => {
    ids.forEach((id) => {
      map[id] = [...(map[id] ?? []), tag];
    });
    return map;
  },
  {},
);

export const allSources: Source[] = rawSources.map((raw) => {
  const latest = (rawPosts[raw.id] ?? []).map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
  }));
  const postTags = latest.flatMap((post) => post.tags);
  const tags = Array.from(
    new Set([...(tagsBySource[raw.id] ?? []), ...postTags]),
  ).slice(0, 5);
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    permalink: `https://daily.dev/sources/${raw.handle}`,
    isPublication: raw.type === 'machine' && raw.id !== 'daily_updates',
    tags,
    latest,
  };
});

const byId = new Map(allSources.map((source) => [source.id, source]));

export const getSource = (id: string): Source => {
  const source = byId.get(id);
  if (!source) {
    throw new Error(`Unknown source ${id}`);
  }
  return source;
};

/** Production's four lists, unfiltered, the way /sources shows them today. */
export const production = {
  trending: productionLists.trending.map(getSource),
  popular: productionLists.popular.map(getSource),
  recent: productionLists.recent.map(getSource),
  video: productionLists.video.map(getSource),
};

export const publications = allSources.filter((source) => source.isPublication);

const byFollowers = (a: Source, b: Source) => b.followers - a.followers;
const byHeat = (a: Source, b: Source) =>
  b.upvotes / Math.max(1, b.posts) - a.upvotes / Math.max(1, a.posts);

const fill = (head: Source[], rest: Source[], size: number): Source[] =>
  Array.from(new Set([...head, ...rest])).slice(0, size);

/** The same four lists with the ranking fix: publications only. */
export const lists = {
  trending: fill(
    production.trending.filter((source) => source.isPublication),
    [...publications].sort(byHeat),
    10,
  ),
  popular: [...publications].sort(byFollowers).slice(0, 10),
  recent: production.recent,
  video: production.video,
};

// A category's publications: the ones more of its tags agree on first,
// then by followers.
export const sourcesForCategory = (slug: string): Source[] => {
  const tags = categories.find((category) => category.slug === slug)?.tags;
  const matches = new Map<string, number>();
  tags?.forEach((tag) =>
    (rawByTag[tag] ?? []).forEach((id) =>
      matches.set(id, (matches.get(id) ?? 0) + 1),
    ),
  );
  return [...matches.keys()]
    .map(getSource)
    .filter((source) => source.isPublication)
    .sort(
      (a, b) =>
        (matches.get(b.id) ?? 0) - (matches.get(a.id) ?? 0) ||
        b.followers - a.followers,
    );
};

/* --------------------------------------------------------- communities */

export type Squad = RawSquad;
export type Person = RawPerson;

// daily.dev's own Changelog isn't a community, and Watercooler went with
// its removed page.
const hiddenSquads = ['daily_updates', 'watercooler'];

/** A category's Squads and the developers writing about it. */
export const communitiesForCategory = (
  slug: string,
): { squads: Squad[]; people: Person[] } => {
  const { squads = [], people = [] } = rawCommunities[slug] ?? {};
  return {
    squads: squads.filter(
      (squad) =>
        !hiddenSquads.includes(squad.handle) &&
        !hiddenSquads.includes(squad.id),
    ),
    people,
  };
};

/* -------------------------------------------------------------- viewer */

/** A logged-in reader who follows five sources and blocked one. */
export const viewer = {
  following: ['fireship', 'devto', 'hn', 'css_tricks', 'nodejs'],
  blocked: ['medium_js'],
};

/* --------------------------------------------------------------- search */

export const searchSources = (query: string, pool = publications): Source[] => {
  const q = query.trim().toLowerCase().replace(/^[#@]/, '');
  if (!q) {
    return pool;
  }
  return pool.filter(
    (source) =>
      source.name.toLowerCase().includes(q) ||
      source.handle.toLowerCase().includes(q) ||
      source.tags.some((tag) => tag.includes(q)) ||
      (source.description ?? '').toLowerCase().includes(q),
  );
};
