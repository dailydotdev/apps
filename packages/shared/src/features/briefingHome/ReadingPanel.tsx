import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { DrawerPosition } from '../../components/drawers/Drawer';
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
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { TOPIC_TOKEN, type StoryItem, type TopicDigest } from './types';
import { briefCopy } from './copy';

interface ReadingPanelProps {
  entity: StoryItem | TopicDigest;
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

const SectionHeader = ({
  icon,
  label,
  count,
}: {
  icon: ReactElement;
  label: string;
  count?: number;
}): ReactElement => (
  <div className="flex items-baseline gap-2">
    <span className="self-center text-text-tertiary">{icon}</span>
    <Typography type={TypographyType.Headline} bold>
      {label}
    </Typography>
    {typeof count === 'number' ? (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Quaternary}
        className="tabular-nums"
      >
        {count}
      </Typography>
    ) : null}
  </div>
);

const InlineStat = ({
  icon,
  value,
}: {
  icon: ReactElement;
  value: ReactElement | string | number;
}): ReactElement => (
  <span className="inline-flex items-center gap-1">
    {icon}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);

const StoryBody = ({ story }: { story: StoryItem }): ReactElement => {
  const minutes = estimateMinutes(
    story.summary + story.highlightedComments.map((c) => c.content).join(' '),
  );
  const summary = stripMd(story.summary).trim();
  const sourcesShown = story.sources.slice(0, 5);

  return (
    <article className="mx-auto flex w-full max-w-[42rem] flex-col gap-6">
      <header className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <HotIcon
            size={IconSize.XSmall}
            className="text-accent-ketchup-default"
            secondary
          />
          <Typography
            type={TypographyType.Caption2}
            bold
            className="uppercase tracking-[0.18em] text-accent-ketchup-default"
          >
            {briefCopy.leadEyebrow}
          </Typography>
        </div>

        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Title2}
          bold
          className="!leading-[1.15] tracking-[-0.02em]"
        >
          {story.title}
        </Typography>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-text-tertiary">
          <span className="inline-flex items-center -space-x-1.5">
            {sourcesShown.map((src) => (
              <span
                key={src.sourceId}
                className="overflow-hidden rounded-full border-2 border-background-default bg-surface-float"
              >
                <img
                  src={src.sourceImage}
                  alt=""
                  loading="lazy"
                  className="size-5 object-cover"
                />
              </span>
            ))}
          </span>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {briefCopy.panelMeta(
              story.sources.length,
              story.highlightedComments.length + story.sources.length,
            )}
          </Typography>
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <InlineStat
            icon={
              <TimerIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
            }
            value={briefCopy.storyReadTime(minutes)}
          />
          <InlineStat
            icon={
              <UpvoteIcon
                size={IconSize.XSmall}
                className="text-accent-avocado-default"
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
      </header>

      <section className="rounded-12 border border-border-subtlest-quaternary bg-surface-float p-4">
        <Typography
          type={TypographyType.Caption2}
          bold
          className="mb-2 uppercase tracking-[0.14em] text-text-tertiary"
        >
          {briefCopy.tldrTag}
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
          <SectionHeader
            icon={<DiscussIcon size={IconSize.XSmall} secondary />}
            label={briefCopy.conversationLabel}
            count={story.highlightedComments.length}
          />
          <ul className="flex flex-col gap-2">
            {story.highlightedComments.slice(0, 3).map((c) => (
              <li
                key={c.username}
                className="rounded-12 border border-border-subtlest-quaternary p-3"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <img
                    src={c.userImage}
                    alt=""
                    loading="lazy"
                    className="size-6 rounded-full object-cover"
                  />
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Primary}
                    bold
                  >
                    @{c.username}
                  </Typography>
                  <InlineStat
                    icon={
                      <UpvoteIcon
                        size={IconSize.XXSmall}
                        className="text-accent-avocado-default"
                      />
                    }
                    value={c.upvotes}
                  />
                </div>
                <Typography
                  type={TypographyType.Footnote}
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

      <section className="flex flex-col gap-3">
        <SectionHeader
          icon={<TrendingIcon size={IconSize.XSmall} secondary />}
          label="Posts in this thread"
          count={story.posts.length}
        />
        <ul className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
          {story.posts.map((p) => (
            <li key={p.id}>
              <a
                href={`https://app.daily.dev/posts/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-start gap-3 rounded-10 border border-border-subtlest-quaternary p-3 transition-colors hover:border-border-subtlest-tertiary hover:bg-surface-float"
              >
                {p.image ? (
                  <div className="size-12 shrink-0 overflow-hidden rounded-8 bg-surface-float">
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Footnote}
                    bold
                    color={TypographyColor.Primary}
                    className="line-clamp-2 !leading-snug transition-colors group-hover:text-brand-default"
                  >
                    {p.title}
                  </Typography>
                  <div className="flex items-center gap-3">
                    <InlineStat
                      icon={
                        <UpvoteIcon
                          size={IconSize.XXSmall}
                          className="text-accent-avocado-default"
                        />
                      }
                      value={p.upvotes}
                    />
                    <InlineStat
                      icon={
                        <DiscussIcon
                          size={IconSize.XXSmall}
                          className="text-text-tertiary"
                        />
                      }
                      value={p.comments}
                    />
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

const TopicBody = ({ topic }: { topic: TopicDigest }): ReactElement => {
  const minutes = estimateMinutes(
    topic.tldr + topic.content.replace(/<[^>]+>/g, ' '),
  );

  return (
    <article className="mx-auto flex w-full max-w-[42rem] flex-col gap-6">
      <header className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <EyeIcon
            size={IconSize.XSmall}
            className={TOPIC_TOKEN[topic.topic]}
            secondary
          />
          <Typography
            type={TypographyType.Caption2}
            bold
            className={classNames(
              'uppercase tracking-[0.18em]',
              TOPIC_TOKEN[topic.topic],
            )}
          >
            {topic.topic}
          </Typography>
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {briefCopy.topicWeekly}
          </Typography>
        </div>

        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Title2}
          bold
          className="!leading-[1.15] tracking-[-0.02em]"
        >
          {topic.title}
        </Typography>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-text-tertiary">
          <InlineStat
            icon={
              <TimerIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
            }
            value={briefCopy.storyReadTime(minutes)}
          />
        </div>
      </header>

      <section className="rounded-12 border border-border-subtlest-quaternary bg-surface-float p-4">
        <Typography
          type={TypographyType.Caption2}
          bold
          className="mb-2 uppercase tracking-[0.14em] text-text-tertiary"
        >
          {briefCopy.tldrTag}
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

      <div
        className={classNames(
          'flex flex-col text-text-secondary',
          '[&_h2]:typo-headline [&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:font-bold [&_h2]:!leading-snug [&_h2]:!text-text-primary',
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

  return (
    <Modal
      isOpen
      onRequestClose={onClose}
      kind={ModalKind.FlexibleTop}
      size={ModalSize.Large}
      shouldCloseOnOverlayClick
      overlayClassName="bg-overlay-quaternary-onion"
      isDrawerOnMobile
      drawerProps={{
        position: DrawerPosition.Bottom,
        isFullScreen: true,
      }}
      className="!items-stretch overflow-hidden !bg-background-default tablet:!max-h-[calc(100vh-6rem)]"
    >
      <header className="z-1 flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b border-border-subtlest-quaternary bg-background-default px-2 tablet:px-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onPrev}
            aria-label={briefCopy.panelPrev}
          >
            <span className="hidden tablet:inline">{briefCopy.panelPrev}</span>
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            onClick={onNext}
            aria-label={briefCopy.panelNext}
          >
            <span className="hidden tablet:inline">{briefCopy.panelNext}</span>
          </Button>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MiniCloseIcon />}
          onClick={onClose}
          aria-label={briefCopy.panelClose}
        />
      </header>
      <div className="min-h-0 w-full flex-1 overflow-y-auto px-4 py-6 tablet:px-6 tablet:py-7">
        {entity.kind === 'story' ? (
          <StoryBody story={entity} />
        ) : (
          <TopicBody topic={entity} />
        )}
      </div>
    </Modal>
  );
};
