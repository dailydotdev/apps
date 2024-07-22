import classNames from 'classnames';

export enum KeyboardCommand {
  Enter = 'Enter',
  Space = 'Space',
}

export enum ArrowKey {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
}

export const Y_AXIS_KEYS = [ArrowKey.Up, ArrowKey.Down];
export const arrowKeys = Object.values(ArrowKey);

export type CaretOffset = [number, number];

export const getCaretOffset = (textarea: HTMLTextAreaElement): CaretOffset => {
  const left = document.createElement('span');
  const right = document.createElement('span');
  const div = document.createElement('div');

  left.innerText = textarea.value.substring(0, textarea.selectionStart);
  right.innerText = textarea.value.substring(textarea.selectionStart);

  left.setAttribute('style', 'word-break: break-word; max-width: 100%');
  div.className = classNames(textarea.className, 'invisible absolute');
  div.appendChild(left);
  left.appendChild(right);
  textarea.parentElement.appendChild(div);

  const coordinates: CaretOffset = [
    right.offsetLeft,
    right.offsetTop - textarea.scrollTop,
  ];

  // console.log(coordinates, textarea.scrollTop);
  div.remove();

  return coordinates;
};

export const parentClassContains = (
  el: HTMLElement,
  token: string,
): boolean => {
  if (!el.parentElement) {
    return false;
  }

  const parent = el.parentElement;

  if (parent.classList.contains(token)) {
    return true;
  }

  return parentClassContains(parent, token);
};

export const isCompanionActivated = (): boolean =>
  !!document
    .querySelector('daily-companion-app')
    ?.shadowRoot?.querySelector?.('#daily-companion-wrapper')?.firstChild;
