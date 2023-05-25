import React, { ReactElement, TextareaHTMLAttributes, useRef } from 'react';
import classNames from 'classnames';
import { ImageIcon, MarkdownIcon } from '../../icons';
import { Button, ButtonSize } from '../../buttons/Button';
import LinkIcon from '../../icons/Link';
import AtIcon from '../../icons/At';
import { RecommendedMentionTooltip } from '../../tooltips/RecommendedMentionTooltip';
import {
  useMarkdownInput,
  UseMarkdownInputProps,
} from '../../../hooks/input/useMarkdownInput';

interface MarkdownInputProps
  extends Omit<UseMarkdownInputProps, 'textareaRef'> {
  className?: string;
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
  >;
}

function MarkdownInput({
  className,
  postId,
  sourceId,
  onSubmit,
  initialContent,
  textareaProps = {},
}: MarkdownInputProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const {
    onInput,
    input,
    query,
    offset,
    selected,
    onKeyUp,
    onKeyDown,
    onLinkCommand,
    onMentionCommand,
    onApplyMention,
    mentions,
  } = useMarkdownInput({
    postId,
    sourceId,
    initialContent,
    onSubmit,
    textareaRef,
  });

  return (
    <div
      className={classNames(
        'flex flex-col bg-theme-float rounded-16',
        className,
      )}
    >
      <textarea
        {...textareaProps}
        ref={textareaRef}
        className="m-4 bg-transparent outline-none typo-body placeholder-theme-label-quaternary"
        placeholder="Start a discussion, ask a question or write about anything that you believe would benefit the squad. (Optional)"
        value={input}
        onInput={onInput}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        rows={10}
      />
      <RecommendedMentionTooltip
        elementRef={textareaRef}
        offset={offset}
        mentions={mentions}
        selected={selected}
        query={query}
        onMentionClick={onApplyMention}
      />
      <span className="flex flex-row items-center p-3 px-4 border-t border-theme-divider-tertiary">
        <button
          type="button"
          className="flex relative flex-row typo-callout text-theme-label-quaternary"
        >
          <ImageIcon className="mr-2" />
          Attach images by dragging & dropping
        </button>
        <span className="grid grid-cols-3 gap-3 ml-auto text-theme-label-tertiary">
          <Button
            buttonSize={ButtonSize.Small}
            icon={<LinkIcon secondary />}
            onClick={onLinkCommand}
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
