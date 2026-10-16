// Generates postPages.json: every post in raw.ts as production's
// POST_BY_ID_QUERY returns it from api.daily.dev, with the people in it
// (authors, squad admins and moderators) swapped for made-up profiles and
// the fields no post page reads left out.
//
//   node packages/storybook/stories/history/postPages.mjs             fetch again
//   node packages/storybook/stories/history/postPages.mjs --sanitize  clean the file in place
//
// Run from the repository root, then `npx prettier --write` the JSON.

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const output = join(here, 'postPages.json');

// Internal ids and the anonymous viewer's state: null for a logged-out
// fetch, and no post page needs them from the fixture.
const dropped = [
  'yggdrasilId',
  'userState',
  'bookmark',
  'bookmarkList',
  'bookmarked',
  'upvoted',
  'downvoted',
  'commented',
];

const names = [
  'Alex Rivera',
  'Sam Patel',
  'Jordan Lee',
  'Casey Morgan',
  'Riley Chen',
  'Taylor Brooks',
  'Jamie Novak',
  'Morgan Diaz',
];

const profiles = new Map();

/** The same made-up profile for every appearance of one person. */
const profileFor = (person) => {
  // Already made up: a second --sanitize run leaves it alone.
  if (person.id.startsWith('storybook-user-')) {
    return person;
  }
  if (!profiles.has(person.id)) {
    const n = profiles.size;
    const username = `reader${n + 1}`;
    profiles.set(person.id, {
      id: `storybook-user-${n + 1}`,
      name: names[n % names.length],
      image: `https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/${(n % 8) + 1}`,
      permalink: `https://app.daily.dev/${username}`,
      username,
      bio: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      reputation: 10,
      companies: [],
      isPlus: false,
      plusMemberSince: null,
      coresRole: null,
      contentPreference: null,
      topReader: null,
    });
  }
  const profile = profiles.get(person.id);
  // Only the fields the query asked for, so the shape stays the same.
  return Object.fromEntries(
    Object.keys(person).map((key) => [key, profile[key] ?? null]),
  );
};

const isPerson = (value) =>
  !!value && typeof value === 'object' && 'username' in value && 'id' in value;

const sanitize = (value, key) => {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitize(entry));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (['author', 'scout', 'user'].includes(key) && isPerson(value)) {
    return profileFor(value);
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([field]) => !dropped.includes(field))
      .map(([field, entry]) => [field, sanitize(entry, field)]),
  );
};

/** POST_BY_ID_QUERY from shared, so the fixture follows the real query. */
const loadQuery = async () => {
  // Storybook's own esbuild, through Vite.
  const require = createRequire(import.meta.url);
  const { build } = createRequire(require.resolve('vite'))('esbuild');
  const dir = mkdtempSync(join(tmpdir(), 'post-query-'));
  const outfile = join(dir, 'query.mjs');
  await build({
    stdin: {
      contents: `export { POST_BY_ID_QUERY } from '${join(here, '../../../shared/src/graphql/posts')}';`,
      resolveDir: here,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'error',
  });
  return (await import(pathToFileURL(outfile).href)).POST_BY_ID_QUERY;
};

const fetchPosts = async () => {
  const ids = [
    ...readFileSync(join(here, 'raw.ts'), 'utf8').matchAll(
      /^ {4}id: '([^']+)',$/gm,
    ),
  ].map(([, id]) => id);
  const query = await loadQuery();
  const posts = {};
  // One at a time, to stay gentle with the public API.
  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch('https://api.daily.dev/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { id } }),
    });
    // eslint-disable-next-line no-await-in-loop
    const { data, errors } = await response.json();
    if (errors) {
      throw new Error(`${id}: ${errors[0].message}`);
    }
    posts[id] = data.post;
  }
  return posts;
};

/**
 * A post in its author's personal source shows the author as the source,
 * so the source takes the author's made-up profile too.
 */
const sanitizePost = (post) => {
  const clean = sanitize(post);
  const author = post.author && profileFor(post.author);
  if (clean.source?.type !== 'user' || !author) {
    return clean;
  }
  return {
    ...clean,
    source: {
      ...clean.source,
      id: author.id,
      handle: author.username,
      name: author.name,
      image: author.image,
      permalink: `https://daily.dev/sources/${author.username}`,
    },
  };
};

const posts = process.argv.includes('--sanitize')
  ? JSON.parse(readFileSync(output, 'utf8'))
  : await fetchPosts();

writeFileSync(
  output,
  `${JSON.stringify(
    Object.fromEntries(
      Object.entries(posts).map(([id, post]) => [id, sanitizePost(post)]),
    ),
    null,
    2,
  )}\n`,
);
console.log(
  `${Object.keys(posts).length} posts, ${profiles.size} people replaced`,
);
