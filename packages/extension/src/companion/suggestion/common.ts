const containerClass = 'msg-s-message-list-content';

interface GenerateReplySuggestionProps {
  cta: string;
  onClick: () => void;
  wrapper?: HTMLElement | Document;
}

export const generateReplySuggestion = ({
  cta,
  onClick,
  wrapper = document,
}: GenerateReplySuggestionProps) => {
  const parent = wrapper.querySelector(`.${containerClass}`);
  const container = document.createElement('div');
  container.style =
    'display: flex; justify-content: center; margin-bottom: 8px;';
  const constructed = document.createElement('button');
  constructed.setAttribute(
    'class',
    'conversations-quick-replies__reply-button artdeco-button artdeco-button--2 artdeco-button--secondary',
  );
  constructed.style.marginLeft = 'auto';
  constructed.style.marginRight = 'auto';
  constructed.innerText = cta;
  constructed.onclick = onClick;

  if (!parent) {
    return;
  }

  container.appendChild(constructed);
  parent.appendChild(container);
};
