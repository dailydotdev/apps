import React, { FormEventHandler, ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import ImageIcon from '../../icons/Image';
import { Button, ButtonSize } from '../../buttons/Button';
import LinkIcon from '../../icons/Link';
import AtIcon from '../../icons/At';
import MarkdownIcon from '../../icons/Markdown';
import { nextTick } from '../../../lib/func';

interface MarkdownInputProps {
  className?: string;
}

const isFalsyOrSpace = (value: string) => !value || value === ' ';

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
  // textarea.selectionStart = start;
  textarea.focus();
  await nextTick();
  textarea.selectionStart = start;
  textarea.selectionEnd = end;
};

const getCloseWord = (
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

  return [closeWord, lastIndex];
};

const urlText = 'url';
const getUrlText = (content = '') => `[${content}](${urlText})`;

/**
 * Enum to describe the current cursor's state.
 * The character `|` denotes the cursor
 * @enum CursorType
 * Isolated: when the cursor is in-between spaces (ex. " | ").
 * Adjacent: when the cursor is beside any character (ex. "Test |word" or "Test| word").
 * Highlighted: when the cursor is highlighting any string (ex. "|Tes|t" or "|Test|").
 */
enum CursorType {
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

interface GetReplacement {
  addSpaceBeforeHighlighted?: boolean;
  offset?: number[];
  replacement: string;
}

interface GetReplacementOptionalProps {
  word?: string;
  characterBeforeHighlight?: string;
}

type GetReplacementFn = (
  type: CursorType,
  word?: GetReplacementOptionalProps,
) => GetReplacement;

const charsToBrackets = 1;
const getLinkReplacement: GetReplacementFn = (type, { word } = {}) => {
  const replacement = getUrlText(word);

  if (type === CursorType.Highlighted) {
    return { replacement };
  }

  if (type === CursorType.Adjacent) {
    return { replacement, offset: [urlText.length, 1] };
  }

  const offset = replacement.length - charsToBrackets;

  return { replacement, offset: [offset] };
};

const getMentionReplacement: GetReplacementFn = (
  type,
  { word = '', characterBeforeHighlight } = {},
) => {
  const replacement = `@${word}`;

  if (type === CursorType.Isolated) return { replacement };

  if (type === CursorType.Adjacent) {
    if (word.charAt(0) === '@') return { replacement: `${word} @` };

    return { replacement };
  }

  const hasValidCharacter = isFalsyOrSpace(characterBeforeHighlight);

  if (hasValidCharacter) {
    return { replacement };
  }

  return { replacement: ` ${replacement}` };
};

const replaceWord = async (
  textarea: HTMLTextAreaElement,
  selection: number[],
  getReplacement: GetReplacementFn,
  onReplaced: (result: string) => void,
) => {
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

function MarkdownInput({ className }: MarkdownInputProps): ReactElement {
  const [selection, setSelection] = useState([0, 0]);
  const textareaRef = useRef<HTMLTextAreaElement>();
  const textarea = textareaRef?.current;
  const [input, setInput] = useState('');

  const onLinkClick = async () => {
    await replaceWord(textarea, selection, getLinkReplacement, setInput);
  };

  const onMentionClick = async () => {
    const replaced = await replaceWord(
      textarea,
      selection,
      getMentionReplacement,
      setInput,
    );

    // TODO: use the replaced value to initialize user mentions
  };

  const onInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const target = e.currentTarget;

    if (!target) return;

    setInput(target.value);
    setSelection([target.selectionStart, target.selectionEnd]);
  };

  return (
    <div
      className={classNames(
        'flex flex-col bg-theme-float rounded-16',
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        className="m-4 bg-transparent outline-none typo-body placeholder-theme-label-quaternary"
        placeholder="Start a discussion, ask a question or write about anything that you believe would benefit the squad. (Optional)"
        value={input}
        onInput={onInput}
        onBlur={(e) =>
          setSelection([e.target.selectionStart, e.target.selectionEnd])
        }
        rows={10}
      />
      <span className="flex flex-row items-center p-3 px-4 border-t border-theme-divider-tertiary">
        <label
          htmlFor="upload"
          className="flex relative flex-row typo-callout text-theme-label-quaternary"
        >
          <input
            className="hidden absolute inset-0"
            type="file"
            name="upload"
          />
          <ImageIcon className="mr-2" />
          Attach images by dragging & dropping
        </label>
        <span className="grid grid-cols-3 gap-3 ml-auto text-theme-label-secondary">
          <Button
            buttonSize={ButtonSize.Small}
            icon={<LinkIcon />}
            onClick={onLinkClick}
          />
          <Button
            buttonSize={ButtonSize.Small}
            icon={<AtIcon />}
            onClick={onMentionClick}
          />
          <Button buttonSize={ButtonSize.Small} icon={<MarkdownIcon />} />
        </span>
      </span>
    </div>
  );
}

export default MarkdownInput;
