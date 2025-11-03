import { ONE_SECOND } from '@dailydotdev/shared/src/lib/func';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface UseMessagePopupObserverProps {
  id: string;
  container: HTMLElement | Document;
}

const quickRepliesClass = 'msg-s-message-list__quick-replies-container';
const containerClass = 'msg-s-message-list-content';
const customClass = 'dd-custom-suggestion';
const generatedStyles =
  'display: flex; justify-content: center; margin-bottom: 8px;';

interface UseGenerateSuggestionContainer {
  injectedElement: HTMLElement | null;
}

export const useGenerateSuggestionContainer = ({
  id,
  container,
}: UseMessagePopupObserverProps): UseGenerateSuggestionContainer => {
  const [injectedElement, setInjectedElement] = useState<HTMLElement | null>(
    null,
  );

  useQuery({
    queryKey: ['suggestion-container', id],
    queryFn: () => null,
    staleTime: Infinity,
    refetchInterval: (cache) => {
      const retries = cache.state.dataUpdateCount;

      if (injectedElement || retries >= 3) {
        return false;
      }

      const quickReplies = container.querySelector(`.${quickRepliesClass}`);

      if (!quickReplies) {
        return ONE_SECOND;
      }

      const exists = container.querySelector(`.${customClass}`);

      if (exists) {
        return false;
      }

      const parent = container.querySelector(`.${containerClass}`);

      if (!parent) {
        return ONE_SECOND;
      }

      const generated = document.createElement('div');
      generated.setAttribute('style', generatedStyles);
      generated.setAttribute('class', customClass);
      parent.appendChild(generated);

      setInjectedElement(generated);

      return false;
    },
  });

  return { injectedElement };
};
