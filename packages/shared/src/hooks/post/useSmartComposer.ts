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
  initialSquadHandle?: string;
}

const INTERNAL_POST_PATTERN = /\/posts\/([^/?#]+)/i;

export const detectFirstUrl = (text: string): DetectedUrl | null => {
  if (!text) {
    return null;
  }

  const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/i;
  const match = text.match(urlRegex);
  if (!match) {
    return null;
  }

  const candidate = match[0];
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
  initialSquadHandle,
}: UseSmartComposerProps): UseSmartComposer => {
  const { user, squads } = useAuthContext();
  const router = useRouter();
  const [lastUsedSquadId, setLastUsedSquadId, isLastReady] =
    usePersistentContext<string | null>(SMART_COMPOSER_LAST_SQUAD_KEY, null);

  const detectedUrl = useMemo(() => detectFirstUrl(body), [body]);
  const mode: SmartComposerMode = detectedUrl ? 'share' : 'freeform';

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
