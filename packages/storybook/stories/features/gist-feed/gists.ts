import gistsJson from './gists.json';

// A gist is what a sharp colleague would tell you about a piece in under a
// minute: the point, one or two concrete details, the bottom line and, when the
// piece invites it, the claim people would argue about. It is written from the
// piece alone, with no commentary of our own. `code` in backticks renders as
// inline code, and a paragraph of lines starting with "- " renders as a list.

export type GistKind =
  | 'news'
  | 'release'
  | 'opinion'
  | 'story'
  | 'explainer'
  | 'tool'
  | 'video'
  | 'collection';

export interface Gist {
  kind: GistKind;
  /** The takeaway, rewritten from the original headline. */
  title: string;
  /** Always visible, so it has to stand on its own. */
  lead: string;
  body: string[];
  bottomLine?: string;
  /** Only when the piece makes a claim people would argue about. */
  question?: string;
  /** `summary` when the source couldn't be read, like a video's transcript. */
  basis: 'article' | 'summary';
}

/** Keyed by the feed post's id; for a share, the gist is of the shared link. */
export const gists = gistsJson as Record<string, Gist>;
