import React, {
  ChangeEventHandler,
  ReactElement,
  TextareaHTMLAttributes,
  useRef,
} from 'react';
import classNames from 'classnames';
import { MarkdownIcon } from '../../icons';
import { Button, ButtonSize } from '../../buttons/Button';
import LinkIcon from '../../icons/Link';
import AtIcon from '../../icons/At';
import { RecommendedMentionTooltip } from '../../tooltips/RecommendedMentionTooltip';
import { useMarkdownInput, UseMarkdownInputProps } from '../../../hooks/input';
import { ACCEPTED_TYPES } from '../ImageInput';
import { MarkdownUploadLabel } from './MarkdownUploadLabel';

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
  onValueUpdate,
  enableUpload,
  initialContent,
  textareaProps = {},
}: MarkdownInputProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const uploadRef = useRef<HTMLInputElement>();
  const {
    input,
    query,
    offset,
    selected,
    callbacks,
    uploadingCount,
    uploadedCount,
    onLinkCommand,
    onUploadCommand,
    onMentionCommand,
    onApplyMention,
    mentions,
  } = useMarkdownInput({
    postId,
    sourceId,
    initialContent,
    onSubmit,
    textareaRef,
    onValueUpdate,
    enableUpload,
  });

  const onUpload: ChangeEventHandler<HTMLInputElement> = (e) =>
    onUploadCommand(e.currentTarget.files);

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
        onDragOver={(e) => e.preventDefault()} // for better experience and stop opening the file with browser
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
            onClick={() => uploadRef?.current?.click()}
          >
            <MarkdownUploadLabel
              uploadingCount={uploadingCount}
              uploadedCount={uploadedCount}
            />
            <input
              type="file"
              className="hidden"
              name="content_upload"
              ref={uploadRef}
              accept={ACCEPTED_TYPES}
              onInput={onUpload}
            />
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
