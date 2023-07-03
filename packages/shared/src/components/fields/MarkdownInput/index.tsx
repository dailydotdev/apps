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
import { ImageIcon, MarkdownIcon } from '../../icons';
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
import { Loader } from '../../Loader';
import { Divider } from '../../utilities';
import { usePopupSelector } from '../../../hooks/usePopupSelector';

interface ClassName {
  container?: string;
  tab?: string;
  input?: string;
  profile?: string;
}

interface MarkdownInputProps
  extends Omit<UseMarkdownInputProps, 'textareaRef'> {
  className?: ClassName;
  footer?: ReactNode;
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
  >;
  submitCopy?: string;
  showMarkdownGuide?: boolean;
  showUserAvatar?: boolean;
  allowPreview?: boolean;
  isUpdatingDraft?: boolean;
  timeline?: ReactNode;
  isLoading?: boolean;
}

export interface MarkdownRef
  extends Pick<UseMarkdownInput, 'onMentionCommand'> {
  textareaRef: MutableRefObject<HTMLTextAreaElement>;
}

function MarkdownInput(
  {
    className = {},
    postId,
    sourceId,
    onSubmit,
    onValueUpdate,
    initialContent,
    textareaProps = {},
    enabledCommand,
    submitCopy,
    showMarkdownGuide = true,
    allowPreview = true,
    isUpdatingDraft,
    showUserAvatar,
    footer,
    timeline,
    isLoading,
  }: MarkdownInputProps,
  ref: MutableRefObject<MarkdownRef>,
): ReactElement {
  const shouldShowSubmit = !!submitCopy;
  const { user } = useAuthContext();
  const { parentSelector } = usePopupSelector();
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

  const actionButtonSizes = shouldShowSubmit
    ? ButtonSize.Small
    : ButtonSize.XSmall;

  const icon =
    uploadingCount === 0 ? (
      <ImageIcon />
    ) : (
      <Loader
        className="btn-loader"
        innerClassName="before:border-t-theme-color-cabbage after:border-theme-color-cabbage"
      />
    );

  const onInputClick: MouseEventHandler<HTMLTextAreaElement> = () => {
    if (checkMention) checkMention();
  };

  return (
    <div
      className={classNames(
        'relative flex flex-col bg-theme-float rounded-16',
        className?.container,
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
            className={{
              header: 'px-1',
              container: classNames('min-h-[20.5rem]', className?.tab),
            }}
            tabListProps={{ className: { indicator: '!w-6' } }}
          >
            <Tab label="Write">{children}</Tab>
            <Tab label="Preview" className="p-4">
              <MarkdownPreview
                input={input}
                sourceId={sourceId}
                parentSelector={parentSelector}
              />
            </Tab>
          </TabContainer>
        )}
      >
        <ConditionalWrapper
          condition={!!timeline}
          wrapper={(component) => (
            <span className="flex relative flex-col">
              <Divider
                className="absolute left-8 !h-10 !bg-theme-divider-tertiary"
                vertical
              />
              {timeline}

              {component}
            </span>
          )}
        >
          <ConditionalWrapper
            condition={showUserAvatar}
            wrapper={(component) => (
              <span className="flex flex-row w-full">
                <ProfilePicture
                  size="large"
                  className={classNames('mt-3 ml-3', className?.profile)}
                  user={user}
                  nativeLazyLoading
                />
                {component}
              </span>
            )}
          >
            <span className="flex relative flex-1">
              <textarea
                rows={11}
                placeholder="Start a discussion, ask a question or write about anything that you believe would benefit the squad. (Optional)"
                {...textareaProps}
                {...callbacks}
                ref={textareaRef}
                className={classNames(
                  'flex flex-1 bg-transparent outline-none typo-body placeholder-theme-label-quaternary max-h-textarea',
                  showUserAvatar ? 'm-3' : 'm-4',
                  className?.input,
                )}
                value={input}
                onClick={onInputClick}
                onDragOver={(e) => e.preventDefault()} // for better experience and stop opening the file with browser
              />
            </span>
          </ConditionalWrapper>
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
        appendTo={parentSelector}
      />
      {footer ?? (
        <span className="flex flex-row gap-3 items-center p-3 px-4 border-t border-theme-divider-tertiary text-theme-label-tertiary">
          {!!onUploadCommand && (
            <Button
              type="button"
              buttonSize={actionButtonSizes}
              className={classNames(
                'btn-tertiary',
                uploadingCount && 'text-theme-color-cabbage',
              )}
              icon={icon}
              onClick={() => uploadRef?.current?.click()}
            >
              {shouldShowSubmit ? null : (
                <MarkdownUploadLabel
                  uploadingCount={uploadingCount}
                  uploadedCount={uploadedCount}
                />
              )}
            </Button>
          )}
          <input
            type="file"
            className="hidden"
            name="content_upload"
            ref={uploadRef}
            accept={ACCEPTED_TYPES}
            onInput={onUpload}
          />
          <ConditionalWrapper
            condition={sidebarRendered}
            wrapper={(children) => (
              <span
                className={classNames(
                  'grid grid-cols-3 gap-3',
                  !shouldShowSubmit && 'ml-auto',
                )}
              >
                {children}
              </span>
            )}
          >
            {!!onLinkCommand && (
              <Button
                className="btn-tertiary"
                type="button"
                buttonSize={actionButtonSizes}
                icon={<LinkIcon secondary />}
                onClick={onLinkCommand}
              />
            )}
            {!!onMentionCommand && (
              <Button
                className="btn-tertiary"
                type="button"
                buttonSize={actionButtonSizes}
                icon={<AtIcon />}
                onClick={onMentionCommand}
              />
            )}
            {showMarkdownGuide && (
              <Button
                className="btn-tertiary"
                type="button"
                buttonSize={actionButtonSizes}
                icon={<MarkdownIcon />}
                tag="a"
                target="_blank"
                rel="noopener noreferrer"
                href={markdownGuide}
              />
            )}
          </ConditionalWrapper>
          {shouldShowSubmit && (
            <Button
              className="ml-auto btn-primary-cabbage"
              type="submit"
              disabled={isLoading}
              loading={isLoading}
            >
              {submitCopy}
            </Button>
          )}
        </span>
      )}
    </div>
  );
}

export default forwardRef(MarkdownInput);
