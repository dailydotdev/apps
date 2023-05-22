import React, { FormEventHandler, ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from 'react-query';
import ImageIcon from '../../icons/Image';
import { Button, ButtonSize } from '../../buttons/Button';
import LinkIcon from '../../icons/Link';
import AtIcon from '../../icons/At';
import MarkdownIcon from '../../icons/Markdown';
import { isNullOrUndefined, nextTick } from '../../../lib/func';
import {
  RECOMMEND_MENTIONS_QUERY,
  RecommendedMentionsData,
} from '../../../graphql/comments';
import { graphqlUrl } from '../../../lib/config';
import { useRequestProtocol } from '../../../hooks/useRequestProtocol';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  ArrowKey,
  arrowKeys,
  CaretOffset,
  getCaretOffset,
  KeyboardCommand,
  Y_AXIS_KEYS,
} from '../../../lib/element';
import { RecommendedMentionTooltip } from '../../tooltips/RecommendedMentionTooltip';

interface MarkdownInputProps {
  onSubmit: React.KeyboardEventHandler<HTMLTextAreaElement>;
  className?: string;
  sourceId?: string;
  postId: string; // in the future, it would be ideal without the need of post id to be reusable
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

  return [closeWord ?? '', lastIndex];
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

function MarkdownInput({
  className,
  postId,
  sourceId,
  onSubmit,
}: MarkdownInputProps): ReactElement {
  const [selection, setSelection] = useState([0, 0]);
  const textareaRef = useRef<HTMLTextAreaElement>();
  const textarea = textareaRef?.current;
  const [input, setInput] = useState('');
  const [query, setQuery] = useState<string>(undefined);
  const [offset, setOffset] = useState([0, 0]);
  const [selected, setSelected] = useState(0);
  const { requestMethod } = useRequestProtocol();
  const key = ['user', query, postId, sourceId];
  const { user } = useAuthContext();
  const { data = { recommendedMentions: [] } } =
    useQuery<RecommendedMentionsData>(
      key,
      () =>
        requestMethod(
          graphqlUrl,
          RECOMMEND_MENTIONS_QUERY,
          { postId, query, sourceId },
          { requestKey: JSON.stringify(key) },
        ),
      {
        enabled: !!user && typeof query !== 'undefined',
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    );
  const mentions = data.recommendedMentions;

  const onLinkClick = async () => {
    await replaceWord(textarea, selection, getLinkReplacement, setInput);
  };

  const onMentionCommand = async () => {
    const replaced = await replaceWord(
      textarea,
      selection,
      getMentionReplacement,
      setInput,
    );

    const mention = replaced.trim().substring(1);
    setQuery(mention);
  };

  const updateQuery = (value: string) => {
    if (value === query) return;

    if (isNullOrUndefined(query) && !isNullOrUndefined(value)) {
      setOffset(getCaretOffset(textarea));
    }

    setQuery(value);
  };

  const onApplyMention = async (username: string) => {
    const getUsernameReplacement = () => ({
      type: CursorType.Adjacent,
      replacement: `@${username} `,
    });
    await replaceWord(textarea, selection, getUsernameReplacement, setInput);
    updateQuery(undefined);
  };

  const checkMention = (position?: number[]) => {
    const placement = position ?? selection;
    const [word] = getCloseWord(textarea, placement);

    if (isNullOrUndefined(query)) {
      if (word.charAt(0) === '@') updateQuery(word.substring(1) ?? '');
      return;
    }

    const handleRegex = new RegExp(/^@?([\w-]){1,39}$/i);
    const mention = word.substring(1);
    const isValid = word.charAt(0) === '@' && handleRegex.test(mention);
    updateQuery(isValid ? mention : undefined);
  };

  const onKeyUp: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (!arrowKeys.includes(e.key as ArrowKey)) return;

    const arrowKey = e.key as ArrowKey;

    if (Y_AXIS_KEYS.includes(e.key as ArrowKey)) {
      if (arrowKey === ArrowKey.Up) {
        if (selected > 0) setSelected(selected - 1);
      } else if (selected < mentions.length - 1) {
        setSelected(selected + 1);
      }
    }

    const { selectionStart, selectionEnd } = e.currentTarget;
    const position = [selectionStart, selectionEnd];
    checkMention(position);
    setSelection(position);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = async (
    e,
  ) => {
    const isSpecialKey = e.ctrlKey || e.metaKey;
    if (isSpecialKey && e.key === KeyboardCommand.Enter && input?.length) {
      return onSubmit(e);
    }

    const isNavigatingPopup =
      e.key === KeyboardCommand.Enter ||
      Y_AXIS_KEYS.includes(e.key as ArrowKey);

    if (!isNavigatingPopup) {
      return e.stopPropagation(); // to stop app navigation
    }

    const mention = mentions[selected];

    if (mention && e.key === KeyboardCommand.Enter) {
      await onApplyMention(mention.username);
    }

    return e.preventDefault(); // to stop the cursor from moving if mention popup is shown
  };

  const onInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const target = e.currentTarget;

    if (!target) return;

    const { selectionStart, selectionEnd } = target;
    const position = [selectionStart, selectionEnd];
    setInput(target.value);
    setSelection(position);
    checkMention(position);
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
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        onBlur={(e) =>
          setSelection([e.target.selectionStart, e.target.selectionEnd])
        }
        rows={10}
      />
      <RecommendedMentionTooltip
        elementRef={textareaRef}
        offset={offset as CaretOffset}
        mentions={data?.recommendedMentions}
        selected={selected}
        query={query}
        onMentionClick={onApplyMention}
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
            onClick={onMentionCommand}
          />
          <Button buttonSize={ButtonSize.Small} icon={<MarkdownIcon />} />
        </span>
      </span>
    </div>
  );
}

export default MarkdownInput;
