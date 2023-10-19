import { MutableRefObject } from 'react';
import { nextTick } from './func';

export const isFalsyOrSpace = (value: string): boolean =>
  !value || value === ' ' || value === '\n';

const getSelectedString = (textarea: HTMLTextAreaElement) => {
  const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
  const last = start === end ? start + 1 : end;
  const text = textarea.value.substring(start, last);
  const trailing = textarea.value[start - 1];
  const leading = textarea.value[start - 1];

  return [text, trailing, leading];
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
export const focusInput = async (
  textarea: HTMLTextAreaElement,
  [start, end]: number[],
): Promise<void> => {
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
  const index = textarea.value.substring(0, end).split('\n').length - 1;
  const lines = textarea.value.split('\n');
  const line = lines[index];
  const preLines = lines.slice(0, index).join('\n');
  const offset = index === 0 ? 0 : 1;
  const base = end - preLines.length - offset;
  let lastIndex = 0;
  let startIndex = 0;

  const found = line.split(' ').find((word) => {
    startIndex = lastIndex;
    const current = lastIndex + word.length;

    if (current >= base) {
      return true;
    }

    lastIndex = current + 1;

    return false;
  });

  return [found ?? '', preLines.length + startIndex + offset];
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

export const getCursorType = (textarea: HTMLTextAreaElement): CursorType => {
  const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
  const [highlighted, trailing] = getSelectedString(textarea);

  if (isFalsyOrSpace(highlighted) && isFalsyOrSpace(trailing)) {
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
  leadingChar?: string;
}

interface Replacement {
  result: string;
  position: number[];
  replacement: string;
}

type TypeReplacementFn = (getReplacement: GetReplacementFn) => Replacement;

type ReplacedFn = (result: string) => void;

export type GetReplacementFn = (
  type: CursorType,
  props: GetReplacementOptionalProps,
) => GetReplacement;

export const getTemporaryUploadString = (filename: string): string =>
  `![${filename}]()`;

export class TextareaCommand {
  private textareaRef: MutableRefObject<HTMLTextAreaElement>;

  constructor(textareaRef: MutableRefObject<HTMLTextAreaElement>) {
    this.textareaRef = textareaRef;
  }

  get textarea(): HTMLTextAreaElement {
    return this.textareaRef.current;
  }

  private getIsolatedReplacement: TypeReplacementFn = (getReplacement) => {
    const start = this.textarea.selectionStart;
    const selection = [start, start];
    const { replacement, offset } = getReplacement(CursorType.Isolated, {
      word: '',
      selection,
      trailingChar: this.textarea.value[start - 1],
      leadingChar: this.textarea.value[start + 1],
    });
    const result = concatReplacement(this.textarea, selection, replacement);
    const index = start + replacement.length;
    return { result, position: offset ?? [index, index], replacement };
  };

  private getAdjacentReplacement: TypeReplacementFn = (getReplacement) => {
    const selection = [
      this.textarea.selectionStart,
      this.textarea.selectionEnd,
    ];
    const [word, start] = getCloseWord(this.textarea, selection);
    const position = [start, start + word.length];
    const { replacement, offset } = getReplacement(CursorType.Adjacent, {
      word,
      selection: position,
    });
    const defaultOffset = start + replacement.length;
    const result = concatReplacement(this.textarea, position, replacement);
    const finalPosition = offset ?? [defaultOffset, defaultOffset];
    return { result, position: finalPosition, replacement };
  };

  private getHighlightedReplacement: TypeReplacementFn = (getReplacement) => {
    const start = this.textarea.selectionStart;
    const selection = [start, this.textarea.selectionEnd];
    const [highlighted, trailingChar, leadingChar] = getSelectedString(
      this.textarea,
    );
    const { replacement, offset } = getReplacement(CursorType.Highlighted, {
      word: highlighted,
      trailingChar,
      leadingChar,
      selection,
    });
    const result = concatReplacement(this.textarea, selection, replacement);
    const end = start + replacement.length;
    return { result, position: offset ?? [end, end], replacement };
  };

  private getResult(getReplacement: GetReplacementFn, forcedType?: CursorType) {
    const type = forcedType ?? getCursorType(this.textarea);

    if (type === CursorType.Isolated) {
      return this.getIsolatedReplacement(getReplacement);
    }

    if (type === CursorType.Highlighted) {
      return this.getHighlightedReplacement(getReplacement);
    }

    return this.getAdjacentReplacement(getReplacement);
  }

  async replaceWord(
    getReplacement: GetReplacementFn,
    onReplaced: ReplacedFn,
    forcedType?: CursorType,
  ): Promise<Replacement> {
    const { result, position, replacement } = this.getResult(
      getReplacement,
      forcedType,
    );
    onReplaced(result);
    await focusInput(this.textarea, position);
    return { result, position, replacement };
  }

  onReplaceUpload(url: string, filename: string): string {
    const temporary = getTemporaryUploadString(filename);
    const start = this.textarea.value.indexOf(temporary);
    const file = filename.split('.');
    file.pop();
    const position = [start, start + temporary.length];
    const alt = file.join('.');
    const replacement = `![${alt}](${url})`;

    return concatReplacement(this.textarea, position, replacement);
  }
}
