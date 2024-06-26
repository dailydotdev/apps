import React, {
  ChangeEventHandler,
  forwardRef,
  MouseEventHandler,
  MutableRefObject,
  ReactElement,
  ReactNode,
  TextareaHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { ImageIcon, MarkdownIcon, LinkIcon, AtIcon } from '../../icons';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
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
import { TabContainer, Tab } from '../../tabs/TabContainer';
import MarkdownPreview from '../MarkdownPreview';
import { isNullOrUndefined } from '../../../lib/func';
import { SavingLabel } from './SavingLabel';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Loader } from '../../Loader';
import { Divider } from '../../utilities';
import { usePopupSelector } from '../../../hooks/usePopupSelector';
import { focusInput } from '../../../lib/textarea';

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
  disabledSubmit?: boolean;
}

enum CommentTab {
  Write = 'Write',
  Preview = 'Preview',
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
    disabledSubmit,
  }: MarkdownInputProps,
  ref: MutableRefObject<MarkdownRef>,
): ReactElement {
  const shouldShowSubmit = !!submitCopy;
  const { user } = useAuthContext();
  const { parentSelector } = usePopupSelector();
  const { sidebarRendered } = useSidebarRendered();
  const textareaRef = useRef<HTMLTextAreaElement>();
  const uploadRef = useRef<HTMLInputElement>();
  const [active, setActive] = useState(CommentTab.Write);
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
        innerClassName="before:border-t-accent-cabbage-default after:border-accent-cabbage-default"
      />
    );

  const onInputClick: MouseEventHandler<HTMLTextAreaElement> = () => {
    if (checkMention) {
      checkMention();
    }
  };

  useEffect(() => {
    const content = textareaRef?.current?.value;

    if (!content) {
      return;
    }

    focusInput(textareaRef.current, [content.length, content.length]);
  }, []);

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 bg-surface-float',
        className?.container,
      )}
    >
      {!isNullOrUndefined(isUpdatingDraft) && (
        <SavingLabel
          className="absolute right-3 top-3"
          isUpdating={isUpdatingDraft}
          isUptoDate={initialContent === input}
        />
      )}
      <ConditionalWrapper
        condition={allowPreview}
        wrapper={(children) => (
          <TabContainer
            shouldMountInactive
            onActiveChange={(tab: CommentTab) => setActive(tab)}
            className={{
              header: 'px-1',
              container: classNames('min-h-[20.5rem]', className?.tab),
            }}
            tabListProps={{ className: { indicator: '!w-6' } }}
          >
            <Tab label={CommentTab.Write}>{children}</Tab>
            <Tab label={CommentTab.Preview} className="min-h-[11.125rem] p-4">
              <MarkdownPreview
                input={input}
                sourceId={sourceId}
                parentSelector={parentSelector}
                enabled={allowPreview && CommentTab.Preview === active}
              />
            </Tab>
          </TabContainer>
        )}
      >
        <ConditionalWrapper
          condition={!!timeline}
          wrapper={(component) => (
            <span className="relative flex flex-col">
              <Divider
                className="absolute left-8 !h-10 !bg-border-subtlest-tertiary"
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
              <span className="flex w-full flex-row">
                <ProfilePicture
                  size={ProfileImageSize.Large}
                  className={classNames('ml-3 mt-3', className?.profile)}
                  user={user}
                  nativeLazyLoading
                />
                {component}
              </span>
            )}
          >
            <span className="relative flex flex-1">
              <textarea
                rows={11}
                placeholder="Share your thoughts"
                {...textareaProps}
                {...callbacks}
                ref={textareaRef}
                className={classNames(
                  'flex max-h-commentBox flex-1 bg-transparent placeholder-text-quaternary outline-none typo-body',
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
        <span className="flex flex-row items-center gap-3 border-border-subtlest-tertiary p-3 px-4 text-text-tertiary laptop:justify-end laptop:border-t">
          {!!onUploadCommand && (
            <Button
              size={actionButtonSizes}
              variant={ButtonVariant.Tertiary}
              color={uploadingCount ? ButtonColor.Cabbage : undefined}
              className={classNames(
                'font-normal',
                uploadingCount && 'mr-auto text-brand-default',
              )}
              icon={icon}
              onClick={() => uploadRef?.current?.click()}
              type="button"
            >
              {!sidebarRendered || shouldShowSubmit ? null : (
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
                  'flex gap-3',
                  !shouldShowSubmit && 'ml-auto',
                )}
              >
                {children}
              </span>
            )}
          >
            {!!onLinkCommand && (
              <Button
                variant={ButtonVariant.Tertiary}
                size={actionButtonSizes}
                icon={<LinkIcon secondary />}
                onClick={onLinkCommand}
                type="button"
              />
            )}
            {!!onMentionCommand && (
              <Button
                variant={ButtonVariant.Tertiary}
                size={actionButtonSizes}
                icon={<AtIcon />}
                onClick={onMentionCommand}
                type="button"
              />
            )}
            {showMarkdownGuide && (
              <Button
                variant={ButtonVariant.Tertiary}
                size={actionButtonSizes}
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
              className="ml-auto"
              variant={ButtonVariant.Primary}
              color={ButtonColor.Cabbage}
              type="submit"
              disabled={isLoading || disabledSubmit || input === ''}
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
