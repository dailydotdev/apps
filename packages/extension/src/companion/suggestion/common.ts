import classNames from 'classnames';

const containerClass = 'msg-s-message-list-content';

interface GenerateReplySuggestionProps {
  cta: string;
  onClick: () => void;
  wrapper?: HTMLElement | Document;
}

const customClass = 'dd-custom-suggestion';

export const generateReplySuggestion = ({
  cta,
  onClick,
  wrapper = document,
}: GenerateReplySuggestionProps) => {
  const exists = wrapper.querySelector(`.${customClass}`);

  if (exists) {
    return;
  }

  const parent = wrapper.querySelector(`.${containerClass}`);

  if (!parent) {
    return;
  }

  const container = document.createElement('div');
  container.style =
    'display: flex; justify-content: center; margin-bottom: 8px;';
  const constructed = document.createElement('button');
  constructed.setAttribute(
    'class',
    classNames(
      'conversations-quick-replies__reply-button artdeco-button artdeco-button--2 artdeco-button--secondary',
      customClass,
    ),
  );
  constructed.style.marginLeft = 'auto';
  constructed.style.marginRight = 'auto';
  constructed.innerText = cta;
  constructed.onclick = onClick;

  container.appendChild(constructed);
  parent.appendChild(container);
};
