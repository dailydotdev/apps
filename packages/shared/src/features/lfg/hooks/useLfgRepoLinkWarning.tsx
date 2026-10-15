import type { MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { DmPeer } from '../../messages/types';
import { lfgConversationQueryOptions } from '../queries';
import { LfgRepoLinkWarning } from '../components/messages/LfgRepoLinkWarning';
import { useLfgEnabled } from './useLfgEnabled';

// Repos, gists, raw files and archive downloads, on any subdomain.
const repoDomains = ['github.com', 'githubusercontent.com', 'gitlab.com'];

const isRepoHost = (hostname: string): boolean =>
  repoDomains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );

export const getRepoLink = (target: EventTarget | null): string | undefined => {
  const anchor =
    target instanceof Element ? target.closest('a[href]') : undefined;

  if (!anchor) {
    return undefined;
  }

  try {
    const url = new URL(
      anchor.getAttribute('href') ?? '',
      window.location.href,
    );

    return isRepoHost(url.hostname) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

type RepoLinkGuard = {
  // Middle clicks open tabs through auxclick, so both are caught.
  onClickCapture: (event: MouseEvent) => void;
  onAuxClickCapture: (event: MouseEvent) => void;
  warning: ReactElement | null;
};

// Asks before a repo link opens, wherever `isGuarded` holds.
export const useRepoLinkGuard = (
  peer: Pick<DmPeer, 'id' | 'name' | 'username'> | null | undefined,
  isGuarded: boolean,
): RepoLinkGuard => {
  const [url, setUrl] = useState<string>();

  const onClickCapture = (event: MouseEvent) => {
    const link = isGuarded ? getRepoLink(event.target) : undefined;

    if (!link) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setUrl(link);
  };

  return {
    onClickCapture,
    onAuxClickCapture: onClickCapture,
    warning:
      url && peer ? (
        <LfgRepoLinkWarning
          url={url}
          peer={peer}
          onClose={() => setUrl(undefined)}
        />
      ) : null,
  };
};

// Strangers who met on a post are where repo-run scams start, so a code link
// in a chat that began with a reach-out asks before it opens.
export const useLfgRepoLinkWarning = (
  peer: Pick<DmPeer, 'id' | 'name' | 'username'> | null | undefined,
): RepoLinkGuard => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const { data } = useQuery(
    lfgConversationQueryOptions(user, peer?.id ?? '', { enabled: isEnabled }),
  );

  return useRepoLinkGuard(peer, isEnabled && !!data?.reachOuts.length);
};
