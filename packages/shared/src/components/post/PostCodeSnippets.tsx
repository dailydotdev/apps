import React, { ReactElement, useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import { usePostCodeSnippetsQuery } from '../../hooks/post/usePostCodeSnippets';
import { RenderMarkdown } from '../RenderMarkdown';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import type { Post } from '../../graphql/posts';
import { postLogEvent } from '../../lib/feed';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { ActiveFeedContext } from '../../contexts';

export type PostCodeSnippetsProps = {
  className?: string;
  post: Post;
};

export const PostCodeSnippets = ({
  className,
  post,
}: PostCodeSnippetsProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { logOpts } = useContext(ActiveFeedContext);
  const { data, fetchNextPage } = usePostCodeSnippetsQuery({
    postId: post.id,
  });

  const [activeSnippetIndex, setActiveSnippetIndex] = useState<number>(0);

  const pagesFlat = useMemo(() => {
    return data?.pages.flatMap((page) => page.edges);
  }, [data]);

  const codeSnippet = useMemo(() => {
    return pagesFlat?.[activeSnippetIndex]?.node;
  }, [activeSnippetIndex, pagesFlat]);

  if (!codeSnippet) {
    return null;
  }

  const markdownContent = `~~~\n${codeSnippet.content}\n~~~`;

  const prevSnippet = () => {
    logEvent(postLogEvent(LogEvent.PreviousSnippet, post, { ...logOpts }));
    setActiveSnippetIndex((prevIndex) => prevIndex - 1);
  };
  const nextSnippet = () => {
    logEvent(postLogEvent(LogEvent.NextSnippet, post, { ...logOpts }));
    if (
      activeSnippetIndex === pagesFlat.length - 3 &&
      data.pages[data.pages.length - 1].pageInfo.hasNextPage
    ) {
      fetchNextPage();
    }
    setActiveSnippetIndex((prevIndex) => prevIndex + 1);
  };

  const copyTracking = () => {
    logEvent(postLogEvent(LogEvent.CopySnippet, post, { ...logOpts }));
  };

  const NavigationButtons = (
    <>
      <Button
        variant={ButtonVariant.Tertiary}
        className="-rotate-90"
        icon={<ArrowIcon />}
        disabled={activeSnippetIndex === 0}
        size={ButtonSize.Small}
        onClick={prevSnippet}
      />
      <Button
        variant={ButtonVariant.Tertiary}
        className="rotate-90"
        icon={<ArrowIcon />}
        disabled={activeSnippetIndex === pagesFlat.length - 1}
        size={ButtonSize.Small}
        onClick={nextSnippet}
      />
    </>
  );

  return (
    <div className={classNames(className, 'overflow-hidden rounded-12')}>
      <RenderMarkdown
        isExpandable
        content={markdownContent}
        header={{ buttons: NavigationButtons }}
        onCopy={copyTracking}
      />
    </div>
  );
};
