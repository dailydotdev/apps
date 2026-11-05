import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LIVE_CHAT_JOIN_PARAM, LIVE_CHAT_JOIN_VALUE } from '../joinLink';

// Whether the viewer came to this post to join its chat (see joinLink.ts).
// Read once on mount, then taken off the URL so a reload or a share does
// not join again; the answer holds for the life of the page.
export const useLiveChatJoinIntent = (): boolean => {
  const router = useRouter();
  const [wantsToJoin] = useState(() => {
    if (router?.query?.[LIVE_CHAT_JOIN_PARAM] === LIVE_CHAT_JOIN_VALUE) {
      return true;
    }
    // Before the router is ready the query is empty; the address is not.
    return (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get(LIVE_CHAT_JOIN_PARAM) ===
        LIVE_CHAT_JOIN_VALUE
    );
  });

  useEffect(() => {
    if (!wantsToJoin || !router?.isReady) {
      return;
    }
    if (router.query[LIVE_CHAT_JOIN_PARAM] !== LIVE_CHAT_JOIN_VALUE) {
      return;
    }
    const { [LIVE_CHAT_JOIN_PARAM]: ignored, ...query } = router.query;
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
    // Once is enough; the router object changes identity on every route event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.isReady, wantsToJoin]);

  return wantsToJoin;
};
