import { nextTick } from './func';

export const isFalsyOrSpace = (value: string): boolean =>
  !value || value === ' ';

const getSelectedString = (
  textarea: HTMLTextAreaElement,
  [start, end]: number[],
) => {
  const last = start === end ? start + 1 : end;
  const text = textarea.value.substring(start, last);
  const before = textarea.value[start - 1];

  return [text, before];
};

const splitString = (value: string, [start, end]: number[]) => {
  const left = value.substring(0, start);
  const right = value.substring(end);

  return [left, right];
};

const concatReplacement = (
  textarea: HTMLTextAreaElement,
  selected: number[],
  replace: string,
) => {
  const [left, right] = splitString(textarea.value, selected);

  return left + replace + right;
};

/* eslint-disable no-param-reassign */
const focusInput = async (
  textarea: HTMLTextAreaElement,
  [start, end]: number[],
) => {
  textarea.focus();
  await nextTick(); // for the selection to work, we need to wait for the input to get updated
  textarea.selectionStart = start;
  textarea.selectionEnd = end;
};

export const getCloseWord = (
  textarea: HTMLTextAreaElement,
  selected: number[],
): [string, number] => {
  const [, end] = selected;

  let lastIndex = 0;
  const words = textarea.value.split(' ');
  const closeWord = words.find((word) => {
    const current = lastIndex + word.length + 1;

    if (current > end) return true;

    lastIndex = current;

    return false;
  });

  return [closeWord?.trimEnd() ?? '', lastIndex];
};

/**
 * Enum to describe the current cursor's state.
 * The character `|` denotes the cursor
 * @enum CursorType
 * Isolated: when the cursor is in-between spaces (ex. " | ").
 * Adjacent: when the cursor is beside any character (ex. "Test |word" or "Test| word").
 * Highlighted: when the cursor is highlighting any string (ex. "|Tes|t" or "|Test|").
 */
export enum CursorType {
  Isolated = 'isolated',
  Adjacent = 'adjacent',
  Highlighted = 'highlighted',
}

const getCursorType = (textarea: HTMLTextAreaElement, selection: number[]) => {
  const [highlighted, before] = getSelectedString(textarea, selection);
  const [start, end] = selection;

  if (isFalsyOrSpace(highlighted) && isFalsyOrSpace(before)) {
    return CursorType.Isolated;
  }

  return start !== end ? CursorType.Highlighted : CursorType.Adjacent;
};

export interface GetReplacement {
  addSpaceBeforeHighlighted?: boolean;
  offset?: number[];
  replacement: string;
}

interface GetReplacementOptionalProps {
  word?: string;
  characterBeforeHighlight?: string;
}

export type GetReplacementFn = (
  type: CursorType,
  word?: GetReplacementOptionalProps,
) => GetReplacement;

export const replaceWord = async (
  textarea: HTMLTextAreaElement,
  selection: number[],
  getReplacement: GetReplacementFn,
  onReplaced: (result: string) => void,
): Promise<string> => {
  const [highlighted, before] = getSelectedString(textarea, selection);
  const [start, end] = selection;
  const type = getCursorType(textarea, selection);

  if (type === CursorType.Isolated) {
    const { replacement, offset: [startOffset] = [0] } = getReplacement(
      CursorType.Isolated,
    );
    const result = concatReplacement(textarea, selection, replacement);
    const offset = replacement.length - startOffset;
    const index = start + offset;
    onReplaced(result);
    await focusInput(textarea, [index, index]);
    return result;
  }

  if (type === CursorType.Highlighted) {
    const { replacement } = getReplacement(CursorType.Highlighted, {
      word: highlighted,
      characterBeforeHighlight: before,
    });
    const offset = replacement.length - highlighted.length - 1;
    const position = [start + offset, end + offset];
    const result = concatReplacement(textarea, selection, replacement);
    onReplaced(result);
    await focusInput(textarea, position);
    return result;
  }

  const [word, startIndex] = getCloseWord(textarea, selection);
  const position = [startIndex, startIndex + word.length];
  const { replacement, offset: [startOffset = 0, endOffset = 0] = [] } =
    getReplacement(CursorType.Adjacent, { word });
  const result = concatReplacement(textarea, position, replacement);
  const focusEnd = startIndex + replacement.length - endOffset;
  const focusStart = focusEnd - startOffset;
  onReplaced(result);
  await focusInput(textarea, [focusStart, focusEnd]);
  return result;
};
