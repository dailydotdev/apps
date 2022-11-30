import React, {
  ReactElement,
  useContext,
  useEffect,
  ClipboardEvent,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import classNames from 'classnames';
import AuthContext from '../../contexts/AuthContext';
import { commentBoxClassNames } from '../comments/common';
import { commentDateFormat } from '../../lib/dateFormat';
import styles from './CommentBox.module.css';
import { ProfilePicture } from '../ProfilePicture';
import Markdown from '../Markdown';
import { RecommendedMentionTooltip } from '../tooltips/RecommendedMentionTooltip';
import {
  fixHeight,
  UPDOWN_ARROW_KEYS,
  UseUserMention,
} from '../../hooks/useUserMention';
import { Post } from '../../graphql/posts';
import { cleanupEmptySpaces } from '../../lib/strings';

export interface CommentBoxProps extends UseUserMention {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  contentHtml: string;
  editContent?: string;
  input?: string;
  errorMessage?: string;
  sendingComment?: boolean;
  parentSelector?: () => HTMLElement;
  sendComment: (event: MouseEvent | KeyboardEvent) => Promise<void>;
  onInput?: (value: string) => unknown;
  post: Post;
}

function CommentBox({
  authorImage,
  authorName,
  publishDate,
  contentHtml,
  editContent,
  input,
  errorMessage,
  onInput,
  sendComment,
  parentSelector,
  onMentionClick,
  onMentionKeypress,
  offset,
  mentions,
  mentionQuery,
  selected,
  commentRef,
  onInputClick,
}: CommentBoxProps): ReactElement {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    commentRef.current?.focus();
    if (commentRef.current) {
      if (editContent) {
        // eslint-disable-next-line no-param-reassign
        commentRef.current.value = editContent;
      }
      commentRef.current.setAttribute(
        'data-min-height',
        commentRef.current.offsetHeight.toString(),
      );
    }
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && input?.length) {
      return sendComment(e);
    }

    if (
      (e.key === 'Enter' || UPDOWN_ARROW_KEYS.indexOf(e.key) !== -1) &&
      mentions?.length
    ) {
      return e.preventDefault();
    }

    return e.stopPropagation();
  };

  const onTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    fixHeight(e.currentTarget);
    onInput(cleanupEmptySpaces(e.currentTarget.value));
  };

  return (
    <>
      <article
        className={classNames(
          'flex flex-col items-stretch',
          commentBoxClassNames,
        )}
      >
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
          placeholder="Write your comment..."
          onInput={onTextareaInput}
          onKeyDown={handleKeydown}
          onKeyUp={onMentionKeypress}
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
    </>
  );
}

export default CommentBox;
