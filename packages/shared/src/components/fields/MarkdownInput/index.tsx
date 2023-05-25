import React, { ReactElement, TextareaHTMLAttributes, useRef } from 'react';
import classNames from 'classnames';
import { ImageIcon, MarkdownIcon } from '../../icons';
import { Button, ButtonSize } from '../../buttons/Button';
import LinkIcon from '../../icons/Link';
import AtIcon from '../../icons/At';
import { RecommendedMentionTooltip } from '../../tooltips/RecommendedMentionTooltip';
import { useMarkdownInput, UseMarkdownInputProps } from '../../../hooks/input';
import { Loader } from '../../Loader';

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
  enableUpload,
  initialContent,
  textareaProps = {},
}: MarkdownInputProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const {
    input,
    query,
    offset,
    selected,
    callbacks,
    uploadingCount,
    uploadedCount,
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
    enableUpload,
  });

  const footerLabel = (() => {
    if (uploadingCount === 0) {
      return (
        <>
          <ImageIcon className="mr-2" />
          Attach images by dragging & dropping
        </>
      );
    }

    const content = 'Uploading in progress';
    const loader = (
      <Loader
        className="mr-2 btn-loader"
        innerClassName="before:border-t-theme-color-cabbage after:border-theme-color-cabbage"
      />
    );

    if (uploadingCount === 1) {
      return (
        <>
          {loader}
          {content}
        </>
      );
    }

    return (
      <>
        {loader}
        {`${content} (${uploadedCount}/${uploadingCount})`}
      </>
    );
  })();

  return (
    <div
      className={classNames(
        'flex flex-col bg-theme-float rounded-16',
        className,
      )}
    >
      <textarea
        {...textareaProps}
        {...callbacks}
        ref={textareaRef}
        className="m-4 bg-transparent outline-none typo-body placeholder-theme-label-quaternary"
        placeholder="Start a discussion, ask a question or write about anything that you believe would benefit the squad. (Optional)"
        value={input}
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
        {enableUpload && (
          <button
            type="button"
            className={classNames(
              'flex relative flex-row typo-callout',
              uploadingCount
                ? 'text-theme-color-cabbage'
                : 'text-theme-label-quaternary',
            )}
          >
            {footerLabel}
          </button>
        )}
        <span className="grid grid-cols-3 gap-3 ml-auto text-theme-label-tertiary">
          <Button
            type="button"
            buttonSize={ButtonSize.Small}
            icon={<LinkIcon secondary />}
            onClick={onLinkCommand}
          />
          <Button
            type="button"
            buttonSize={ButtonSize.Small}
            icon={<AtIcon />}
            onClick={onMentionCommand}
          />
          <Button
            type="button"
            buttonSize={ButtonSize.Small}
            icon={<MarkdownIcon />}
          />
        </span>
      </span>
    </div>
  );
}

export default MarkdownInput;
