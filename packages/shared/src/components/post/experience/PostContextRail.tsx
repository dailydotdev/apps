import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { useAuthContext } from '../../../contexts/AuthContext';
import { MentionedToolsWidget } from '../../brand/MentionedToolsWidget';
import ShareBar from '../../ShareBar';
import { ShareMobile } from '../../ShareMobile';
import { HighlightPostSidebarWidget } from '../../cards/highlight/HighlightPostSidebarWidget';
import { BuildYourFeedWidget } from '../BuildYourFeedWidget';

interface RailSectionProps {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}

const RailSection = ({
  eyebrow,
  title,
  children,
}: RailSectionProps): ReactElement => (
  <section className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4">
    {eyebrow && (
      <p className="mb-1 text-accent-cabbage-default typo-caption1">
        {eyebrow}
      </p>
    )}
    <p className="mb-3 font-bold text-text-primary typo-title3">{title}</p>
    {children}
  </section>
);

interface PostContextRailProps {
  post: Post;
  origin: PostOrigin;
  onCopyPostLink?: (post?: Post) => void;
}

export const PostContextRail = ({
  post,
  origin,
  onCopyPostLink,
}: PostContextRailProps): ReactElement => {
  const { user } = useAuthContext();

  return (
    <>
      {!user && <BuildYourFeedWidget />}
      <RailSection eyebrow="Live pulse" title="Happening now">
        <HighlightPostSidebarWidget />
      </RailSection>
      <RailSection title="Share the context">
        <div className="flex flex-col gap-3">
          <ShareBar post={post} />
          <ShareMobile
            link={post.commentsPermalink}
            onCopyPostLink={() => onCopyPostLink?.(post)}
            origin={origin}
            post={post}
          />
        </div>
      </RailSection>
      <MentionedToolsWidget compact postTags={post.tags || []} />
    </>
  );
};
