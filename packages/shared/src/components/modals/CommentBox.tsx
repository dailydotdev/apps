import React, {
  ReactElement,
  useContext,
  useEffect,
  ClipboardEvent,
  useRef,
  KeyboardEventHandler,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import classNames from 'classnames';
import AuthContext from '../../contexts/AuthContext';
import { commentBoxClassNames } from '../comments/common';
import { commentDateFormat } from '../../lib/dateFormat';
import { Button } from '../buttons/Button';
import { RoundedImage } from '../utilities';
import styles from './CommentBox.module.css';
import { ProfilePicture } from '../ProfilePicture';
import { ClickableText } from '../buttons/ClickableText';
import Markdown from '../Markdown';
import { RecommendedMentionTooltip } from '../tooltips/RecommendedMentionTooltip';
import { useUserMention } from '../../hooks/useUserMention';
import { Post } from '../../graphql/posts';
import AtIcon from '../icons/At';
import { cleanupEmptySpaces } from '../../lib/strings';

export interface CommentBoxProps {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  contentHtml: string;
  editContent?: string;
  editId?: string;
  input?: string;
  errorMessage?: string;
  sendingComment?: boolean;
  parentSelector?: () => HTMLElement;
  sendComment: (event: MouseEvent | KeyboardEvent) => Promise<void>;
  onInput?: (value: string) => unknown;
  onKeyDown: (
    e: KeyboardEvent<HTMLDivElement>,
    defaultCallback?: KeyboardEventHandler<HTMLDivElement>,
  ) => unknown;
  post: Post;
}

function CommentBox({
  authorImage,
  authorName,
  publishDate,
  contentHtml,
  editContent,
  editId,
  input,
  errorMessage,
  sendingComment,
  onInput,
  onKeyDown,
  sendComment,
  parentSelector,
  post,
}: CommentBoxProps): ReactElement {
  const onTextareaInput = (content: string) =>
    onInput(cleanupEmptySpaces(content));
  const { user } = useContext(AuthContext);
  const commentRef = useRef<HTMLDivElement>(null);
  const {
    onMentionClick,
    onMentionKeypress,
    offset,
    mentions,
    mentionQuery,
    selected,
    onInitializeMention,
    onInputClick,
  } = useUserMention({
    postId: post.id,
    commentRef,
    onInput: onTextareaInput,
  });

  useEffect(() => {
    commentRef.current?.focus();
    if (commentRef.current && editContent) {
      commentRef.current.innerText = editContent;
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

  const handleKeydown = (e: KeyboardEvent<HTMLDivElement>) => {
    const defaultCallback = () => onMentionKeypress(e);
    onKeyDown(e, defaultCallback);
    e.stopPropagation();
  };

  return (
    <>
      <div className="overflow-auto" style={{ maxHeight: '31rem' }}>
        <article
          className={classNames(
            'flex flex-col items-stretch',
            commentBoxClassNames,
          )}
        >
          <header className="flex items-center mb-2">
            <RoundedImage
              src={authorImage}
              alt={`${authorName}'s profile`}
              className="bg-theme-bg-secondary"
              loading="lazy"
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
          <div
            className={classNames(
              'ml-3 pr-2 flex-1 text-theme-label-primary bg-transparent whitespace-pre-line border-none caret-theme-label-link break-words typo-subhead resize-none',
              styles.textarea,
            )}
            ref={commentRef}
            contentEditable
            role="textbox"
            aria-multiline
            aria-placeholder="Write your comment..."
            onInput={(e) => onTextareaInput(e.currentTarget.innerText)}
            onKeyDown={handleKeydown}
            onClick={onInputClick}
            onPaste={onPaste}
            tabIndex={0}
            aria-label="New comment box"
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
      </div>
      <footer className="flex items-center pt-3">
        <Button
          className="mx-1 btn-tertiary"
          buttonSize="small"
          icon={<AtIcon />}
          onClick={onInitializeMention}
        />
        <div className="ml-2 w-px h-6 border border-opacity-24 border-theme-divider-tertiary" />
        <ClickableText
          tag="a"
          href="https://www.markdownguide.org/cheat-sheet/"
          className="ml-4 typo-caption1"
          defaultTypo={false}
          target="_blank"
        >
          Markdown supported
        </ClickableText>
        <Button
          disabled={!input?.trim().length || input === editContent}
          loading={sendingComment}
          onClick={sendComment}
          className="ml-auto btn-primary-avocado"
        >
          {editId ? 'Update' : 'Comment'}
        </Button>
      </footer>
    </>
  );
}

export default CommentBox;
