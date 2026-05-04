import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  generateUserSourceAsSquad,
  generateDefaultSquad,
} from '../../components/post/write/MultipleSourceSelect';
import type { Squad } from '../../graphql/sources';
import { SourcePermissions } from '../../graphql/sources';
import { verifyPermission } from '../../graphql/squads';
import { isValidHttpUrl, urlStartRegexMatch } from '../../lib/links';
import { webappUrl } from '../../lib/constants';
import usePersistentContext from '../usePersistentContext';

export const SMART_COMPOSER_LAST_SQUAD_KEY = 'smart_composer:last_squad_id';

export type SmartComposerMode = 'freeform' | 'share';

export interface DetectedUrl {
  url: string;
  isInternal: boolean;
  internalPostSlug?: string;
}

interface UseSmartComposer {
  mode: SmartComposerMode;
  detectedUrl: DetectedUrl | null;
  audienceOptions: Squad[];
  defaultAudience: Squad | undefined;
  rememberAudience: (id: string) => Promise<void>;
  isAudienceReady: boolean;
}

interface UseSmartComposerProps {
  body: string;
  /**
   * True when the user has manually typed a title. When true, the composer
   * stays in freeform mode even if a URL is detected — the link is just
   * commentary, not the post itself. Title set by share auto-fill should
   * NOT flip this flag (so the share preview stays).
   */
  isTitleManuallyEdited?: boolean;
  initialSquadHandle?: string;
}

const INTERNAL_POST_PATTERN = /\/posts\/([^/?#]+)/i;

const URL_REGEX = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/gi;

const findFirstPlainUrlMatch = (text: string): RegExpMatchArray | undefined => {
  const matches = Array.from(text.matchAll(URL_REGEX));
  return matches.find((match) => {
    const index = match.index ?? 0;
    const before = text.slice(Math.max(0, index - 2), index);
    return !before.endsWith('](');
  });
};

const collapseWhitespace = (text: string): string =>
  text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSharedUrlVariants = (sharedUrl: string): string[] => {
  const variants = new Set<string>();
  const trimmed = sharedUrl.trim();
  if (!trimmed) {
    return [];
  }
  variants.add(trimmed);
  variants.add(trimmed.replace(/\/+$/, ''));
  variants.add(`${trimmed.replace(/\/+$/, '')}/`);
  try {
    const parsed = new URL(trimmed);
    variants.add(`${parsed.origin}${parsed.pathname}`);
  } catch {
    // unparseable — variant set still contains the raw string
  }
  return Array.from(variants).filter(Boolean);
};

/**
 * Cleans the body for share-mode submissions.
 *
 * In share mode the URL itself is represented by the embedded shared post card,
 * so it must not appear in the commentary. TipTap auto-converts pasted URLs
 * into markdown links like `[url](url)`, which a naive plain-URL strip would
 * leave alone — that's why bare share posts were rendering a stray `[` glyph.
 *
 * This helper strips:
 *   1. Markdown links pointing at the shared URL (any anchor text).
 *   2. Auto-linked markdown of the form `[url](url)` regardless of host.
 *   3. Plain occurrences of the shared URL and any leftover plain URLs.
 */
export const cleanShareCommentary = (
  text: string,
  sharedUrl?: string | null,
): string => {
  if (!text) {
    return '';
  }
  let cleaned = text;

  if (sharedUrl) {
    buildSharedUrlVariants(sharedUrl).forEach((variant) => {
      const escaped = escapeRegExp(variant);
      cleaned = cleaned.replace(
        new RegExp(`\\[[^\\]]*\\]\\(\\s*${escaped}\\s*\\)`, 'gi'),
        '',
      );
      cleaned = cleaned.replace(new RegExp(escaped, 'gi'), '');
    });
  }

  cleaned = cleaned.replace(
    /\[((?:https?:\/\/|www\.)[^\]\s]+)\]\(\s*\1\/?\s*\)/gi,
    '',
  );
  cleaned = cleaned.replace(URL_REGEX, '');

  return collapseWhitespace(cleaned);
};

/**
 * Returns true when the body contains nothing meaningful besides the
 * detected URL (and possibly its markdown auto-link wrapper). We only
 * promote to "share" mode in that case — i.e. the user pasted a link
 * as the very first thing.
 */
const isBodyJustSharedUrl = (body: string, sharedUrl: string): boolean => {
  if (!body) {
    return true;
  }
  const remainder = cleanShareCommentary(body, sharedUrl).trim();
  return remainder.length === 0;
};

export const detectFirstUrl = (text: string): DetectedUrl | null => {
  if (!text) {
    return null;
  }

  const validMatch = findFirstPlainUrlMatch(text);
  if (!validMatch) {
    return null;
  }
  const [candidate] = validMatch;

  const normalized = candidate.match(urlStartRegexMatch)
    ? candidate
    : `https://${candidate}`;

  if (!isValidHttpUrl(normalized)) {
    return null;
  }

  let isInternal = false;
  let internalPostSlug: string | undefined;

  try {
    const parsed = new URL(normalized);
    const webappHostname = new URL(webappUrl).hostname;
    isInternal = parsed.hostname === webappHostname;
    if (isInternal) {
      const postMatch = parsed.pathname.match(INTERNAL_POST_PATTERN);
      if (postMatch) {
        [, internalPostSlug] = postMatch;
      }
    }
  } catch {
    // unparseable URL falls through as external
  }

  return { url: normalized, isInternal, internalPostSlug };
};

export const useSmartComposer = ({
  body,
  isTitleManuallyEdited = false,
  initialSquadHandle,
}: UseSmartComposerProps): UseSmartComposer => {
  const { user, squads } = useAuthContext();
  const router = useRouter();
  const [lastUsedSquadId, setLastUsedSquadId, isLastReady] =
    usePersistentContext<string | null>(SMART_COMPOSER_LAST_SQUAD_KEY, null);

  const detectedUrl = useMemo(() => detectFirstUrl(body), [body]);
  const mode: SmartComposerMode = useMemo(() => {
    if (!detectedUrl) {
      return 'freeform';
    }
    // Only auto-promote to "share" when the link is the first thing the
    // user entered: no manually-typed title and no other body content
    // beyond the URL. Auto-filled title from the share preview doesn't
    // count.
    if (isTitleManuallyEdited) {
      return 'freeform';
    }
    if (!isBodyJustSharedUrl(body, detectedUrl.url)) {
      return 'freeform';
    }
    return 'share';
  }, [body, detectedUrl, isTitleManuallyEdited]);

  const userSource = useMemo(
    () => (user ? generateUserSourceAsSquad(user) : null),
    [user],
  );

  const postableSquads = useMemo(
    () =>
      (squads ?? []).filter(
        (squad) =>
          squad?.active && verifyPermission(squad, SourcePermissions.Post),
      ),
    [squads],
  );

  const audienceOptions = useMemo<Squad[]>(() => {
    const options: Squad[] = [];
    if (userSource) {
      options.push(userSource);
    }
    return options.concat(postableSquads);
  }, [userSource, postableSquads]);

  const routerSquadHandle = useMemo(() => {
    if (initialSquadHandle) {
      return initialSquadHandle;
    }
    if (router.route === '/squads/[handle]') {
      const { handle } = router.query;
      return Array.isArray(handle) ? handle[0] : handle;
    }
    return undefined;
  }, [initialSquadHandle, router.route, router.query]);

  const defaultAudience = useMemo<Squad | undefined>(() => {
    if (routerSquadHandle) {
      const match = audienceOptions.find(
        (squad) => squad.handle === routerSquadHandle,
      );
      if (match) {
        return match;
      }
    }
    if (lastUsedSquadId) {
      const match = audienceOptions.find(
        (squad) => squad.id === lastUsedSquadId,
      );
      if (match) {
        return match;
      }
    }
    if (userSource) {
      return userSource;
    }
    return (
      audienceOptions[0] ??
      (user ? generateDefaultSquad(user.username) : undefined)
    );
  }, [routerSquadHandle, lastUsedSquadId, audienceOptions, userSource, user]);

  const rememberAudience = useCallback(
    async (id: string) => {
      await setLastUsedSquadId(id);
    },
    [setLastUsedSquadId],
  );

  return {
    mode,
    detectedUrl,
    audienceOptions,
    defaultAudience,
    rememberAudience,
    isAudienceReady: isLastReady,
  };
};
