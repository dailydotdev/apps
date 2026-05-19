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
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
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

const estimateMinutes = (text: string): number =>
  Math.max(2, Math.round(text.split(/\s+/).filter(Boolean).length / 220));

const PanelEyebrow = ({
  icon,
  label,
  color,
  minutes,
}: {
  icon: ReactElement;
  label: string;
  color: string;
  minutes: number;
}): ReactElement => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      {icon}
      <Typography
        type={TypographyType.Caption2}
        bold
        className={classNames('uppercase tracking-[0.18em]', color)}
      >
        {label}
      </Typography>
    </div>
    <span className="inline-flex items-center gap-1 text-text-tertiary">
      <TimerIcon size={IconSize.XSmall} />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        bold
      >
        {briefCopy.storyReadTime(minutes)}
      </Typography>
    </span>
  </div>
);

const StoryBody = ({ story }: { story: StoryItem }): ReactElement => {
  const minutes = estimateMinutes(
    story.summary + story.highlightedComments.map((c) => c.content).join(' '),
  );
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <PanelEyebrow
          icon={
            <span className="bg-accent-ketchup-default/15 inline-grid size-5 place-items-center rounded-full text-accent-ketchup-default">
              <HotIcon size={IconSize.XXSmall} secondary />
            </span>
          }
          label={briefCopy.leadEyebrow}
          color="text-accent-ketchup-default"
          minutes={minutes}
        />
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
          bold
          className="!leading-[1.1] tracking-[-0.025em]"
        >
          {story.title}
        </Typography>
        <div className="flex flex-wrap items-center gap-3 text-text-tertiary">
          <span className="inline-flex items-center gap-1">
            <UpvoteIcon
              size={IconSize.XXSmall}
              className="text-accent-avocado-default"
            />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
            >
              {story.totalUpvotes}
            </Typography>
          </span>
          <span className="inline-flex items-center gap-1">
            <DiscussIcon size={IconSize.XXSmall} />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
            >
              {story.totalComments}
            </Typography>
          </span>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            {briefCopy.panelMeta(
              story.sources.length,
              story.highlightedComments.length + story.sources.length,
            )}
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
          {stripMd(story.summary)}
        </Typography>
      </section>

      {story.highlightedComments.length > 0 ? (
        <section>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Primary}
            bold
            className="mb-3 uppercase tracking-[0.14em]"
          >
            {briefCopy.conversationLabel}
          </Typography>
          <ul className="flex flex-col gap-4">
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
                  <span className="inline-flex items-center gap-1 text-accent-avocado-default">
                    <UpvoteIcon size={IconSize.XXSmall} />
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Tertiary}
                      bold
                    >
                      {c.upvotes}
                    </Typography>
                  </span>
                </div>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                  className="!leading-snug"
                >
                  {stripMd(c.content)}
                </Typography>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Primary}
          bold
          className="mb-3 uppercase tracking-[0.14em]"
        >
          {briefCopy.threadLabel(story.posts.length)}
        </Typography>
        <ul className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
          {story.posts.map((p) => (
            <li key={p.id}>
              <a
                href={`https://app.daily.dev/posts/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-start gap-3 rounded-10 border border-border-subtlest-quaternary p-3 transition-colors hover:bg-surface-float"
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
};

const TopicBody = ({ topic }: { topic: TopicDigest }): ReactElement => {
  const minutes = estimateMinutes(
    topic.tldr + topic.content.replace(/<[^>]+>/g, ' '),
  );
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <PanelEyebrow
          icon={
            <span
              className={classNames(
                'inline-grid size-5 place-items-center rounded-full',
                TOPIC_BG_TOKEN[topic.topic],
              )}
            >
              <EyeIcon
                size={IconSize.XXSmall}
                secondary
                className={TOPIC_TOKEN[topic.topic]}
              />
            </span>
          }
          label={`${topic.topic} · ${briefCopy.topicWeekly}`}
          color={TOPIC_TOKEN[topic.topic]}
          minutes={minutes}
        />
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
          bold
          className="!leading-[1.1] tracking-[-0.025em]"
        >
          {topic.title}
        </Typography>
      </header>
      <section
        className={classNames(
          'rounded-12 border-l-2 p-4',
          TOPIC_BG_TOKEN[topic.topic],
          'bg-opacity-30',
        )}
      >
        <Typography
          type={TypographyType.Caption2}
          bold
          className={classNames(
            'mb-2 uppercase tracking-[0.14em]',
            TOPIC_TOKEN[topic.topic],
          )}
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
        // mock content is trusted at build time
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: topic.content }}
      />
    </div>
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
      className="!items-stretch !bg-background-default tablet:!max-h-[calc(100vh-6rem)]"
    >
      <header className="z-1 grid h-14 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border-subtlest-quaternary bg-background-default px-4">
        <div />
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onPrev}
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
          >
            <span className="hidden tablet:inline">{briefCopy.panelNext}</span>
          </Button>
        </div>
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MiniCloseIcon />}
            onClick={onClose}
            aria-label={briefCopy.panelClose}
          />
        </div>
      </header>
      <div className="min-h-0 w-full flex-1 overflow-y-auto p-5 tablet:p-7">
        {entity.kind === 'story' ? (
          <StoryBody story={entity} />
        ) : (
          <TopicBody topic={entity} />
        )}
      </div>
    </Modal>
  );
};
