import React, { ReactElement, useMemo, useState } from 'react';
import classNames from 'classnames';
import { usePostCodeSnippetsQuery } from '../../hooks/post/usePostCodeSnippets';
import { RenderMarkdown } from '../RenderMarkdown';

export type PostCodeSnippetsProps = {
  className?: string;
  postId: string | undefined;
};

export const PostCodeSnippets = ({
  className,
  postId,
}: PostCodeSnippetsProps): ReactElement => {
  const { data } = usePostCodeSnippetsQuery({
    postId,
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeSnippetIndex, setActiveSnippetIndex] = useState<number>(4);

  const codeSnippet = useMemo(() => {
    const pagesFlat = data?.pages.flatMap((page) => page.edges);

    return pagesFlat[activeSnippetIndex]?.node;
  }, [data, activeSnippetIndex]);

  if (!codeSnippet) {
    return null;
  }

  const markdownContent = `\`\`\`\n${codeSnippet.content}\n\`\`\``;

  return (
    <div
      className={classNames(
        className,
        'min-h-44 overflow-hidden rounded-12',
        isExpanded ? 'max-h-[37.5rem]' : 'max-h-60',
      )}
    >
      <RenderMarkdown content={markdownContent} />
    </div>
  );
};
