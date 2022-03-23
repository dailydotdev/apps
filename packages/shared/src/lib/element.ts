export type CaretPosition = [number, number, number?];

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

export function getCaretPostition(
  textarea: HTMLTextAreaElement,
): CaretPosition {
  const start = textarea.selectionStart;
  const lines = textarea.value.substring(0, start).split('\n');
  const row = lines.length;
  const col = lines[lines.length - 1].length;

  return [col, row, start];
}

export function hasSpaceBeforeWord(
  textarea: HTMLTextAreaElement,
  [col, row]: CaretPosition,
): [boolean, string, number] {
  if (col === 0) {
    return [false, '', -1];
  }

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
