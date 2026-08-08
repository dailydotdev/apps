import React from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { WriteCommentContext } from '@dailydotdev/shared/src/contexts/WriteCommentContext';
import ExtensionProviders from '../../extension/_providers';

export const post = {
  id: 'post-1',
  title: 'Example Post Title',
  author: { id: 'author-1', username: 'ido' },
  source: { id: 'source-1', handle: 'webdev', type: SourceType.Squad },
} as unknown as Post;

export const postWithoutAuthor = {
  ...post,
  author: undefined,
} as unknown as Post;

interface MutationState {
  isLoading?: boolean;
  isSuccess?: boolean;
}

export const WriteComment: FC<PropsWithChildren<MutationState>> = ({
  children,
  isLoading = false,
  isSuccess = false,
}) => (
  <WriteCommentContext.Provider
    value={{
      mutateComment: {
        mutateComment: async () => null,
        isLoading,
        isSuccess,
      } as never,
    }}
  >
    {children}
  </WriteCommentContext.Provider>
);

export const ComposerHarness: FC<
  PropsWithChildren<MutationState & { className?: string }>
> = ({ children, className = 'max-w-[40rem]', ...mutation }) => (
  <ExtensionProviders>
    <WriteComment {...mutation}>
      {/* react-modal is configured against `#__next`, which Storybook has no
          equivalent of; the toolbar's link modal crashes without it. */}
      <div id="__next" className={`w-full p-4 ${className}`}>
        {children}
      </div>
    </WriteComment>
  </ExtensionProviders>
);

const paragraph =
  'the composer grows with what you type, then stops at its cap and scrolls its own body so the action bar never moves.';

export const shortComment = `This one fits without scrolling.`;

export const longComment = Array.from(
  { length: 14 },
  (_, index) => `Paragraph ${index + 1}: ${paragraph}`,
).join('\n\n');

export const markdownComment = [
  '## A heading',
  '',
  'Some **bold** text, a [link](https://daily.dev) and `inline code`.',
  '',
  '- first item',
  '- second item',
  '',
  '```',
  'const answer = 42;',
  '```',
].join('\n');

export const overflowingWord = `Supercalifragilisticexpialidocious${'antidisestablishmentarianism'.repeat(
  4,
)}`;
