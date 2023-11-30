import React, { ReactElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  FURTHER_READING_QUERY,
  FurtherReadingData,
} from '../../graphql/furtherReading';
import { graphqlUrl } from '../../lib/config';
import { Post, PostType } from '../../graphql/posts';
import { FeedData, SOURCE_FEED_QUERY } from '../../graphql/feed';
import LeanFeed from '../feed/LeanFeed';
import { FeedItem } from '../../hooks/useFeed';
import { ActiveFeedContextProvider } from '../../contexts';
import { Card } from '../feed/cards/atoms/Card';
import { CardButton } from '../feed/cards/atoms/CardAction';
import { Flag } from '../feed/cards/atoms/Flag';
import { RaisedLabelType } from '../cards/RaisedLabel';
import { CardContainer } from '../feed/cards/atoms/CardContainer';
import SourceButton from '../cards/SourceButton';
import { ProfilePicture } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyElement,
  TypographyType,
} from '../typography/Typography';
import CreatedAt from '../feed/cards/atoms/CreatedAt';
import ReadTime from '../feed/cards/atoms/ReadTime';
import { Separator } from '../cards/common';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import OptionsButton from '../buttons/OptionsButton';
import { cloudinary } from '../../lib/image';
import { Image } from '../feed/cards/atoms/Image';
import { UpvoteButton } from '../feed/cards/atoms/UpvoteButton';
import { CommentButton } from '../feed/cards/atoms/CommentButton';
import ShareButton from '../feed/cards/atoms/ShareButton';
import TextImage from '../feed/cards/atoms/TextImage';
import MetaContainer from '../feed/cards/atoms/MetaContainer';
import { CardImage } from '../cards/Card';
import AdLink from '../feed/cards/atoms/AdLink';
import AdImage from '../feed/cards/atoms/AdImage';
import { Button } from '../buttons/Button';
import UpvoteIcon from '../icons/Upvote';
import DownvoteIcon from '../icons/Downvote';
import GenericFeedItemComponent from '../feed/feedItemComponent/genericFeedItemComponent';
import SquadFeedItemComponent from '../feed/feedItemComponent/squadFeedItemComponent';

export type FurtherReadingProps = {
  currentPost: Post;
  className?: string;
};

export default function FurtherReadingSquad({
  currentPost,
  className,
}: FurtherReadingProps): ReactElement {
  const postId = currentPost.id;
  const { tags } = currentPost;
  const queryKey = ['furtherReading', postId];
  const { user, isLoggedIn } = useContext(AuthContext);

  const { data: posts, isFetching } = useQuery<FurtherReadingData>(
    queryKey,
    async () => {
      const squad = currentPost.source;

      const squadPostsResult = await request<FeedData>(
        graphqlUrl,
        SOURCE_FEED_QUERY,
        {
          first: 3,
          loggedIn: isLoggedIn,
          source: squad.id,
          ranking: 'TIME',
          supportedTypes: [PostType.Article, PostType.Share, PostType.Freeform],
        },
      );
      const similarPosts =
        squadPostsResult?.page?.edges
          ?.map((item) => item.node)
          ?.filter((item) => item.id !== currentPost.id) || [];

      return {
        trendingPosts: [],
        similarPosts,
        discussedPosts: [],
      };

      return request(graphqlUrl, FURTHER_READING_QUERY, {
        loggedIn: !!user,
        post: postId,
        trendingFirst: 1,
        similarFirst: 3,
        discussedFirst: 4,
        tags,
      });
    },
    {
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchOnMount: false,
    },
  );

  const similarPosts = useMemo(() => {
    let newItems: FeedItem[] = [];

    if (posts?.similarPosts) {
      newItems = posts.similarPosts.map((post, index) => ({
        type: 'post',
        post,
        page: 0,
        index,
      }));
    }

    if (isFetching) {
      newItems.push(...Array(1).fill({ type: 'placeholder' }));
    }
    return newItems;
  }, [isFetching, posts]);

  return (
    <div className="flex flex-col flex-1 w-full bg-theme-overlay-float-avocado">
      <div className="w-full border-b border-b-theme-divider-tertiary">
        <p className="p-4 tablet:px-8 font-bold typo-callout text-theme-label-tertiary">
          More posts from squad_name
        </p>
      </div>
      <div className={classNames(className, 'flex flex-col gap-6')}>
        {/**
         Article card no action buttons
         * */}
        <CardContainer className="group/card w-[320px]">
          <Card>
            <header className="flex items-center my-1 mx-2.5 h-8">
              <SourceButton
                source={{
                  id: '1',
                  image: 'https://picsum.photos/200/300',
                  name: 'test',
                  handle: 'test',
                  permalink: 'https://daily.dev/test',
                }}
              />
            </header>
            <section>
              <div className="mx-4">
                <Typography type={TypographyType.Title3} bold className="my-2">
                  FBI Shuts Down IPStorm Botnet as Its Operator Pleads Guilty
                </Typography>
                <MetaContainer
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  <CreatedAt createdAt="2023-10-10T12:00:00.000Z" />
                  <Separator />
                  <ReadTime readTime={5} />
                </MetaContainer>
              </div>
            </section>
            <section>
              <CardImage
                className="my-2 w-full"
                src="https://picsum.photos/500/500"
              />
            </section>
          </Card>
        </CardContainer>

        {/**
         Feedback
         * */}
        <CardContainer className="group/card w-[320px]">
          <Card
            padding=""
            background="bg-theme-bg-primary"
            border="border border-theme-divider-quaternary"
          >
            <section className="flex-1 p-6 pb-5 space-y-4">
              <Typography type={TypographyType.Callout} bold>
                Did you like the post?
              </Typography>
              <div className="flex gap-3 items-center">
                <Button
                  id="upvote-post-btn"
                  icon={<UpvoteIcon />}
                  aria-label="Upvote"
                  className="btn-secondary-avocado"
                />
                <Button
                  id="downvote-post-btn"
                  icon={<DownvoteIcon />}
                  aria-label="Downvote"
                  className="btn-secondary-ketchup"
                />
              </div>
            </section>
            <Card shadow={false} background="bg-theme-bg-primary">
              <section className="mx-4">
                <Typography
                  type={TypographyType.Title3}
                  color={TypographyColor.Tertiary}
                  bold
                  className="my-2 line-clamp-2"
                >
                  Elon Musk is a ‘jerk’ but was a ‘talent magnet’ for OpenAI
                  early on, admits Sam Altman—who now faces direct competition
                  from him
                </Typography>
              </section>
              <section>
                <CardImage
                  className="my-2 w-full"
                  src="https://picsum.photos/500/500"
                />
              </section>
            </Card>
          </Card>
        </CardContainer>

        {/**
         Ad card
         * */}
        <CardContainer className="group/card w-[320px]">
          <Card>
            <CardButton />
            <section>
              <div className="mx-4">
                <Typography type={TypographyType.Title3} bold className="my-4">
                  snarkOS - A decentralized operating system for zero-knowledge
                  applications.
                </Typography>
              </div>
            </section>
            <section>
              <AdImage
                ad={{
                  source: 'Carbon',
                  referralLink: 'https://google.com',
                  image: 'https://picsum.photos/500/500',
                }}
              />
            </section>
            <footer className="flex flex-row justify-between mx-4">
              <AdLink
                ad={{ source: 'Carbon', referralLink: 'https://google.com' }}
              />
            </footer>
          </Card>
        </CardContainer>

        {/**
         Welcome card
         * */}
        <CardContainer className="group/card w-[320px]">
          <Flag type={RaisedLabelType.Pinned} description="Pinned" />
          <Card>
            <CardButton />
            <header className="flex relative flex-row gap-2 m-2 mb-3">
              <div className="relative">
                <SourceButton
                  source={{
                    id: '1',
                    image: 'https://picsum.photos/200/300',
                    name: 'test',
                    handle: 'test',
                    permalink: 'https://daily.dev/test',
                  }}
                  size="xsmall"
                  className="absolute -right-2 -bottom-2"
                />
                <ProfilePicture
                  user={{
                    id: '123',
                    image: 'https://picsum.photos/200/300',
                    username: 'test',
                  }}
                  size="large"
                />
              </div>
              <div className="flex flex-col flex-1 mr-6 ml-2">
                <Typography type={TypographyType.Footnote} bold>
                  Ido Shamun
                </Typography>
                <MetaContainer
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  <Typography bold>@ido</Typography>
                  <Separator />
                  <CreatedAt createdAt="2021-08-10T12:00:00.000Z" />
                </MetaContainer>
              </div>
              <div className="flex invisible group-hover/card:visible flex-row gap-2 self-start ml-auto">
                <OptionsButton tooltipPlacement="top" />
              </div>
            </header>
            <section>
              <div className="px-2 pt-2 pb-3">
                <Typography
                  type={TypographyType.Title3}
                  bold
                  className="line-clamp-3"
                >
                  Welcome to the Watercooler Squad 🍄 Guidelines and
                  introductions 👇
                </Typography>
              </div>
            </section>
            <section>
              <CardImage
                className="my-2 w-full"
                src="https://picsum.photos/500/500"
              />
            </section>
            <footer className="flex flex-row justify-between mx-4">
              <UpvoteButton
                post={{ userState: { vote: -1 }, numUpvotes: 32 }}
              />
              <CommentButton post={{ numComments: 2000, commented: true }} />
              <ShareButton post={{}} />
            </footer>
          </Card>
        </CardContainer>

        {/* Card related stuff */}
        <CardContainer className="group/card">
          <Flag type={RaisedLabelType.Hot} description="Some text" />
          <Card>
            <div className="relative z-1">
              <CardButton />
              <SourceButton
                source={{
                  id: '1',
                  image: 'https://picsum.photos/200/300',
                  name: 'test',
                  handle: 'test',
                  permalink: 'https://daily.dev/test',
                }}
              />
              <ProfilePicture
                user={{
                  id: '1',
                  username: 'test',
                  image: 'https://picsum.photos/200/300',
                }}
              />
              <Typography type={TypographyType.Giga1} bold>
                Big one
              </Typography>
              <Typography>Some text</Typography>
              <Typography
                element={TypographyElement.H1}
                type={TypographyType.Callout}
                bold
              >
                Some text
              </Typography>
              <CreatedAt
                createdAt="2023-08-10T12:00:00.000Z"
                type={TypographyType.Giga1}
              />
              <CreatedAt createdAt="2021-08-10T12:00:00.000Z" />
              <ReadTime readTime={5} />
              <Separator />
              <div className="flex">
                <Typography type={TypographyType.Callout} bold>
                  @description
                </Typography>
                <Separator />
                <CreatedAt createdAt="2021-08-10T12:00:00.000Z" />
                <Separator />
                <ReadTime readTime={5} />
              </div>
              <ReadArticleButton
                className="invisible group-hover/card:visible btn-primary"
                href="https://daily.dev"
                onClick={() => {}}
                openNewTab
              />
              <OptionsButton tooltipPlacement="top" />
              <Typography type={TypographyType.Title3} className="line-clamp-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                rutrum dignissim mi quis accumsan. Phasellus faucibus dolor in
                mauris maximus rhoncus. Nulla tristique nunc justo, et eleifend
                quam mattis sed. Donec et vehicula odio. Sed sit amet augue at
                nibh condimentum sodales sit amet id turpis. Interdum et
                malesuada fames ac ante ipsum primis in faucibus. Quisque
                fringilla consequat dui. Quisque tellus augue, fringilla non
                condimentum eu, posuere vitae eros. Maecenas massa metus, ornare
                ultricies neque eget, dapibus elementum est. Maecenas suscipit
                ullamcorper sapien, eget ullamcorper diam egestas in.
              </Typography>
              <Image
                alt="Post Cover image"
                src="https://picsum.photos/500/500"
                fallbackSrc={cloudinary.post.imageCoverPlaceholder}
                className={classNames('object-cover my-2')}
                loading="lazy"
              />
              <UpvoteButton post={{ userState: { vote: 1 }, numUpvotes: 5 }} />
              <CommentButton post={{}} />
              <ShareButton post={{}} />
              <div className="flex flex-row justify-between w-full">
                <UpvoteButton
                  post={{ userState: { vote: -1 }, numUpvotes: 32 }}
                />
                <CommentButton post={{}} />
                <ShareButton post={{}} />
              </div>
              <TextImage
                text={
                  <Typography type={TypographyType.Giga1}>
                    Header text
                  </Typography>
                }
                image="https://picsum.photos/500/500"
              />
              <Typography
                type={TypographyType.Footnote}
                bold
                color={TypographyColor.Quaternary}
              >
                Promoted
              </Typography>
            </div>
          </Card>
        </CardContainer>

        <p className="typo-title3">Generic feed</p>
        <ActiveFeedContextProvider items={similarPosts} queryKey={queryKey}>
          <LeanFeed>
            {similarPosts.map((item, i) => {
              return <GenericFeedItemComponent key={i} item={item} />;
            })}
          </LeanFeed>
        </ActiveFeedContextProvider>

        <p className="typo-title3">Squad page feed</p>
        <ActiveFeedContextProvider items={similarPosts} queryKey={queryKey}>
          <LeanFeed>
            {similarPosts.map((item, i) => {
              return <SquadFeedItemComponent key={i} item={item} />;
            })}
          </LeanFeed>
        </ActiveFeedContextProvider>
      </div>
    </div>
  );
}
