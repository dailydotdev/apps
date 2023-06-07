import React, {
  ChangeEventHandler,
  ReactElement,
  ReactNode,
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
import { markdownGuide } from '../../../lib/constants';
import useSidebarRendered from '../../../hooks/useSidebarRendered';
import ConditionalWrapper from '../../ConditionalWrapper';
import TabContainer, { Tab } from '../../tabs/TabContainer';
import MarkdownPreview from '../MarkdownPreview';
import { isNullOrUndefined } from '../../../lib/func';
import { SavingLabel } from './SavingLabel';

interface MarkdownInputProps
  extends Omit<UseMarkdownInputProps, 'textareaRef'> {
  className?: string;
  shouldShowFooter?: boolean;
  footer?: ReactNode;
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
  >;
  showMarkdownGuide?: boolean;
  allowPreview?: boolean;
  isUpdatingDraft?: boolean;
}

function MarkdownInput({
  className,
  postId,
  sourceId,
  onSubmit,
  onValueUpdate,
  initialContent,
  textareaProps = {},
  enabledCommand,
  showMarkdownGuide = true,
  allowPreview = true,
  isUpdatingDraft,
  shouldShowFooter = true,
  footer,
}: MarkdownInputProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();
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
    onCloseMention,
    checkMention,
    mentions,
  } = useMarkdownInput({
    postId,
    sourceId,
    initialContent,
    onSubmit,
    textareaRef,
    onValueUpdate,
    enabledCommand,
  });

  const onUpload: ChangeEventHandler<HTMLInputElement> = (e) =>
    onUploadCommand(e.currentTarget.files);

  return (
    <div
      className={classNames(
        'relative flex flex-col bg-theme-float rounded-16',
        className,
      )}
    >
      {!isNullOrUndefined(isUpdatingDraft) && (
        <SavingLabel
          className="absolute top-3 right-3"
          isUpdating={isUpdatingDraft}
          isUptoDate={initialContent === input}
        />
      )}
      <ConditionalWrapper
        condition={allowPreview}
        wrapper={(children) => (
          <TabContainer
            shouldMountInactive={false}
            className={{ header: 'px-1', container: 'min-h-[20.5rem]' }}
            tabListProps={{ className: { indicator: '!w-6' } }}
          >
            <Tab label="Write">{children}</Tab>
            <Tab label="Preview" className="p-4">
              <MarkdownPreview input={input} sourceId={sourceId} />
            </Tab>
          </TabContainer>
        )}
      >
        <textarea
          {...textareaProps}
          {...callbacks}
          ref={textareaRef}
          className="m-4 bg-transparent outline-none typo-body placeholder-theme-label-quaternary"
          placeholder="Start a discussion, ask a question or write about anything that you believe would benefit the squad. (Optional)"
          value={input}
          onClick={() => checkMention && checkMention()}
          onDragOver={(e) => e.preventDefault()} // for better experience and stop opening the file with browser
          rows={11}
        />
      </ConditionalWrapper>
      <RecommendedMentionTooltip
        elementRef={textareaRef}
        offset={offset}
        mentions={mentions}
        selected={selected}
        query={query}
        onMentionClick={onApplyMention}
        onClickOutside={onCloseMention}
      />
      {footer ?? (
        <span className="flex flex-row gap-3 items-center p-3 px-4 border-t border-theme-divider-tertiary text-theme-label-tertiary">
          {!!onUploadCommand && (
            <button
              type="button"
              className={classNames(
                'flex relative flex-row gap-2 typo-callout',
                uploadingCount && 'text-theme-color-cabbage',
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
          <ConditionalWrapper
            condition={sidebarRendered}
            wrapper={(children) => (
              <span className="grid grid-cols-3 gap-3 ml-auto">{children}</span>
            )}
          >
            {!!onLinkCommand && (
              <Button
                type="button"
                buttonSize={ButtonSize.XSmall}
                icon={<LinkIcon secondary />}
                onClick={onLinkCommand}
              />
            )}
            {!!onMentionCommand && (
              <Button
                type="button"
                buttonSize={ButtonSize.XSmall}
                icon={<AtIcon />}
                onClick={onMentionCommand}
              />
            )}
            {showMarkdownGuide && (
              <Button
                type="button"
                buttonSize={ButtonSize.XSmall}
                icon={<MarkdownIcon />}
                tag="a"
                target="_blank"
                rel="noopener noreferrer"
                href={markdownGuide}
              />
            )}
          </ConditionalWrapper>
        </span>
      )}
    </div>
  );
}

export default MarkdownInput;
