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

export function getWord(
  parent: Element,
  [col, row]: CaretPosition,
  query: string,
): string {
  const node = Array.from(parent.childNodes).find((_, index) => index === row);
  const text = getNodeText(node || parent);

  return text.substring(col, col + query.length + 1);
}

export function replaceWord(
  parent: Element,
  [col, row]: CaretPosition,
  query: string,
  replacement: string,
): void {
  const node = Array.from(parent.childNodes).find((_, index) => index === row);
  const text = getNodeText(node);
  const left = text.substring(0, col - 1);
  const right = text.substring(col + query.length - 1);
  const result = `${left}${replacement}${right}`;

  if (node.nodeValue) {
    node.nodeValue = result;
    setCaretPosition(node, col + replacement.length - 1);
  } else {
    const el = node as HTMLElement;
    el.innerText = result;
    setCaretPosition(el.firstChild, col + replacement.length - 1);
  }
}

export function getCaretPostition(el: Element): CaretPosition {
  const sel = window.getSelection();
  const row = Array.from(el.childNodes).findIndex((child) => {
    const node = child.nodeValue ? child : child.firstChild;

    return sel.anchorNode === node;
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
  const element = child.nodeValue ? child : child.firstChild;

  if (isBreakLine(element)) {
    return false;
  }

  return element.nodeValue.charAt(col - 2).trim() === '';
}
