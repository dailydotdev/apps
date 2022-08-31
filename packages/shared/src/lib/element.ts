import classNames from 'classnames';

type Column = number;
type Row = number;

export type CaretOffset = [number, number];
export type CaretPosition = [Column, Row];

export function getCaretPostition(
  textarea: HTMLTextAreaElement,
): CaretPosition {
  if (textarea.selectionStart !== textarea.selectionEnd) {
    return [0, 0];
  }

  const start = textarea.selectionStart;
  const lines = textarea.value.substring(0, start).split('\n');
  const row = lines.length;
  const col = lines[lines.length - 1].length;

  return [col, row];
}

export const getCaretOffset = (textarea: HTMLTextAreaElement): CaretOffset => {
  const left = document.createElement('span');
  const right = document.createElement('span');
  const div = document.createElement('div');

  left.innerText = textarea.value.substring(0, textarea.selectionStart);
  right.innerText = textarea.value.substring(textarea.selectionStart);

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

export function getWord(
  textarea: HTMLTextAreaElement,
  [col, row]: CaretPosition,
): string {
  const line = textarea.value.split('\n')[row - 1];
  const end = getEndIndex(line, col);

  return line.substring(col, end);
}

export function replaceWord(
  textarea: HTMLTextAreaElement,
  [col, row]: CaretPosition,
  query: string,
  replacement: string,
): void {
  const result = textarea.value.split('\n').map((line, index) => {
    if (index !== row - 1) {
      return line;
    }

    const left = line.substring(0, col - 1);
    const right = line.substring(col + query.length - 1);

    return `${left}${replacement} ${right}`;
  });

  // eslint-disable-next-line no-param-reassign
  textarea.value = result.join('\n');
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
  textarea: HTMLTextAreaElement,
  [col, row]: CaretPosition,
): [boolean, string, number] {
  let position = 0;
  const line = textarea.value.split('\n')[row - 1];
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
