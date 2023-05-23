import React, { ReactElement, useRef } from 'react';
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
  onSubmit: React.KeyboardEventHandler<HTMLTextAreaElement>;
  className?: string;
  sourceId?: string;
  postId: string; // in the future, it would be ideal without the need of post id (possible but would require additional BE work).
}

function MarkdownInput({
  className,
  postId,
  sourceId,
  onSubmit,
  initialContent,
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
