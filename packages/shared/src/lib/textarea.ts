import { isNullOrUndefined, nextTick } from './func';

export const isFalsyOrSpace = (value: string): boolean =>
  !value || value === ' ';

const getSelectedString = (textarea: HTMLTextAreaElement) => {
  const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
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

const getCursorType = (textarea: HTMLTextAreaElement) => {
  const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
  const [highlighted, before] = getSelectedString(textarea);

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
  trailingChar?: string;
}

type TypeReplacementFn = (
  textarea: HTMLTextAreaElement,
  getReplacement: GetReplacementFn,
) => [string, number[]];

const getAdjacentReplacement: TypeReplacementFn = (
  textarea,
  getReplacement,
): [string, number[]] => {
  const [word, startIndex] = getCloseWord(textarea, [
    textarea.selectionStart,
    textarea.selectionEnd,
  ]);
  const position = [startIndex, startIndex + word.length];
  const { replacement, offset } = getReplacement(CursorType.Adjacent, { word });
  const defaultOffset = startIndex + replacement.length;
  const result = concatReplacement(textarea, position, replacement);
  return [result, offset ?? [defaultOffset, defaultOffset]];
};

const getHighlightedReplacement: TypeReplacementFn = (
  textarea,
  getReplacement,
) => {
  const start = textarea.selectionStart;
  const selection = [start, textarea.selectionEnd];
  const [highlighted, before] = getSelectedString(textarea);
  const { replacement, offset } = getReplacement(CursorType.Highlighted, {
    word: highlighted,
    trailingChar: before,
  });
  const result = concatReplacement(textarea, selection, replacement);
  return [result, offset ?? [start, start + replacement.length]];
};

const getIsolatedReplacement: TypeReplacementFn = (
  textarea,
  getReplacement,
) => {
  const start = textarea.selectionStart;
  const selection = [start, textarea.selectionEnd];
  const { replacement, offset } = getReplacement(CursorType.Isolated);
  const result = concatReplacement(textarea, selection, replacement);
  const index = start + replacement.length;
  return [result, offset ?? [index, index]];
};

export type GetReplacementFn = (
  type: CursorType,
  word?: GetReplacementOptionalProps,
) => GetReplacement;

export const replaceWord = async (
  textarea: HTMLTextAreaElement,
  getReplacement: GetReplacementFn,
  onReplaced: (result: string) => void,
): Promise<string> => {
  const type = getCursorType(textarea);

  if (type === CursorType.Isolated) {
    const [result, position] = getIsolatedReplacement(textarea, getReplacement);
    onReplaced(result);
    await focusInput(textarea, position);
    return result;
  }

  if (type === CursorType.Highlighted) {
    const [result, position] = getHighlightedReplacement(
      textarea,
      getReplacement,
    );
    onReplaced(result);
    await focusInput(textarea, position);
    return result;
  }

  const [result, position] = getAdjacentReplacement(textarea, getReplacement);
  onReplaced(result);
  await focusInput(textarea, position);
  return result;
};
