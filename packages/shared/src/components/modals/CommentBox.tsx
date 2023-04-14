import React, {
  ReactElement,
  useContext,
  useEffect,
  ClipboardEvent,
  MouseEvent,
  KeyboardEvent,
  CompositionEvent,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import AuthContext from '../../contexts/AuthContext';
import { commentDateFormat } from '../../lib/dateFormat';
import styles from './CommentBox.module.css';
import { ProfilePicture } from '../ProfilePicture';
import Markdown from '../Markdown';
import { RecommendedMentionTooltip } from '../tooltips/RecommendedMentionTooltip';
import { fixHeight, UseUserMentionOptions } from '../../hooks/useUserMention';
import { cleanupEmptySpaces } from '../../lib/strings';
import {
  ArrowKey,
  BaseInputEvent,
  checkIsKeyboardCommand,
  KeyboardCommand,
  Y_AXIS_KEYS,
} from '../../lib/element';
import { ParentComment } from '../../graphql/posts';

type TextareaInputEvent = CompositionEvent<HTMLTextAreaElement> &
  BaseInputEvent;

export interface CommentBoxProps {
  parentComment: ParentComment;
  input?: string;
  children?: ReactNode;
  errorMessage?: string;
  sendingComment?: boolean;
  parentSelector?: () => HTMLElement;
  sendComment: (event: MouseEvent | KeyboardEvent) => Promise<void>;
  onInput?: (value: string) => unknown;
  useUserMentionOptions: UseUserMentionOptions;
}

function CommentBox({
  parentComment,
  input,
  children,
  errorMessage,
  onInput,
  sendComment,
  parentSelector,
  useUserMentionOptions,
}: CommentBoxProps): ReactElement {
  const { authorImage, authorName, publishDate, contentHtml, editContent } =
    parentComment;
  const { user } = useContext(AuthContext);
  const {
    onMentionClick,
    onMentionKeypress,
    offset,
    mentions,
    mentionQuery,
    selected,
    commentRef,
    onInputClick,
  } = useUserMentionOptions;
  useEffect(() => {
    const element = commentRef.current;

    if (!element) return;

    element.focus();
    const value = input || editContent;

    if (value) {
      // eslint-disable-next-line no-param-reassign
      element.value = value;
      element.setSelectionRange(element.value.length, element.value.length);
    }

    element.setAttribute('data-min-height', element.offsetHeight.toString());
  }, []);

  const onPaste = (event: ClipboardEvent): void => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      document.execCommand('paste', false, text);
    }
  };

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const pressedSpecialkey = e.ctrlKey || e.metaKey;
    if (pressedSpecialkey && e.key === KeyboardCommand.Enter && input?.length) {
      return sendComment(e);
    }

    const isNavigatingPopup =
      e.key === KeyboardCommand.Enter ||
      Y_AXIS_KEYS.includes(e.key as ArrowKey);
    if (isNavigatingPopup && mentions?.length) {
      return e.preventDefault();
    }

    return e.stopPropagation();
  };

  const onTextareaInput = (e: TextareaInputEvent) => {
    const target = e.target as HTMLInputElement;
    fixHeight(target);
    onInput(cleanupEmptySpaces(target.value));

    onMentionKeypress(e.data, e);
  };

  const onKeyUp = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (checkIsKeyboardCommand(e)) onMentionKeypress(e.key, e);
  };

  useEffect(() => {
    if (!mentions?.length) commentRef?.current?.focus();
  }, [mentions]);

  return (
    <>
      <article className="flex flex-col items-stretch rounded-8 break-words-overflow typo-callout">
        <header className="flex items-center mb-2">
          <ProfilePicture
            size="large"
            rounded="full"
            user={{ image: authorImage, username: authorName }}
            nativeLazyLoading
          />
          <div className="flex flex-col ml-2">
            <div className="truncate typo-callout">{authorName}</div>
            <time
              dateTime={publishDate.toString()}
              className="text-theme-label-tertiary typo-callout"
            >
              {commentDateFormat(publishDate)}
            </time>
          </div>
        </header>
        <Markdown content={contentHtml} />
      </article>
      <div className="flex items-center px-2 h-11">
        <div className="ml-3 w-px h-full bg-theme-divider-tertiary" />
        <div className="ml-6 text-theme-label-secondary typo-caption1">
          Reply to{' '}
          <strong className="font-bold text-theme-label-primary">
            {authorName}
          </strong>
        </div>
      </div>
      <div className="flex relative flex-1 pl-2">
        <ProfilePicture user={user} size="small" nativeLazyLoading />
        <textarea
          className={classNames(
            'ml-3 flex-1 text-theme-label-primary bg-transparent border-none caret-theme-label-link break-words typo-subhead resize-none',
            styles.textarea,
          )}
          defaultValue={input}
          ref={commentRef}
          placeholder="Share your thoughts"
          onInput={onTextareaInput}
          onKeyDown={handleKeydown}
          onKeyUp={onKeyUp}
          onClick={onInputClick}
          onPaste={onPaste}
          tabIndex={0}
          aria-label="New comment box"
          aria-multiline
        />
      </div>
      <RecommendedMentionTooltip
        elementRef={commentRef}
        offset={offset}
        mentions={mentions}
        selected={selected}
        query={mentionQuery}
        appendTo={parentSelector}
        onMentionClick={onMentionClick}
      />
      <div
        className="my-2 mx-3 text-theme-status-error typo-caption1"
        style={{ minHeight: '1rem' }}
      >
        {errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
      {children}
    </>
  );
}

export default CommentBox;
