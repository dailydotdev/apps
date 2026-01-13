import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export interface TweetContentProps {
  content: string;
  contentHtml?: string;
  className?: string;
}

export function TweetContent({
  content,
  contentHtml,
  className,
}: TweetContentProps): ReactElement {
  // If we have pre-rendered HTML, use it
  if (contentHtml) {
    return (
      <div
        className={classNames(
          'tweet-content whitespace-pre-wrap break-words text-text-primary typo-body',
          className,
        )}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  // Otherwise, parse and render the content with links
  const parseTwitterContent = (text: string): ReactElement[] => {
    const parts: ReactElement[] = [];
    let lastIndex = 0;
    let keyIndex = 0;

    // Combined regex for @mentions, #hashtags, and URLs
    const regex =
      /(@\w+)|(#\w+)|(https?:\/\/[^\s]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyIndex++}`}>
            {text.slice(lastIndex, match.index)}
          </span>,
        );
      }

      const [fullMatch, mention, hashtag, url] = match;

      if (mention) {
        // @mention - link to Twitter profile
        const username = mention.slice(1);
        parts.push(
          <a
            key={`mention-${keyIndex++}`}
            href={`https://x.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cabbage-default hover:underline"
          >
            {mention}
          </a>,
        );
      } else if (hashtag) {
        // #hashtag - link to Twitter search
        const tag = hashtag.slice(1);
        parts.push(
          <a
            key={`hashtag-${keyIndex++}`}
            href={`https://x.com/hashtag/${tag}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cabbage-default hover:underline"
          >
            {hashtag}
          </a>,
        );
      } else if (url) {
        // URL - clickable link
        parts.push(
          <a
            key={`url-${keyIndex++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cabbage-default hover:underline"
          >
            {url.length > 30 ? `${url.slice(0, 30)}...` : url}
          </a>,
        );
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${keyIndex++}`}>{text.slice(lastIndex)}</span>,
      );
    }

    return parts;
  };

  return (
    <div
      className={classNames(
        'whitespace-pre-wrap break-words text-text-primary typo-body',
        className,
      )}
    >
      {parseTwitterContent(content)}
    </div>
  );
}
