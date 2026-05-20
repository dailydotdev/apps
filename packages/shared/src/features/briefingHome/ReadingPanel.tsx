import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { DrawerPosition } from '../../components/drawers/Drawer';
import basePostModalStyles from '../../components/modals/BasePostModal.module.css';
import { PostContainer } from '../../components/post/common';
import { PageWidgets } from '../../components/utilities/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  ArrowIcon,
  MiniCloseIcon,
  UpvoteIcon,
  DiscussIcon,
  HotIcon,
  EyeIcon,
  TimerIcon,
  TrendingIcon,
  OpenLinkIcon,
  LinkIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  TOPIC_BORDER_TOKEN,
  TOPIC_TOKEN,
  type StoryItem,
  type TopicDigest,
} from './types';

export type EntityKind = 'lead' | 'read' | 'topic';

interface ReadingPanelProps {
  entity: StoryItem | TopicDigest;
  entityKind: EntityKind;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1');

const estimateMinutes = (text: string): number =>
  Math.max(2, Math.round(text.split(/\s+/).filter(Boolean).length / 220));

interface EyebrowConfig {
  icon: ReactElement;
  label: string;
  colorClass: string;
}

const storyEyebrow = (kind: 'lead' | 'read'): EyebrowConfig =>
  kind === 'lead'
    ? {
        icon: (
          <HotIcon
            size={IconSize.XSmall}
            secondary
            className="text-accent-ketchup-default"
          />
        ),
        label: 'Top story',
        colorClass: 'text-accent-ketchup-default',
      }
    : {
        icon: (
          <TrendingIcon
            size={IconSize.XSmall}
            secondary
            className="text-accent-cabbage-default"
          />
        ),
        label: 'Trending discussion',
        colorClass: 'text-accent-cabbage-default',
      };

const topicEyebrow = (topic: TopicDigest): EyebrowConfig => ({
  icon: (
    <EyeIcon
      size={IconSize.XSmall}
      secondary
      className={TOPIC_TOKEN[topic.topic]}
    />
  ),
  label: topic.topic,
  colorClass: TOPIC_TOKEN[topic.topic],
});

const Eyebrow = ({ config }: { config: EyebrowConfig }): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1.5 rounded-8 px-2 py-1',
      'bg-surface-float',
    )}
  >
    {config.icon}
    <Typography
      type={TypographyType.Caption2}
      bold
      className={classNames('uppercase tracking-[0.16em]', config.colorClass)}
    >
      {config.label}
    </Typography>
  </span>
);

const InlineStat = ({
  icon,
  value,
  bold = true,
}: {
  icon: ReactElement;
  value: ReactElement | string | number;
  bold?: boolean;
}): ReactElement => (
  <span className="inline-flex items-center gap-1">
    {icon}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold={bold}
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);

const SidebarBlock = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3 rounded-12 border border-border-subtlest-quaternary bg-background-default p-4">
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Tertiary}
      bold
      className="uppercase tracking-[0.16em]"
    >
      {title}
    </Typography>
    {children}
  </section>
);

const CopyLinkButton = ({ url }: { url: string }): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }, [url]);

  return (
    <Button
      type="button"
      variant={ButtonVariant.Subtle}
      size={ButtonSize.Small}
      icon={<LinkIcon />}
      onClick={handleCopy}
      className="!w-full"
    >
      {copied ? 'Link copied' : 'Copy link'}
    </Button>
  );
};

const SourcePostCard = ({
  post,
}: {
  post: StoryItem['posts'][number];
}): ReactElement => (
  <a
    href={`https://app.daily.dev/posts/${post.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="group -mx-2 flex items-start gap-3 rounded-10 p-2 transition-colors hover:bg-surface-float"
  >
    {post.image ? (
      <div className="size-12 shrink-0 overflow-hidden rounded-8 bg-surface-float">
        <img
          src={post.image}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    ) : null}
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        bold
        color={TypographyColor.Primary}
        className="line-clamp-2 !leading-snug"
      >
        {post.title}
      </Typography>
      <div className="flex items-center gap-3">
        <InlineStat
          icon={
            <UpvoteIcon
              size={IconSize.XXSmall}
              className="text-text-tertiary"
            />
          }
          value={post.upvotes}
        />
        <InlineStat
          icon={
            <DiscussIcon
              size={IconSize.XXSmall}
              className="text-text-tertiary"
            />
          }
          value={post.comments}
        />
        <OpenLinkIcon
          size={IconSize.XXSmall}
          className="ml-auto text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  </a>
);

const Sidebar = ({
  entity,
  shareUrl,
}: {
  entity: StoryItem | TopicDigest;
  shareUrl: string;
}): ReactElement => {
  const isStory = entity.kind === 'story';
  return (
    <>
      {isStory ? (
        <>
          <SidebarBlock title={`Sources · ${entity.posts.length}`}>
            <ul className="flex flex-col">
              {entity.posts.map((p) => (
                <li key={p.id}>
                  <SourcePostCard post={p} />
                </li>
              ))}
            </ul>
          </SidebarBlock>
          {entity.sources.length > 0 ? (
            <SidebarBlock title="Contributing voices">
              <ul className="flex flex-col gap-2">
                {entity.sources.map((src) => (
                  <li key={src.sourceId} className="flex items-center gap-2">
                    <img
                      src={src.sourceImage}
                      alt=""
                      loading="lazy"
                      className="size-6 shrink-0 rounded-full bg-surface-float object-cover"
                    />
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Primary}
                      className="truncate"
                    >
                      {src.sourceName}
                    </Typography>
                  </li>
                ))}
              </ul>
            </SidebarBlock>
          ) : null}
        </>
      ) : (
        <SidebarBlock title="About this digest">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="!leading-relaxed"
          >
            A weekly roundup of what shifted in {entity.topic}. Curated from
            community discussions, releases, and notable writeups.
          </Typography>
        </SidebarBlock>
      )}
      <SidebarBlock title="Share">
        <CopyLinkButton url={shareUrl} />
      </SidebarBlock>
    </>
  );
};

const StoryBody = ({
  story,
  kind,
}: {
  story: StoryItem;
  kind: 'lead' | 'read';
}): ReactElement => {
  const minutes = estimateMinutes(
    story.summary + story.highlightedComments.map((c) => c.content).join(' '),
  );
  const summary = stripMd(story.summary).trim();
  const eyebrow = storyEyebrow(kind);
  const heroImage = story.posts.find((p) => p.image)?.image;

  return (
    <article className="flex w-full min-w-0 flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow config={eyebrow} />
          <InlineStat
            icon={
              <TimerIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
            }
            value={`${minutes} min read`}
            bold={false}
          />
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <InlineStat
            icon={
              <UpvoteIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
            }
            value={story.totalUpvotes}
          />
          <InlineStat
            icon={
              <DiscussIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
            }
            value={story.totalComments}
          />
        </div>

        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className="!leading-[1.1] tracking-[-0.02em]"
        >
          {story.title}
        </Typography>
      </header>

      {heroImage ? (
        <div className="block h-auto w-full overflow-hidden rounded-12">
          <img
            src={heroImage}
            alt=""
            loading="lazy"
            className="block w-full object-cover"
          />
        </div>
      ) : null}

      <section
        aria-label="Summary"
        className={classNames(
          'rounded-12 border-l-2 bg-surface-float py-4 pl-5 pr-5',
          kind === 'lead'
            ? 'border-accent-ketchup-default'
            : 'border-accent-cabbage-default',
        )}
      >
        <Typography
          type={TypographyType.Caption2}
          bold
          className={classNames(
            'mb-2 uppercase tracking-[0.16em]',
            eyebrow.colorClass,
          )}
        >
          The takeaway
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          className="!leading-relaxed"
        >
          {summary}
        </Typography>
      </section>

      {story.highlightedComments.length > 0 ? (
        <section className="flex flex-col gap-3">
          <Typography
            type={TypographyType.Title4}
            bold
            color={TypographyColor.Primary}
          >
            What people are saying
          </Typography>
          <ul className="flex flex-col gap-3">
            {story.highlightedComments.slice(0, 3).map((c) => (
              <li
                key={c.username}
                className="rounded-12 border border-border-subtlest-quaternary bg-background-default p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src={c.userImage}
                    alt=""
                    loading="lazy"
                    className="size-7 rounded-full object-cover"
                  />
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Primary}
                    bold
                  >
                    @{c.username}
                  </Typography>
                  <span className="ml-auto inline-flex items-center gap-1">
                    <UpvoteIcon
                      size={IconSize.XXSmall}
                      className="text-text-tertiary"
                    />
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      bold
                      className="tabular-nums"
                    >
                      {c.upvotes}
                    </Typography>
                  </span>
                </div>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                  className="!leading-relaxed"
                >
                  {stripMd(c.content)}
                </Typography>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
};

const TopicBody = ({ topic }: { topic: TopicDigest }): ReactElement => {
  const minutes = estimateMinutes(
    topic.tldr + topic.content.replace(/<[^>]+>/g, ' '),
  );
  const eyebrow = topicEyebrow(topic);

  return (
    <article className="flex w-full min-w-0 flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow config={eyebrow} />
          <InlineStat
            icon={
              <TimerIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
            }
            value={`${minutes} min read`}
            bold={false}
          />
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Weekly digest
          </Typography>
        </div>

        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className="!leading-[1.1] tracking-[-0.02em]"
        >
          {topic.title}
        </Typography>
      </header>

      <section
        aria-label="Summary"
        className={classNames(
          'rounded-12 border-l-2 bg-surface-float py-4 pl-5 pr-5',
          TOPIC_BORDER_TOKEN[topic.topic],
        )}
      >
        <Typography
          type={TypographyType.Caption2}
          bold
          className={classNames(
            'mb-2 uppercase tracking-[0.16em]',
            eyebrow.colorClass,
          )}
        >
          This week
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          className="!leading-relaxed"
        >
          {topic.tldr}
        </Typography>
      </section>

      <section
        className={classNames(
          'flex flex-col text-text-secondary',
          '[&_h2]:typo-title4 [&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:font-bold [&_h2]:!leading-snug [&_h2]:!text-text-primary',
          '[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-bold [&_h3]:!text-text-primary [&_h3]:typo-callout',
          '[&_p]:my-2 [&_p]:!leading-relaxed [&_p]:typo-callout',
          '[&_ul]:my-2 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-5',
          '[&_ol]:my-2 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-1 [&_ol]:pl-5',
          '[&_li]:!leading-relaxed [&_li]:typo-callout',
          '[&_strong]:font-bold [&_strong]:!text-text-primary',
          '[&_a]:text-brand-default [&_a]:underline hover:[&_a]:text-brand-hover',
          '[&_code]:rounded-6 [&_code]:bg-surface-float [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:!text-text-primary [&_code]:typo-footnote',
          '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border-subtlest-tertiary [&_blockquote]:pl-3 [&_blockquote]:italic',
        )}
        // mock content is trusted at build time
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: topic.content }}
      />
    </article>
  );
};

export const ReadingPanel = ({
  entity,
  entityKind,
  onNext,
  onPrev,
  onClose,
}: ReadingPanelProps): ReactElement => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      }
      if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext, onPrev]);

  const shareUrl =
    entity.kind === 'story'
      ? `https://app.daily.dev/posts/${entity.posts[0]?.id ?? entity.id}`
      : `https://app.daily.dev/tags/${entity.topic.toLowerCase()}`;

  return (
    <Modal
      isOpen
      onRequestClose={onClose}
      kind={ModalKind.FlexibleTop}
      size={ModalSize.XLarge}
      shouldCloseOnOverlayClick
      portalClassName={basePostModalStyles.postModal}
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
      isDrawerOnMobile
      drawerProps={{
        position: DrawerPosition.Bottom,
        isFullScreen: true,
      }}
      className="mx-auto !bg-background-default focus:outline-none tablet:h-full laptop:!mt-2 laptop:h-auto laptop:overflow-hidden"
    >
      <header className="z-1 flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b border-border-subtlest-tertiary bg-background-default px-2 tablet:px-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onPrev}
            aria-label="Previous"
          >
            <span className="hidden tablet:inline">Previous</span>
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            onClick={onNext}
            aria-label="Next"
          >
            <span className="hidden tablet:inline">Next</span>
          </Button>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MiniCloseIcon />}
          onClick={onClose}
          aria-label="Close"
        />
      </header>
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-background-default pb-6 laptop:flex-row laptop:pb-0">
        <PostContainer className="relative">
          <div className="flex flex-col gap-6 pb-6 pt-6">
            {entity.kind === 'story' ? (
              <StoryBody
                story={entity}
                kind={entityKind === 'lead' ? 'lead' : 'read'}
              />
            ) : (
              <TopicBody topic={entity} />
            )}
          </div>
        </PostContainer>
        <PageWidgets className="pb-8 pt-6">
          <Sidebar entity={entity} shareUrl={shareUrl} />
        </PageWidgets>
      </div>
    </Modal>
  );
};
