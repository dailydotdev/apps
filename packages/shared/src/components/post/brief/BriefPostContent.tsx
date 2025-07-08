import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { Fragment, useEffect } from 'react';
import Link from 'next/link';
import {
  ToastSubject,
  useConditionalFeature,
  usePlusSubscription,
  useToastNotification,
} from '../../../hooks';
import PostContentContainer from '../PostContentContainer';
import { BasePostContent } from '../BasePostContent';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import Markdown from '../../Markdown';
import type { PostContentProps, PostNavigationProps } from '../common';
import { PostContainer } from '../common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useViewPost } from '../../../hooks/post/useViewPost';
import { DateFormat } from '../../utilities';
import { withPostById } from '../withPostById';
import { BriefPostHeaderActions } from './BriefPostHeaderActions';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Pill } from '../../Pill';
import { ChecklistAIcon, TimerIcon } from '../../icons';
import { CollectionPillSources } from '../collection/CollectionPillSources';
import { ProfileImageSize } from '../../ProfilePicture';
import { briefButtonBg, briefCardBg } from '../../../styles/custom';
import { plusUrl } from '../../../lib/constants';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { LogEvent, TargetId } from '../../../lib/log';
import { featurePlusCtaCopy } from '../../../lib/featureManagement';
import { LottieAnimation } from '../../LottieAnimation';
import { briefFeatureList, PlusList } from '../../plus/PlusList';
import { HourDropdown } from '../../fields/HourDropdown';
import { RadioItem } from '../../fields/RadioItem';
import { Checkbox } from '../../fields/Checkbox';
import { isNullOrUndefined } from '../../../lib/func';
import { briefSourcesLimit } from '../../../types';

const BriefPostContentRaw = ({
  post,
  className = {},
  shouldOnboardAuthor,
  origin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  customNavigation,
  backToSquad,
  isBannerVisible,
  isPostPage,
}: PostContentProps): ReactElement => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { user, isAuthReady } = useAuthContext();
  const isNotPlus = !isPlus && isAuthReady;
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: isNotPlus,
  });

  const { subject } = useToastNotification();
  const { updatedAt, createdAt, contentHtml } = post;
  const postsCount = post?.flags?.posts || 0;
  const sourcesCount = post?.flags?.sources || 0;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    '!max-w-3xl laptop:flex-row laptop:pb-0',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onClose,
    inlineActions,
  };

  const onSendViewPost = useViewPost();

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post?.id, onSendViewPost, user?.id]);

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible,
              className: className?.fixedNavigation,
            }
          : null
      }
    >
      <PostContainer
        className={classNames('relative', className?.content)}
        data-testid="postContainer"
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: classNames(
              className?.onboarding,
              backToSquad && 'mb-6',
            ),
            navigation: {
              actions: className?.navigation?.actions,
              container: classNames('pt-6', className?.navigation?.container),
            },
          }}
          isPostPage={isPostPage}
          isFallback={isFallback}
          customNavigation={customNavigation}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          origin={origin}
          post={post}
        >
          <div
            className={classNames(
              'mb-6 flex flex-col gap-6',
              hasNavigation || customNavigation ? 'mt-6' : 'mt-6 laptop:mt-0',
            )}
          >
            {/* TODO feat-brief this needs to somehow go inside PostNavigation on the right */}
            <BriefPostHeaderActions
              post={post}
              onClose={onClose}
              contextMenuId="post-widgets-context"
            />
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.LargeTitle}
                bold
                className="break-words"
                data-testid="post-modal-title"
              >
                {post.title}
              </Typography>
              <Typography type={TypographyType.Title3}>
                <DateFormat
                  date={updatedAt || createdAt}
                  type={TimeFormatType.Post}
                />
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                {[
                  post.flags?.generatedAt &&
                    `Brief completed in ${formatDate({
                      value: new Date(post.createdAt),
                      now: new Date(post.flags?.generatedAt),
                      type: TimeFormatType.LiveTimer,
                    })}`,
                  !!post.flags?.savedTime &&
                    `Save ${formatDate({
                      value: new Date(),
                      now: new Date(
                        Date.now() + post.flags.savedTime * 60 * 1000,
                      ),
                      type: TimeFormatType.LiveTimer,
                    })} of reading`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              {!isNullOrUndefined(post.readTime) && (
                <Pill
                  className="rounded-20 border border-border-subtlest-tertiary px-2.5 py-2"
                  label={
                    <div className="flex items-center gap-1">
                      <TimerIcon />
                      <Typography type={TypographyType.Footnote}>
                        {post.readTime}m read
                      </Typography>
                    </div>
                  }
                />
              )}
              <div className="flex items-center gap-1">
                {post.collectionSources?.length > 0 && (
                  <CollectionPillSources
                    alwaysShowSources
                    className={{
                      main: classNames('m-2'),
                    }}
                    sources={post.collectionSources}
                    totalSources={post.collectionSources.length}
                    size={ProfileImageSize.Size16}
                    limit={briefSourcesLimit}
                  />
                )}
                <Typography
                  className="flex flex-row gap-2"
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                >
                  {[
                    postsCount && `${postsCount} posts`,
                    sourcesCount && `${sourcesCount} sources`,
                  ]
                    .filter(Boolean)
                    .map((item, index) => {
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <Fragment key={index}>
                          {index > 0 ? ' • ' : undefined}
                          {item}
                        </Fragment>
                      );
                    })}
                </Typography>
              </div>
            </div>
            <Markdown content={contentHtml} />
            {isNotPlus && (
              <div className="flex w-full rounded-12 border border-white bg-transparent">
                <div
                  style={{
                    background: briefCardBg,
                  }}
                  className="flex w-full flex-col flex-wrap justify-between gap-3 rounded-12 border-4 border-black p-6"
                >
                  <LottieAnimation
                    className="-m-4 h-20 w-20"
                    src="/robot-loving.json"
                  />
                  <Typography type={TypographyType.Title2} bold>
                    You just got a taste of what daily.dev Plus can do
                  </Typography>
                  <Typography type={TypographyType.Callout}>
                    Fast, high-signal Briefs delivered straight to you by AI.
                    Want unlimited access? Let&apos;s make it official.
                  </Typography>
                  <PlusList
                    className="!p-0"
                    items={briefFeatureList}
                    icon={ChecklistAIcon}
                  />
                  <Link href={plusUrl} passHref legacyBehavior>
                    <Button
                      style={{
                        background: briefButtonBg,
                      }}
                      className="w-full"
                      tag="a"
                      type="button"
                      variant={ButtonVariant.Primary}
                      size={ButtonSize.Small}
                      onClick={() => {
                        logSubscriptionEvent({
                          event_name: LogEvent.UpgradeSubscription,
                          target_id: TargetId.Brief,
                        });
                      }}
                    >
                      {plusCta}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {isPlus && (
              <div className="flex w-full rounded-12 border border-white bg-transparent">
                <div
                  style={{
                    background: briefCardBg,
                  }}
                  className="flex w-full flex-col flex-wrap justify-between gap-3 rounded-12 border-4 border-black p-6"
                >
                  <Typography type={TypographyType.Title2} bold>
                    Set up your briefing
                  </Typography>
                  <Typography type={TypographyType.Callout}>
                    Setting up your briefing will update your current daily.dev
                    digest preferences. Your new configuration will determine
                    how, when, and where you receive updates going forward.
                  </Typography>
                  <HourDropdown
                    className={{
                      button: '!max-w-40',
                    }}
                    hourIndex={0}
                    setHourIndex={() => {
                      // TODO feat-brief save settings
                    }}
                  />
                  <RadioItem
                    className={{
                      wrapper: 'w-full',
                      content: 'flex-row-reverse justify-between !px-0',
                    }}
                    disabled={false}
                    name="vertical"
                    checked
                    onChange={() => {
                      // TODO feat-brief save settings
                    }}
                  >
                    Daily
                  </RadioItem>
                  <RadioItem
                    className={{
                      wrapper: 'w-full',
                      content: 'flex-row-reverse justify-between !px-0',
                    }}
                    disabled={false}
                    name="vertical"
                    checked={false}
                    onChange={() => {
                      // TODO feat-brief save settings
                    }}
                  >
                    Weekly
                  </RadioItem>
                  <Typography bold type={TypographyType.Callout}>
                    Receive via
                  </Typography>
                  <Checkbox
                    className="flex-row-reverse !px-0"
                    name="email"
                    checked={false}
                    onToggleCallback={() => {
                      // TODO feat-brief save settings
                    }}
                  >
                    Email
                  </Checkbox>
                  <Checkbox
                    className="flex-row-reverse !px-0"
                    name="in-app"
                    checked
                    onToggleCallback={() => {
                      // TODO feat-brief save settings
                    }}
                  >
                    In app
                  </Checkbox>
                  <Checkbox
                    className="flex-row-reverse !px-0"
                    name="slack"
                    checked
                    onToggleCallback={() => {
                      // TODO feat-brief save settings
                    }}
                  >
                    Slack
                  </Checkbox>
                  <Link href={plusUrl} passHref legacyBehavior>
                    <Button
                      style={{
                        background: briefButtonBg,
                      }}
                      className="w-full"
                      tag="a"
                      type="button"
                      variant={ButtonVariant.Primary}
                      size={ButtonSize.Small}
                      onClick={() => {
                        // TODO feat-brief save settings
                      }}
                    >
                      Save
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </BasePostContent>
      </PostContainer>
    </PostContentContainer>
  );
};

export const BriefPostContent = withPostById(BriefPostContentRaw);
