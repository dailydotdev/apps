import React, {
  ReactElement,
  useContext,
  useEffect,
  ClipboardEvent,
  useRef,
  FormEventHandler,
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
  sendComment: (event: MouseEvent | KeyboardEvent) => Promise<void>;
  onInput: FormEventHandler<HTMLDivElement>;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
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
}: CommentBoxProps): ReactElement {
  const { user } = useContext(AuthContext);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentRef.current?.focus();
    if (commentRef.current && editContent) {
      commentRef.current.textContent = editContent;
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

  return (
    <>
      <article
        className={classNames(
          'flex flex-col items-stretch',
          commentBoxClassNames,
        )}
      >
        <header className="flex items-center mb-2">
          <RoundedImage
            imgSrc={authorImage}
            imgAlt={`${authorName}'s profile`}
            background="var(--theme-background-secondary)"
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
      <div className="flex px-2">
        <ProfilePicture user={user} size="small" />
        <div
          className={classNames(
            'ml-3 flex-1 text-theme-label-primary bg-none border-none caret-theme-label-link whitespace-pre-line break-words break-words-overflow typo-subhead',
            styles.textarea,
          )}
          ref={commentRef}
          contentEditable
          role="textbox"
          aria-placeholder="Write your comment..."
          aria-multiline
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          tabIndex={0}
          aria-label="New comment box"
        />
      </div>
      <div
        className="my-2 mx-3 text-theme-status-error typo-caption1"
        style={{ minHeight: '1rem' }}
      >
        {errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
      <footer className="flex justify-between items-center py-2 border-t border-theme-divider-tertiary">
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
          disabled={!input?.trim().length}
          loading={sendingComment}
          onClick={sendComment}
          className="btn-primary-avocado"
        >
          {editId ? 'Update' : 'Comment'}
        </Button>
      </footer>
    </>
  );
}

export default CommentBox;
