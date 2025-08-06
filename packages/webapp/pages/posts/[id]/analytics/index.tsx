import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import type { ClientError } from 'graphql-request';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import {
  Divider,
  pageBorders,
  ResponsivePageContainer,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { BoostPostButton } from '@dailydotdev/shared/src/features/boost/BoostPostButton';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import { POST_BY_ID_STATIC_FIELDS_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { usePostById } from '@dailydotdev/shared/src/hooks';
import { AnalyticsNumbersList } from '@dailydotdev/shared/src/components/analytics/AnalyticsNumbersList';
import { getSeoDescription } from '../../../../components/PostSEOSchema';
import type { Props } from '../index';
import { seoTitle } from '../index';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getLayout } from '../../../../components/layouts/MainLayout';
import type { SharePostPageProps } from '../share';

interface SectionHeaderProps {
  children: React.ReactNode;
}

const SectionHeader = ({ children }: SectionHeaderProps): ReactElement => {
  return (
    <Typography
      type={TypographyType.Body}
      bold
      tag={TypographyTag.H2}
      color={TypographyColor.Primary}
    >
      {children}
    </Typography>
  );
};

export type PostAnalyticsPageProps = Props;

export const getServerSideProps: GetServerSideProps<
  SharePostPageProps | { redirect: { destination: string } }
> = async ({ params, res }) => {
  const { id } = params;
  try {
    const promises: [Promise<PostData>, Promise<PublicProfile>?] = [
      gqlClient.request<PostData>(POST_BY_ID_STATIC_FIELDS_QUERY, { id }),
    ];

    const [initialData] = await Promise.all(promises);

    const post = initialData.post as Post;
    const seo: NextSeoProps = {
      canonical: post?.slug ? `${webappUrl}posts/${post.slug}` : undefined,
      title: getTemplatedTitle(seoTitle(post)),
      description: getSeoDescription(post),
      openGraph: {
        images: [
          {
            url: `https://og.daily.dev/api/posts/${post?.id}`,
          },
        ],
        article: {
          publishedTime: post?.createdAt,
          tags: post?.tags,
        },
      },
    };

    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${StaleTime.OneHour}`,
    );

    return {
      props: {
        id: initialData.post.id,
        initialData,
        seo,
      },
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);
    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      const { postId } = clientError.response.errors[0].extensions;

      return {
        props: { id: postId || id },
      };
    }
    throw err;
  }
};

const dividerClassName = 'bg-border-subtlest-tertiary';

const PostAnalyticsPage = ({
  id,
  initialData,
}: PostAnalyticsPageProps): ReactElement => {
  const { post } = usePostById({
    id,
    options: {
      initialData,
      retry: false,
    },
  });
  return (
    <div className="mx-auto w-full max-w-[48rem]">
      <LayoutHeader
        className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          icon={<ArrowIcon className="-rotate-90" />}
        />
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
          className="flex-1"
        >
          Analytics
        </Typography>
        <BoostPostButton post={post} buttonProps={{ size: ButtonSize.Small }} />
      </LayoutHeader>
      <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6">
        <div>
          <p>Section with post data</p>
        </div>
        <Divider className={dividerClassName} />
        <div>
          <SectionHeader>Discovery</SectionHeader>
        </div>
        <Divider className={dividerClassName} />
        <div>
          <SectionHeader>Boost your post</SectionHeader>
          <Typography
            className="mt-2"
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Give your content the spotlight it deserves. Our auto-targeting
            engine gets your post in front of developers most likely to care.
          </Typography>
          <Typography
            className="my-4"
            type={TypographyType.Footnote}
            color={TypographyColor.Boost}
          >
            Reach up to 100k more developers now
          </Typography>
          <BoostPostButton
            post={post}
            buttonProps={{ size: ButtonSize.Small }}
          />
        </div>
        <Divider className={dividerClassName} />
        <div>
          <SectionHeader>Profile activity</SectionHeader>
          <AnalyticsNumbersList />
        </div>
        <Divider className={dividerClassName} />
        <div>
          <SectionHeader>Engagement</SectionHeader>
          <AnalyticsNumbersList />
        </div>
      </ResponsivePageContainer>
    </div>
  );
};

PostAnalyticsPage.getLayout = getLayout;
PostAnalyticsPage.layoutProps = {
  screenCentered: false,
};

export default PostAnalyticsPage;
