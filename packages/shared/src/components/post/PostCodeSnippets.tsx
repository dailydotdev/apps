import React, { ReactElement, useMemo, useState } from 'react';
import classNames from 'classnames';
import { usePostCodeSnippetsQuery } from '../../hooks/post/usePostCodeSnippets';
import { RenderMarkdown } from '../RenderMarkdown';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';

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

  const markdownContent = `\`\`\`\n${codeSnippet.content}\n\`\`\``;

  const prevSnippet = () => {
    setActiveSnippetIndex((prevIndex) => prevIndex - 1);
  };
  const nextSnippet = () => {
    setActiveSnippetIndex((prevIndex) => prevIndex + 1);
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
      />
    </div>
  );
};
