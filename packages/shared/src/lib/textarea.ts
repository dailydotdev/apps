import { nextTick } from './func';

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
  word: string;
  selection: number[];
  trailingChar?: string;
}

type TypeReplacementFn = (
  getReplacement: GetReplacementFn,
) => [string, number[]];

export type GetReplacementFn = (
  type: CursorType,
  props: GetReplacementOptionalProps,
) => GetReplacement;

export class TextareaCommand {
  private type: CursorType;

  private textarea: HTMLTextAreaElement;

  constructor(textarea: HTMLTextAreaElement, type?: CursorType) {
    this.type = type ?? getCursorType(textarea);
    this.textarea = textarea;
  }

  private getIsolatedReplacement: TypeReplacementFn = (getReplacement) => {
    const start = this.textarea.selectionStart;
    const selection = [start, this.textarea.selectionEnd];
    const { replacement, offset } = getReplacement(CursorType.Isolated, {
      word: '',
      selection,
    });
    const result = concatReplacement(this.textarea, selection, replacement);
    const index = start + replacement.length;
    return [result, offset ?? [index, index]];
  };

  private getAdjacentReplacement: TypeReplacementFn = (
    getReplacement,
  ): [string, number[]] => {
    const selection = [
      this.textarea.selectionStart,
      this.textarea.selectionEnd,
    ];
    const [word, startIndex] = getCloseWord(this.textarea, selection);
    const position = [startIndex, startIndex + word.length];
    const { replacement, offset } = getReplacement(CursorType.Adjacent, {
      word,
      selection: [startIndex, startIndex + word.length],
    });
    const defaultOffset = startIndex + replacement.length;
    const result = concatReplacement(this.textarea, position, replacement);
    return [result, offset ?? [defaultOffset, defaultOffset]];
  };

  private getHighlightedReplacement: TypeReplacementFn = (getReplacement) => {
    const start = this.textarea.selectionStart;
    const selection = [start, this.textarea.selectionEnd];
    const [highlighted, before] = getSelectedString(this.textarea);
    const { replacement, offset } = getReplacement(CursorType.Highlighted, {
      word: highlighted,
      trailingChar: before,
      selection,
    });
    const result = concatReplacement(this.textarea, selection, replacement);
    const end = start + replacement.length;
    return [result, offset ?? [end, end]];
  };

  async replaceWord(
    getReplacement: GetReplacementFn,
    onReplaced: (result: string) => void,
  ): Promise<string> {
    if (this.type === CursorType.Isolated) {
      const [result, position] = this.getIsolatedReplacement(getReplacement);
      onReplaced(result);
      await focusInput(this.textarea, position);
      return result;
    }

    if (this.type === CursorType.Highlighted) {
      const [result, position] = this.getHighlightedReplacement(getReplacement);
      onReplaced(result);
      await focusInput(this.textarea, position);
      return result;
    }

    const [result, position] = this.getAdjacentReplacement(getReplacement);
    onReplaced(result);
    await focusInput(this.textarea, position);
    return result;
  }
}
