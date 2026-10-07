/**
 * Sources, with their real marks.
 *
 * A post row without artwork is a bullet list. Apple Music and Spotify both
 * anchor every row on a square piece of art, and the equivalent here is the
 * source: it is the only image daily.dev reliably has for a post, it is
 * recognisable at 54px, and it is what makes a list of headlines read as a
 * collection rather than a changelog.
 *
 * Logos are the sources' own GitHub organisation avatars where one exists,
 * which is real, public and hotlink-friendly. The rest carry a monogram on
 * their tint, which is also what the app does when a source has no image.
 */

export interface Source {
  id: string;
  name: string;
  /** GitHub org or user backing the logo. Absent means monogram only. */
  login?: string;
  /** Ground the artwork sits on, so a row is identifiable before it is read. */
  tint: string;
}

export const SOURCES: Source[] = [
  { id: 'postgres', name: 'PostgreSQL', login: 'postgres', tint: '#4A7EEE' },
  { id: 'cloudflare', name: 'Cloudflare Blog', login: 'cloudflare', tint: '#FF9157' },
  { id: 'kubernetes', name: 'Kubernetes Blog', login: 'kubernetes', tint: '#4A7EEE' },
  { id: 'rust', name: 'Rust Blog', login: 'rust-lang', tint: '#DD5143' },
  { id: 'vercel', name: 'Vercel Blog', login: 'vercel', tint: '#887BF8' },
  { id: 'github', name: 'The GitHub Blog', login: 'github', tint: '#29D8E5' },
  { id: 'jvns', name: 'Julia Evans', login: 'jvns', tint: '#CE3DF3' },
  { id: 'pragmatic', name: 'The Pragmatic Engineer', login: 'gergelyorosz', tint: '#FFE24C' },
  { id: 'acm', name: 'ACM Queue', tint: '#57E087' },
  { id: 'lwn', name: 'LWN.net', tint: '#F25D82' },
];

export const sourceBy = (id: string): Source =>
  SOURCES.find((source) => source.id === id) ?? SOURCES[0];

export const sourceLogo = (source: Source, size = 128): string | null =>
  source.login
    ? `https://github.com/${source.login}.png?size=${Math.max(64, size)}`
    : null;

export const monogramOf = (name: string): string =>
  name
    .replace(/^(the)\s+/i, '')
    .split(/[\s.]+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
