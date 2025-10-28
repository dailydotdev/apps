import React, { useEffect, useRef, useState } from 'react';
import { useThreadPageObserver } from './useThreadPageObserver';
import { MessageSuggestionPopup } from './MessageSuggestionPopup';

const bubbleClass = 'msg-overlay-conversation-bubble';
const titleClass = 'msg-overlay-bubble-header__title';

interface MessagePopup {
  id: string;
  bubble: HTMLElement;
}

export function MessageSuggestion() {
  useThreadPageObserver();
  const [popups, setPopups] = useState<MessagePopup[]>([]);
  const [observer] = useState(
    new MutationObserver(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10)); // wait for the dom to update
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

  const containerFinder = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    containerFinder.current = setInterval(() => {
      const container = document.querySelector('#msg-overlay');

      if (!container) {
        return;
      }

      clearInterval(containerFinder.current);
      observer.observe(container, { childList: true, subtree: false });
    }, 1000);

    return () => {
      if (containerFinder.current) {
        clearInterval(containerFinder.current);
      }

      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  return popups.map(({ id, bubble }) => (
     <MessageSuggestionPopup key={id} id={id} bubble={bubble} />
  ))
}
