import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// `/posts/[id]` is mirrored under `/layout-v2`, so for the sessions served
// from the mirror `router.pathname` carries the prefix. A raw comparison
// against '/posts/' is then wrong for that cohort and right for everyone
// else — a split that never shows up in local dev, because it needs the
// cookie. Every such comparison has to go through the helper.
const ROOTS = ['../shared/src', '../webapp'];
const SKIP_DIRS = new Set([
  '.next',
  '__tests__',
  'node_modules',
  'public',
  'storybook-static',
]);
const HELPER = 'withoutLayoutVariantPrefix';
// `router.pathname` / `router.route` reaching a '/posts/' literal without the
// helper in between.
const RAW_CHECK = /router\??\.(pathname|route)[^;{}]{0,160}?['"]\/posts\//;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    if (SKIP_DIRS.has(entry)) {
      return [];
    }

    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return walk(path);
    }

    return /\.tsx?$/.test(entry) && !/\.spec\.tsx?$/.test(entry) ? [path] : [];
  });

describe('post-page route checks', () => {
  it('never compares a raw router pathname against /posts/', () => {
    const offenders = ROOTS.flatMap((root) => walk(join(__dirname, '..', root)))
      .filter((path) => {
        const source = readFileSync(path, 'utf8').replace(/\s+/g, ' ');
        // Drop the guarded accesses first, so only raw ones can match.
        const unguarded = source.replaceAll(
          new RegExp(
            `${HELPER}\\(\\s*router\\??\\.(pathname|route)\\s*\\)`,
            'g',
          ),
          'GUARDED_PATHNAME',
        );

        return RAW_CHECK.test(unguarded);
      })
      .map((path) => path.replace(join(__dirname, '..', '..'), ''));

    expect(offenders).toEqual([]);
  });
});
