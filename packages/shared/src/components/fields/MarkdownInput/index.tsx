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

const getReplacedResult = (
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

function MarkdownInput({ className }: MarkdownInputProps): ReactElement {
  const [selection, setSelection] = useState([0, 0]);
  const textareaRef = useRef<HTMLTextAreaElement>();
  const textarea = textareaRef?.current;
  const [input, setInput] = useState('');

  const onLinkClick = async () => {
    const [highlighted, before] = getSelectedString(textarea, selection);
    const [start, end] = selection;

    if (isFalsyOrSpace(highlighted) && isFalsyOrSpace(before)) {
      const text = getUrlText();
      const result = getReplacedResult(textarea, selection, text);
      const index = start + 1;
      setInput(result);
      return focusInput(textarea, [index, index]);
    }

    if (start !== end) {
      const text = getUrlText(highlighted);
      const offset = highlighted.length + urlText.length;
      const position = [start + offset, end + offset];
      const result = getReplacedResult(textarea, selection, text);
      setInput(result);
      return focusInput(textarea, position);
    }

    const [word, startIndex] = getCloseWord(textarea, selection);
    const replacePosition = [startIndex, startIndex + word.length];
    const replaceValue = getUrlText(word);
    const result = getReplacedResult(textarea, replacePosition, replaceValue);
    const focusEnd = startIndex + replaceValue.length - 1;
    const focusStart = focusEnd - urlText.length;
    setInput(result);
    return focusInput(textarea, [focusStart, focusEnd]);
  };

  const onMentionClick = () => {};

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
