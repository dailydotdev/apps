import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  SendType,
  ToastSubject,
  useActions,
  useConditionalFeature,
  usePersonalizedDigest,
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
import { withPostById } from '../withPostById';
import { BriefPostHeaderActions } from './BriefPostHeaderActions';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Pill } from '../../Pill';
import { ChecklistAIcon, OpenLinkIcon, TimerIcon } from '../../icons';
import { CollectionPillSources } from '../collection/CollectionPillSources';
import { ProfileImageSize } from '../../ProfilePicture';
import { briefButtonBg, briefCardBg } from '../../../styles/custom';
import { plusUrl } from '../../../lib/constants';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { LogEvent, TargetId } from '../../../lib/log';
import { featurePlusCtaCopy } from '../../../lib/featureManagement';
import { LottieAnimation } from '../../LottieAnimation';
import { briefFeatureList, PlusList } from '../../plus/PlusList';
import { HourDropdown } from '../../fields/HourDropdown';
import { RadioItem } from '../../fields/RadioItem';
import { Checkbox } from '../../fields/Checkbox';
import { isNullOrUndefined } from '../../../lib/func';
import type { PropsParameters } from '../../../types';
import { BRIEFING_SOURCE, briefSourcesLimit, PostType } from '../../../types';
import type { UserPersonalizedDigest } from '../../../graphql/users';
import { UserPersonalizedDigestType } from '../../../graphql/users';
import { useLogContext } from '../../../contexts/LogContext';
import { sourceQueryOptions } from '../../../graphql/sources';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { getPathnameWithQuery } from '../../../lib/links';
import { LazyModal } from '../../modals/common/types';
import { getFirstName } from '../../../lib/user';
import { labels } from '../../../lib';
import Link from '../../utilities/Link';
import { ActionType } from '../../../graphql/actions';

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
  const { completeAction } = useActions();
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
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
  const { contentHtml } = post;
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

  const { getPersonalizedDigest, subscribePersonalizedDigest } =
    usePersonalizedDigest();
  const [digestTimeIndex, setDigestTimeIndex] = useState<number | undefined>(8);

  const briefDigest = getPersonalizedDigest(UserPersonalizedDigestType.Brief);

  const { data: briefingSource } = useQuery({
    ...sourceQueryOptions({ sourceId: BRIEFING_SOURCE }),
    enabled: briefDigest?.type === UserPersonalizedDigestType.Brief,
  });

  if (
    !isNullOrUndefined(briefDigest) &&
    briefDigest?.preferredHour !== digestTimeIndex
  ) {
    setDigestTimeIndex(briefDigest?.preferredHour);
  }

  const onSubscribeDigest = async ({
    sendType,
    flags,
    preferredHour,
  }: Partial<{
    type: UserPersonalizedDigestType;
    sendType: SendType;
    flags: Pick<UserPersonalizedDigest['flags'], 'email' | 'slack'>;
    preferredHour: number;
  }>): Promise<void> => {
    const params: PropsParameters<typeof subscribePersonalizedDigest> = {
      type: UserPersonalizedDigestType.Brief,
      sendType: sendType ?? briefDigest?.flags?.sendType,
      flags: {
        email: flags?.email ?? briefDigest?.flags?.email,
        slack: flags?.slack ?? briefDigest?.flags?.slack,
      },
      hour: preferredHour ?? briefDigest?.preferredHour,
    };

    logEvent({
      event_name: LogEvent.ScheduleDigest,
      extra: JSON.stringify({
        hour: params.hour,
        timezone: user?.timezone,
        frequency: params.sendType,
        type: params.type,
      }),
    });

    await subscribePersonalizedDigest(params);
  };

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post?.id, onSendViewPost, user?.id]);

  const shouldManageSlack = router?.query?.lzym === LazyModal.SlackIntegration;

  useEffect(() => {
    if (!shouldManageSlack || !briefingSource) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('lzym');

    router?.replace(
      router?.pathname,
      getPathnameWithQuery(`/posts/${post.slug}`, searchParams),
      {
        shallow: true,
      },
    );

    openModal({
      type: LazyModal.SlackIntegration,
      props: {
        source: briefingSource,
        redirectPath: getPathnameWithQuery(
          `/posts/${post.slug}`,
          new URLSearchParams({
            lzym: LazyModal.SlackIntegration,
          }),
        ),
        introTitle: labels.integrations.briefIntro.title,
        introDescription: labels.integrations.briefIntro.description,
      },
    });
  }, [shouldManageSlack, briefingSource, openModal, router, post?.slug]);

  useEffect(() => {
    if (post?.type !== PostType.Brief) {
      return;
    }

    completeAction(ActionType.GeneratedBrief);
  }, [completeAction, post?.type]);

  let authorFirstName = getFirstName(post.author?.name);

  if (authorFirstName) {
    authorFirstName = `${authorFirstName}'s`;
  }

  if (!authorFirstName && post.author && user?.id === post.author.id) {
    authorFirstName = 'Your';
  }

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
              hasNavigation || customNavigation ? 'mt-6' : 'mt-0',
            )}
          >
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
                {authorFirstName
                  ? `${authorFirstName} presidential briefing`
                  : 'Presidential briefing'}
              </Typography>
              <Typography type={TypographyType.Title3}>{post.title}</Typography>
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
            <div className="flex flex-wrap items-center gap-3 mobileXL:flex-nowrap">
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
              <div className="flex w-full items-center gap-1">
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
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                  truncate
                >
                  {`Based on ${postsCount ?? 0} posts from ${
                    sourcesCount ?? 0
                  } sources`}
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
                    Fast, high-signal briefings delivered straight to you by
                    your personal AI agent. Want unlimited access? Let&apos;s
                    make it official.
                  </Typography>
                  <PlusList
                    className="!p-0"
                    items={briefFeatureList}
                    icon={ChecklistAIcon}
                  />
                  <Link href={plusUrl} passHref>
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
            {post?.content && isPlus && (
              <div className="flex w-full rounded-12 border border-white bg-transparent">
                <div
                  style={{
                    background: briefCardBg,
                  }}
                  className="flex w-full flex-col flex-wrap justify-between gap-3 rounded-12 border-4 border-black p-6"
                >
                  <Typography type={TypographyType.Title2} bold>
                    Customize your presidential briefing
                  </Typography>
                  <Typography type={TypographyType.Callout}>
                    Update how, when, and where you receive your briefings. This
                    will replace your current daily.dev digest settings. You can
                    tweak it anytime via settings.
                  </Typography>
                  <HourDropdown
                    className={{
                      button: '!max-w-40',
                    }}
                    hourIndex={digestTimeIndex}
                    setHourIndex={(index) => {
                      onSubscribeDigest({
                        preferredHour: index,
                      });
                    }}
                  />
                  <RadioItem
                    className={{
                      wrapper: 'w-full',
                      content: 'flex-row-reverse justify-between !px-0',
                    }}
                    disabled={false}
                    name="daily"
                    checked={briefDigest?.flags?.sendType === SendType.Daily}
                    onChange={() => {
                      onSubscribeDigest({
                        sendType: SendType.Daily,
                      });
                    }}
                  >
                    Auto-generate daily
                  </RadioItem>
                  <RadioItem
                    className={{
                      wrapper: 'w-full',
                      content: 'flex-row-reverse justify-between !px-0',
                    }}
                    name="workdays"
                    checked={briefDigest?.flags?.sendType === SendType.Workdays}
                    onChange={() => {
                      onSubscribeDigest({
                        sendType: SendType.Workdays,
                      });
                    }}
                  >
                    Auto-generate on workdays
                  </RadioItem>
                  <RadioItem
                    className={{
                      wrapper: 'w-full',
                      content: 'flex-row-reverse justify-between !px-0',
                    }}
                    name="weekly"
                    checked={briefDigest?.flags?.sendType === SendType.Weekly}
                    onChange={() => {
                      onSubscribeDigest({
                        sendType: SendType.Weekly,
                      });
                    }}
                  >
                    Auto-generate weekly
                  </RadioItem>
                  <Typography bold type={TypographyType.Callout}>
                    Receive via
                  </Typography>
                  <Checkbox
                    className="flex-row-reverse !px-0"
                    name="in-app"
                    disabled
                    checked={!!briefDigest}
                  >
                    In app (always active)
                  </Checkbox>
                  <Checkbox
                    className="flex-row-reverse !px-0"
                    name="email"
                    checked={!!briefDigest?.flags?.email}
                    onToggleCallback={(checked) => {
                      onSubscribeDigest({
                        flags: {
                          email: checked,
                        },
                      });
                    }}
                  >
                    Email
                  </Checkbox>
                  <Checkbox
                    className="flex-row-reverse !px-0"
                    name="slack"
                    checked={!!briefDigest?.flags?.slack}
                    onToggleCallback={(checked) => {
                      onSubscribeDigest({
                        flags: {
                          slack: checked,
                        },
                      });
                    }}
                  >
                    Slack
                    {!!briefDigest?.flags.slack && !!briefingSource && (
                      <Button
                        className="absolute bottom-0 right-12 top-0"
                        type="text"
                        size={ButtonSize.Small}
                        variant={ButtonVariant.Subtle}
                        iconPosition={ButtonIconPosition.Right}
                        icon={<OpenLinkIcon />}
                        onClick={() => {
                          openModal({
                            type: LazyModal.SlackIntegration,
                            props: {
                              source: briefingSource,
                              redirectPath: getPathnameWithQuery(
                                `/posts/${post.slug}`,
                                new URLSearchParams({
                                  lzym: LazyModal.SlackIntegration,
                                }),
                              ),
                              introTitle: labels.integrations.briefIntro.title,
                              introDescription:
                                labels.integrations.briefIntro.description,
                            },
                          });
                        }}
                      >
                        Manage integrations
                      </Button>
                    )}
                  </Checkbox>
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
