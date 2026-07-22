import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import type { PostData } from '@dailydotdev/shared/src/graphql/posts';
import { POST_BY_ID_STATIC_FIELDS_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { QuoteImageCard } from '@dailydotdev/shared/src/components/post/QuoteImageCard';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface QuotePageProps {
  id: string;
  title: string;
  sourceName: string | null;
  authorName: string | null;
  seo: NextSeoProps;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<QuotePageProps>> {
  const id = params?.id as string;

  if (!id) {
    return { notFound: true, revalidate: false };
  }

  try {
    const { post } = await gqlClient.request<PostData>(
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );

    return {
      props: {
        id: post.id,
        title: post.title ?? '',
        sourceName: post.source?.name ?? null,
        authorName: post.author?.name ?? null,
        seo: {
          title: post.title ?? 'Quote from daily.dev',
          description:
            'A quote from a post shared with millions of developers on daily.dev',
          noindex: true,
          twitter: { cardType: 'summary_large_image' },
          openGraph: {
            type: 'website',
            images: [
              {
                url: `https://og.daily.dev/api/posts/${post.id}`,
                width: 1200,
                height: 630,
                alt: post.title ?? 'Quote image',
              },
            ],
          },
        },
      },
      revalidate: 60,
    };
  } catch (err) {
    return { notFound: true, revalidate: 60 };
  }
}

const QuoteImagePage = ({
  title,
  sourceName,
  authorName,
}: QuotePageProps): ReactElement => {
  const { query } = useRouter();
  // The quote itself is never part of the cached page — it comes from the
  // reader's selection, so it rides in the query string and the ISR'd shell is
  // reused for every quote of the same post.
  const quote = (query?.text as string) ?? '';

  return (
    <div
      id="screenshot_wrapper"
      data-testid="screenshot_wrapper"
      className="w-fit"
    >
      <QuoteImageCard
        authorName={authorName}
        quote={quote}
        sourceName={sourceName}
        title={title}
      />
    </div>
  );
};

export default QuoteImagePage;
