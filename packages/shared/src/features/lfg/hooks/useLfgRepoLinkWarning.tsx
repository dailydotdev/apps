import type { MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { DmPeer } from '../../messages/types';
import { lfgConversationQueryOptions } from '../queries';
import { LfgRepoLinkWarning } from '../components/messages/LfgRepoLinkWarning';
import { useLfgEnabled } from './useLfgEnabled';

const repoHosts = ['github.com', 'gitlab.com'];

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

    return repoHosts.includes(url.hostname.replace(/^www\./, ''))
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
};

// Strangers who met on a post are where repo-run scams start, so a code link
// in a chat that began with a reach-out asks before it opens.
export const useLfgRepoLinkWarning = (
  peer: Pick<DmPeer, 'id' | 'name' | 'username'> | null | undefined,
): {
  onClickCapture: (event: MouseEvent) => void;
  warning: ReactElement | null;
} => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const { data } = useQuery(
    lfgConversationQueryOptions(user, peer?.id ?? '', { enabled: isEnabled }),
  );
  const [url, setUrl] = useState<string>();
  const isLfgChat = isEnabled && !!data?.reachOuts.length;

  const onClickCapture = (event: MouseEvent) => {
    const link = isLfgChat ? getRepoLink(event.target) : undefined;

    if (!link) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setUrl(link);
  };

  return {
    onClickCapture,
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
