import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { Drawer, DrawerPosition } from '../../components/drawers/Drawer';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  ArrowIcon,
  MiniCloseIcon,
  UpvoteIcon,
  DiscussIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { useViewSize, ViewSize } from '../../hooks';
import {
  TOPIC_BG_TOKEN,
  TOPIC_TOKEN,
  type StoryItem,
  type TopicDigest,
} from './types';
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

const StoryBody = ({ story }: { story: StoryItem }): ReactElement => (
  <div className="flex flex-col gap-6">
    <header>
      <Typography
        type={TypographyType.Caption2}
        bold
        color={TypographyColor.Brand}
        className="mb-2 uppercase tracking-[0.18em]"
      >
        {briefCopy.leadEyebrow}
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        bold
        className="!leading-tight tracking-[-0.02em]"
      >
        {story.title}
      </Typography>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-text-tertiary">
        <span className="inline-flex items-center gap-1">
          <UpvoteIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {story.totalUpvotes}
          </Typography>
        </span>
        <span className="inline-flex items-center gap-1">
          <DiscussIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {story.totalComments}
          </Typography>
        </span>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {story.sources.length} sources
        </Typography>
      </div>
    </header>

    <section className="rounded-12 border-l-2 border-brand-default bg-brand-float p-4">
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Brand}
        bold
        className="mb-2 uppercase tracking-[0.14em]"
      >
        {briefCopy.tldrTag}
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        className="!leading-relaxed"
      >
        {story.summary}
      </Typography>
    </section>

    {story.highlightedComments.length > 0 ? (
      <section>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          bold
          className="mb-3 uppercase tracking-[0.14em]"
        >
          {briefCopy.conversationLabel}
        </Typography>
        <ul className="flex flex-col gap-4">
          {story.highlightedComments.slice(0, 3).map((c) => (
            <li key={c.username} className="flex gap-3">
              <img
                src={c.userImage}
                alt=""
                loading="lazy"
                className="size-8 rounded-full object-cover"
              />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                    bold
                  >
                    @{c.username}
                  </Typography>
                  <span className="inline-flex items-center gap-1 text-accent-avocado-default">
                    <UpvoteIcon size={IconSize.XXSmall} />
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Quaternary}
                    >
                      {c.upvotes}
                    </Typography>
                  </span>
                </div>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                  className="!leading-snug"
                >
                  {stripMd(c.content)}
                </Typography>
              </div>
            </li>
          ))}
        </ul>
      </section>
    ) : null}

    <section>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        bold
        className="mb-3 uppercase tracking-[0.14em]"
      >
        {briefCopy.threadLabel(story.posts.length)}
      </Typography>
      <ul className="flex flex-col gap-2">
        {story.posts.map((p) => (
          <li key={p.id}>
            <a
              href={`https://app.daily.dev/posts/${p.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-10 p-2 transition-colors hover:bg-surface-float"
            >
              {p.image ? (
                <div className="size-14 shrink-0 overflow-hidden rounded-8 bg-surface-float">
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Primary}
                  className="line-clamp-2 !leading-snug transition-colors group-hover:text-brand-default"
                >
                  {p.title}
                </Typography>
                <div className="mt-1 flex items-center gap-3 text-text-quaternary">
                  <span className="inline-flex items-center gap-1">
                    <UpvoteIcon size={IconSize.XXSmall} />
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Quaternary}
                    >
                      {p.upvotes}
                    </Typography>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DiscussIcon size={IconSize.XXSmall} />
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Quaternary}
                    >
                      {p.comments}
                    </Typography>
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  </div>
);

const TopicBody = ({ topic }: { topic: TopicDigest }): ReactElement => (
  <div className="flex flex-col gap-5">
    <header>
      <Typography
        type={TypographyType.Caption2}
        bold
        className={`mb-2 uppercase tracking-[0.18em] ${
          TOPIC_TOKEN[topic.topic]
        }`}
      >
        {topic.topic} · {briefCopy.topicWeekly}
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        bold
        className="!leading-tight tracking-[-0.02em]"
      >
        {topic.title}
      </Typography>
    </header>
    <section
      className={`rounded-12 border-l-2 p-4 ${TOPIC_BG_TOKEN[topic.topic]}`}
    >
      <Typography
        type={TypographyType.Caption2}
        bold
        className={`mb-2 uppercase tracking-[0.14em] ${
          TOPIC_TOKEN[topic.topic]
        }`}
      >
        {briefCopy.tldrTag}
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        className="!leading-relaxed"
      >
        {topic.tldr}
      </Typography>
    </section>
    <div
      className="prose prose-sm max-w-none text-text-tertiary [&_code]:rounded-4 [&_code]:bg-surface-float [&_code]:px-1 [&_code]:text-text-primary [&_h2]:mb-1 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-text-primary [&_li]:my-1 [&_p]:my-2 [&_strong]:text-text-primary [&_ul]:list-disc [&_ul]:pl-5"
      // mock content is trusted HTML at build time
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: topic.content }}
    />
  </div>
);

export const ReadingPanel = ({
  entity,
  onNext,
  onPrev,
  onClose,
}: ReadingPanelProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowRight') {
        onNext();
      }
      if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNext, onPrev]);

  return (
    <Drawer
      isOpen
      position={isMobile ? DrawerPosition.Bottom : DrawerPosition.Right}
      isFullScreen={isMobile}
      onClose={onClose}
      closeOnOutsideClick
      className={{
        drawer: isMobile
          ? 'flex max-h-[92vh] w-full flex-col'
          : 'flex h-full w-full max-w-[28rem] flex-col',
        overlay: 'bg-overlay-quaternary-onion',
      }}
    >
      <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onPrev}
            aria-label={briefCopy.panelPrev}
          />
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-90" />}
            onClick={onNext}
            aria-label={briefCopy.panelNext}
          />
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MiniCloseIcon />}
          onClick={onClose}
          aria-label={briefCopy.panelClose}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {entity.kind === 'story' ? (
          <StoryBody story={entity} />
        ) : (
          <TopicBody topic={entity} />
        )}
      </div>
    </Drawer>
  );
};
