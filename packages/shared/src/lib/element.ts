import classNames from 'classnames';
import { isTesting } from './constants';

type Column = number;
type Row = number;

export type CaretOffset = [number, number];
export type CaretPosition = [Column, Row];

const isFirefox = process.env.TARGET_BROWSER === 'firefox';

const getShadowDom = (): Document => {
  const companion = document.querySelector('daily-companion-app');

  if (!companion) {
    return null;
  }

  if (!isFirefox) {
    return companion.shadowRoot as unknown as Document;
  }

  return companion.shadowRoot.ownerDocument;
};

export function getCaretPostition(el: Element): CaretPosition {
  const dom = getShadowDom() || window;
  const sel = dom.getSelection();
  let row = 0;
  for (; row < el.childNodes.length; row += 1) {
    const child = el.childNodes[row];
    const node = child.nodeValue ? child : child.firstChild;
    if (child === sel.anchorNode || sel.anchorNode === node) {
      break;
    }
  }

  return [sel.anchorOffset, row === -1 ? 0 : row];
}

export const getCaretOffset = (textarea: HTMLDivElement): CaretOffset => {
  const left = document.createElement('span');
  const right = document.createElement('span');
  const div = document.createElement('div');
  const [col, row] = getCaretPostition(textarea);
  const leftSum = Array.from(textarea.childNodes).reduce((sum, line, i) => {
    if (i > row) {
      return sum;
    }

    if (i === row) {
      return sum + col;
    }

    if (i === 0) {
      return sum + (line.nodeValue?.length || 0);
    }

    const el = line as HTMLElement;

    return sum + el.innerText.length + 1;
  }, 0);

  const content =
    textarea.innerText.replaceAll?.('\n\n', '\n') || textarea.innerText;
  left.innerText = content.substring(0, leftSum);
  right.innerText = content.substring(leftSum);

  div.className = classNames(textarea.className, 'absolute invisible');
  div.setAttribute('style', 'left: 2rem');
  div.appendChild(left);
  div.appendChild(right);
  textarea.parentElement.appendChild(div);

  const coordinates: CaretOffset = [right.offsetLeft, right.offsetTop];
  div.remove();

  return coordinates;
};

const getEndIndex = (value: string, start: number) => {
  const end = value.indexOf(' ', start);

  return end === -1 ? undefined : end;
};

const getNodeText = (node: Node) => {
  if (isTesting) {
    const el = node as HTMLElement;

    return el.innerText.substring(1);
  }

  const string = node?.nodeValue || node?.firstChild?.nodeValue || '';

  return string.replaceAll('\xa0', ' ');
};

export function setCaretPosition(el: Node, col: number): void {
  const shadowDom = getShadowDom();
  const range = (shadowDom || document).createRange();
  const sel = (shadowDom || window).getSelection();

  range.setStart(el, col);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

export function getWord(
  textarea: HTMLDivElement,
  [col, row]: CaretPosition,
): string {
  const node = Array.from(textarea.childNodes).find(
    (_, index) => index === row,
  );
  const text = getNodeText(node || textarea);
  const end = getEndIndex(text, col);

  return text.substring(col, end) || '';
}

export const getSplittedText = (
  textarea: HTMLDivElement,
  [col, row]: CaretPosition,
  query: string,
): [Node, string, string] => {
  const companion = getShadowDom();
  const offset = companion ? 0 : 1;
  const node = Array.from(textarea.childNodes).find((_, i) => i === row);
  const text = getNodeText(node);
  const left = text?.substring(0, col - 1) || '';
  const right = text?.substring(col + query.length - offset) || '';

  return [node, left, right];
};

const getOffset = (left: string, col: number) => {
  const lastChar = left.charAt(left.length - 1);

  if (col === 0 || lastChar === ' ') {
    return '';
  }

  return lastChar !== '' ? '&nbsp;' : '';
};

export function replaceWord(
  textarea: HTMLDivElement,
  [col, row]: CaretPosition,
  query: string,
  replacement: string,
  forInitialization?: boolean,
): void {
  const [node, left, right] = getSplittedText(textarea, [col, row], query);
  const additionalSpace = forInitialization ? getOffset(left, col) : '';
  const offset = additionalSpace.length || !forInitialization ? 0 : 1;
  const result = `${left}${additionalSpace}${replacement}&nbsp;${right}`;

  if (row === 0) {
    // eslint-disable-next-line no-param-reassign
    textarea.innerHTML = result;
    Array.from(textarea.children).forEach((child) => textarea.append(child));
    setCaretPosition(textarea.firstChild, col + replacement.length - offset);
  } else {
    const el = node as HTMLElement;
    el.innerHTML = result;
    setCaretPosition(el.firstChild, col + replacement.length - offset);
  }
}

export const getSelectionStart = (
  value: string,
  [col, row]: CaretPosition,
): number =>
  value.split('\n').reduce((sum, line, index) => {
    if (index < row - 1) {
      return sum + line.length + 1;
    }

    if (index === row - 1) {
      return sum + col;
    }

    return sum;
  }, 0);

export function hasSpaceBeforeWord(
  textarea: HTMLDivElement,
  [col, row]: CaretPosition,
): [boolean, string, number] {
  if (isTesting) {
    return [true, textarea.innerText.substring(1), 0];
  }

  if (col === 0) {
    return [false, '', -1];
  }

  let position = 0;
  const node = Array.from(textarea.childNodes).find((_, i) => i === row);
  const line = getNodeText(node);

  if (!line.charAt(col - 1).trim().length) {
    return [false, '', -1];
  }

  const query = line.split(' ').find((word, index) => {
    const offset = index > 0 ? 1 : 0;
    position += word.length + offset;

    return position >= col;
  });

  return [
    query.charAt(0) === '@',
    query.substring(1),
    position - query.length + 1,
  ];
}

export const anyElementClassContains = (
  elements: HTMLElement[],
  token: string,
): boolean =>
  Array.from(elements).some((element) => {
    if (!element?.classList) {
      return false;
    }

    return element.classList.contains(token);
  });
