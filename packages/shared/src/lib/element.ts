export const isBreakLine = (node: Node): boolean => !node.nodeValue;

export type CaretPosition = [number, number];

const getNode = (el: Node, query: string): [Node, CaretPosition] => {
  const index = Array.from(el.childNodes).findIndex((child) => {
    const element = child.nodeValue ? child : child.childNodes[0];

    if (isBreakLine(element)) {
      return false;
    }

    const strings = element.nodeValue.split(' ');

    return strings.some((string) => string === query);
  });
  const child = el.childNodes[index];
  const node = child.nodeValue ? child : child.childNodes[0];
  const start = node.nodeValue.indexOf(query);

  return [node, [start, index]];
};

export function setCaretPosition(el: Node, col: number): void {
  const range = document.createRange();
  const sel = window.getSelection();

  range.setStart(el, col);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

export function setReplacementCaretPosition(
  el: Node,
  replacement: string,
): void {
  const range = document.createRange();
  const sel = window.getSelection();
  const [node, [x]] = getNode(el, replacement);

  range.setStart(node, x + replacement.length);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

export function getCaretPostition(el: Element): CaretPosition {
  const sel = window.getSelection();
  const row = Array.from(el.childNodes).findIndex((child) => {
    const element = child.nodeValue ? child : child.childNodes[0];

    return sel.anchorNode === element;
  });
  return [sel.anchorOffset, row === -1 ? 0 : row];
}
