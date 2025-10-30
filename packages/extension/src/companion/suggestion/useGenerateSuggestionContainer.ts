import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (!id || injectedElement) {
      return;
    }

    const func = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for the dom to load

      const quickReplies = container.querySelector(`.${quickRepliesClass}`);

      if (!quickReplies) {
        return;
      }

      const exists = container.querySelector(`.${customClass}`);

      if (exists) {
        return;
      }

      const parent = container.querySelector(`.${containerClass}`);

      if (!parent) {
        return;
      }

      const generated = document.createElement('div');
      generated.setAttribute('style', generatedStyles);
      parent.appendChild(generated);

      setInjectedElement(generated);
    };

    func();
  }, [id, container, injectedElement]);

  return { injectedElement };
};
