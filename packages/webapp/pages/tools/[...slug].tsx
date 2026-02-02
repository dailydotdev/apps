import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import dynamic from 'next/dynamic';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import {
  findToolBySlug,
  getToolPath,
} from '@dailydotdev/shared/src/lib/toolsMockData';
import { ToolBreadcrumb } from '@dailydotdev/shared/src/components/tools/ToolBreadcrumb';
import { ToolHeader } from '@dailydotdev/shared/src/components/tools/ToolHeader';
import { ToolCard } from '@dailydotdev/shared/src/components/tools/ToolCard';
import { ToolRelatedContent } from '@dailydotdev/shared/src/components/tools/ToolRelatedContent';
import { ToolDiscussion } from '@dailydotdev/shared/src/components/tools/ToolDiscussion';
import Custom404 from '../404';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const ToolSentimentChart = dynamic(
  () =>
    import('@dailydotdev/shared/src/components/tools/ToolSentimentChart').then(
      (mod) => mod.ToolSentimentChart,
    ),
  { ssr: false },
);

const ToolPage = (): ReactElement => {
  const router = useRouter();
  const { slug } = router.query;

  const [upvotedTools, setUpvotedTools] = useState<Set<string>>(new Set());
  const [upvotedComments, setUpvotedComments] = useState<Set<string>>(
    new Set(),
  );

  const slugString = Array.isArray(slug) ? slug.join('/') : slug || '';
  const tool = useMemo(() => findToolBySlug(slugString), [slugString]);
  const toolPath = useMemo(() => getToolPath(slugString), [slugString]);

  const handleUpvoteTool = (toolId: string) => {
    setUpvotedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  const handleUpvoteComment = (commentId: string) => {
    setUpvotedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  if (router.isFallback) {
    return <></>;
  }

  if (!tool) {
    return <Custom404 />;
  }

  const hasChildren = tool.children.length > 0;

  return (
    <PageWrapperLayout className="py-6">
      <ToolBreadcrumb toolPath={toolPath} className="mb-4" />

      <ToolHeader
        tool={tool}
        isUpvoted={upvotedTools.has(tool.id)}
        onUpvote={() => handleUpvoteTool(tool.id)}
        className="mb-8"
      />

      {hasChildren && (
        <section className="mb-8">
          <h2 className="mb-4 font-bold text-text-primary typo-title3">
            Available tools
          </h2>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
            {tool.children.map((child) => (
              <ToolCard key={child.id} tool={child} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 laptop:grid-cols-2">
        <ToolSentimentChart data={tool.sentimentData} />
        <ToolRelatedContent posts={tool.relatedPosts} />
      </div>

      <ToolDiscussion
        comments={tool.comments}
        upvotedComments={upvotedComments}
        onUpvoteComment={handleUpvoteComment}
        className="mt-8"
      />
    </PageWrapperLayout>
  );
};

const getToolPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ToolPage.getLayout = getToolPageLayout;
ToolPage.layoutProps = {
  screenCentered: false,
  seo: {
    title: getTemplatedTitle('AI Tool'),
    openGraph: { ...defaultOpenGraph },
  } as NextSeoProps,
};

export default ToolPage;
