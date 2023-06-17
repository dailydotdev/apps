import React, {
  ChangeEventHandler,
  forwardRef,
  MouseEventHandler,
  MutableRefObject,
  ReactElement,
  ReactNode,
  TextareaHTMLAttributes,
  useImperativeHandle,
  useRef,
} from 'react';
import classNames from 'classnames';
import { MarkdownIcon } from '../../icons';
import { Button, ButtonSize } from '../../buttons/Button';
import LinkIcon from '../../icons/Link';
import AtIcon from '../../icons/At';
import { RecommendedMentionTooltip } from '../../tooltips/RecommendedMentionTooltip';
import {
  UseMarkdownInput,
  useMarkdownInput,
  UseMarkdownInputProps,
} from '../../../hooks/input';
import { ACCEPTED_TYPES } from '../ImageInput';
import { MarkdownUploadLabel } from './MarkdownUploadLabel';
import { markdownGuide } from '../../../lib/constants';
import useSidebarRendered from '../../../hooks/useSidebarRendered';
import ConditionalWrapper from '../../ConditionalWrapper';
import TabContainer, { Tab } from '../../tabs/TabContainer';
import MarkdownPreview from '../MarkdownPreview';
import { isNullOrUndefined } from '../../../lib/func';
import { SavingLabel } from './SavingLabel';
import { ProfilePicture } from '../../ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';

interface MarkdownInputProps
  extends Omit<UseMarkdownInputProps, 'textareaRef'> {
  className?: string;
  footer?: ReactNode;
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
  >;
  showMarkdownGuide?: boolean;
  showUserAvatar?: boolean;
  allowPreview?: boolean;
  isUpdatingDraft?: boolean;
}

export interface MarkdownRef
  extends Pick<UseMarkdownInput, 'onMentionCommand'> {
  textareaRef: MutableRefObject<HTMLTextAreaElement>;
}

function MarkdownInput(
  {
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
    showUserAvatar,
    footer,
  }: MarkdownInputProps,
  ref: MutableRefObject<MarkdownRef>,
): ReactElement {
  const { user } = useAuthContext();
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

  useImperativeHandle(ref, () => ({ textareaRef, onMentionCommand }));

  const onUpload: ChangeEventHandler<HTMLInputElement> = (e) =>
    onUploadCommand(e.currentTarget.files);

  const onInputClick: MouseEventHandler<HTMLTextAreaElement> = () => {
    if (checkMention) checkMention();
  };

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
        <ConditionalWrapper
          condition={showUserAvatar}
          wrapper={(component) => (
            <span className="flex flex-row w-full">
              <ProfilePicture size="large" className="mt-3 ml-3" user={user} />
              {component}
            </span>
          )}
        >
          <textarea
            rows={11}
            placeholder="Start a discussion, ask a question or write about anything that you believe would benefit the squad. (Optional)"
            {...textareaProps}
            {...callbacks}
            ref={textareaRef}
            className={classNames(
              'flex flex-1 bg-transparent outline-none typo-body placeholder-theme-label-quaternary',
              showUserAvatar ? 'm-3' : 'm-4',
            )}
            value={input}
            onClick={onInputClick}
            onDragOver={(e) => e.preventDefault()} // for better experience and stop opening the file with browser
          />
        </ConditionalWrapper>
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

export default forwardRef(MarkdownInput);
