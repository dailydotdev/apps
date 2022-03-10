import { isTesting } from './constants';

export const isBreakLine = (node: Node): boolean => !node.nodeValue;

export type CaretPosition = [number, number];

export function setCaretPosition(el: Node, col: number): void {
  const range = document.createRange();
  const sel = window.getSelection();

  range.setStart(el, col);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

const getNodeText = (node: Node) => {
  if (isTesting) {
    const el = node as HTMLElement;

    return el.innerText.substring(1);
  }

  return node.nodeValue || node.firstChild.nodeValue;
};

export function getWord(parent: Element, [col, row]: CaretPosition): string {
  const node = Array.from(parent.childNodes).find((_, index) => index === row);
  const query = getNodeText(node || parent).substring(col);

  return query.split(' ')[0];
}

export function replaceWord(
  parent: Element,
  [col, row]: CaretPosition,
  query: string,
  replacement: string,
): void {
  const node = Array.from(parent.childNodes).find((_, index) => index === row);
  const element = node.nodeValue ? node : node.firstChild;
  const words = element.nodeValue.split(' ');
  let currentCol = 0;
  const updated = words.map((word, index) => {
    const position = currentCol + index + word.length;
    if (position < col || query !== word) {
      currentCol = position;
      return word;
    }

    currentCol = position;

    return replacement;
  });

  const result = updated.join(' ');
  if (node.nodeValue) {
    node.nodeValue = result;
    setCaretPosition(node, result.length);
  } else {
    const el = node as HTMLElement;
    el.innerText = result;
    setCaretPosition(el.firstChild, result.length);
  }
}

export function getCaretPostition(el: Element): CaretPosition {
  const sel = window.getSelection();
  const row = Array.from(el.childNodes).findIndex((child) => {
    const element = child.nodeValue ? child : child.childNodes[0];

    return sel.anchorNode === element;
  });
  return [sel.anchorOffset, row === -1 ? 0 : row];
}

export function hasSpaceBeforeWord(
  node: Element,
  [col, row]: CaretPosition,
): boolean {
  if (col === 0) {
    return true;
  }

  const child = Array.from(node.childNodes).find((_, index) => index === row);
  const element = child.nodeValue ? child : child.childNodes[0];

  if (isBreakLine(element)) {
    return false;
  }

  return element.nodeValue.charAt(col - 2).trim() === '';
}
