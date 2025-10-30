import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ONE_SECOND, sleep } from '@dailydotdev/shared/src/lib/func';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { useThreadPageObserver } from './useThreadPageObserver';
import { MessageSuggestionPortal } from './MessageSuggestionPortal';

const bubbleClass = 'msg-overlay-conversation-bubble';
const titleClass = 'msg-overlay-bubble-header__title';

interface MessagePopup {
  id: string;
  bubble: HTMLElement;
}

export function MessageSuggestion() {
  const { id: threadUserId } = useThreadPageObserver();
  const [popups, setPopups] = useState<MessagePopup[]>([]);
  const [observer] = useState(
    new MutationObserver(async () => {
      await sleep(10); // wait for the dom to update
      const bubbles = document.querySelectorAll(`.${bubbleClass}`);
      const toUpdate = [];

      bubbles.forEach((bubble) => {
        const header = bubble.querySelector(`.${titleClass}`);
        const anchor = header?.firstElementChild as HTMLAnchorElement;
        const id = anchor?.getAttribute('href')?.split('/in/')[1];
        const cleanId = id?.replace(/\//g, '');

        if (cleanId) {
          toUpdate.push({ id: cleanId, bubble });
        }
      });

      setPopups(toUpdate);
    }),
  );

  useQuery({
    queryKey: ['msg-overlay'],
    queryFn: () => null,
    refetchInterval: (cache) => {
      const retries = cache.state.dataUpdateCount;

      if (retries >= 3) {
        return false;
      }

      const container = document.querySelector('#msg-overlay');

      if (!container) {
        return ONE_SECOND;
      }

      observer.observe(container, { childList: true, subtree: false });

      return false;
    },
  });

  return (
    <>
      {popups.map(({ id, bubble }) => (
        <MessageSuggestionPortal
          key={id}
          id={id}
          bubble={bubble}
          target_id={TargetId.MessagePopup}
        />
      ))}
      {threadUserId && (
        <MessageSuggestionPortal
          key={threadUserId}
          id={threadUserId}
          bubble={globalThis?.document}
          target_id={TargetId.ThreadPage}
        />
      )}
    </>
  );
}
