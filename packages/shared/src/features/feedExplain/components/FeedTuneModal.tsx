import type { ReactElement, ReactNode } from 'react';
import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../../components/modals/common/Modal';
import type { LazyModalCommonProps } from '../../../components/modals/common/Modal';
import { ModalClose } from '../../../components/modals/common/ModalClose';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Switch } from '../../../components/fields/Switch';
import TabList from '../../../components/tabs/TabList';
import { UndoIcon } from '../../../components/icons/Undo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { Divider } from '../../../components/utilities/Divider';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { settingsUrl } from '../../../lib/constants';
import type { FeedTune, FeedTuneItem } from '../types';
import { ExplainOrigin, FeedTuneTab } from '../types';
import { feedProfileQueryOptions } from '../queries';
import { getControlMeta, getSourceFactor } from '../describe';
import { rankingGroups, rankingSettings } from '../ranking';
import { describeLeftOutReason } from '../leftOut';
import type { UseFeedTune } from '../useFeedTune';
import { useFeedTune } from '../useFeedTune';
import { TopicLevelPicker } from './TopicLevelPicker';
import { SourceLevelPicker } from './SourceLevelPicker';
import { RankingSlider } from './ForYouRankingSettings';
import { PlusBanner } from './PlusUpsell';

const tuneTabs = Object.values(FeedTuneTab);

// Enough rows to steer by without a wall of sliders; the rest are in Feed
// settings.
const maxTopics = 25;

const originMeta: Record<ExplainOrigin, string> = {
  [ExplainOrigin.Declared]: 'You follow it',
  [ExplainOrigin.Inferred]: 'From your reading',
  [ExplainOrigin.Set]: 'You set its boost',
};

const ControlRow = ({
  title,
  meta,
  metaClassName,
  children,
}: {
  title: string;
  meta?: string;
  metaClassName?: string;
  children: ReactNode;
}): ReactElement => (
  <li className="flex min-h-11 items-center gap-3">
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold text-text-primary typo-footnote">
        {title}
      </span>
      {meta && (
        <span
          className={classNames(
            'truncate typo-caption1',
            metaClassName ?? 'text-text-quaternary',
          )}
        >
          {meta}
        </span>
      )}
    </span>
    {children}
  </li>
);

const TopicsTab = ({
  tune,
  version,
}: {
  tune: UseFeedTune;
  version: number;
}): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: profile } = useQuery(feedProfileQueryOptions(user, version));
  const interests: {
    tag: string;
    weight: number;
    computedWeight?: number;
    origin?: ExplainOrigin;
  }[] = (profile?.interests ?? [])
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxTopics);
  // Topics turned off are no interest, but listed so they can come back.
  (profile?.muted ?? []).forEach((tag) => interests.push({ tag, weight: 0 }));

  return (
    <div className="flex flex-col gap-4">
      <Switch
        inputId="feed-tune-learning"
        name="feed-tune-learning"
        compact={false}
        checked={tune.learning}
        onToggle={() => tune.setLearning(!tune.learning)}
      >
        Learn from my reading
      </Switch>
      <ul className="flex flex-col">
        {interests.map(({ tag, weight, computedWeight, origin }) => {
          const control = tune.getTopicControl(tag);
          const meta = getControlMeta(control, isPlus);
          return (
            <ControlRow
              key={tag}
              title={`#${tag}`}
              meta={meta?.text ?? (origin && originMeta[origin])}
              metaClassName={meta?.className}
            >
              <TopicLevelPicker
                tag={tag}
                weight={weight}
                computedWeight={computedWeight}
                isSet={!!control}
                control={control}
                onChange={(value) => tune.setTopic(tag, value)}
              />
            </ControlRow>
          );
        })}
      </ul>
    </div>
  );
};

// The sources on the page, so the reader steers what they see.
const getPageSources = (tune: FeedTune | undefined) => [
  ...new Map(
    (tune?.items ?? []).flatMap(({ post, explain }) =>
      post?.source ? [[post.source.id, { ...post.source, explain }]] : [],
    ),
  ).values(),
];

const SourcesTab = ({ tune }: { tune: UseFeedTune }): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const sources = getPageSources(tune.base);

  return (
    <ul className="flex flex-col">
      {sources.map(({ id, name, explain }) => {
        const control = tune.getSourceControl(id);
        const factor = getSourceFactor(explain);
        const meta = getControlMeta(control, isPlus);
        return (
          <ControlRow
            key={id}
            title={name}
            meta={meta?.text ?? (factor > 1 ? 'You follow it' : undefined)}
            metaClassName={meta?.className}
          >
            <SourceLevelPicker
              name={name}
              factor={factor}
              control={control}
              onChange={(value) => tune.setSource(id, value)}
            />
          </ControlRow>
        );
      })}
    </ul>
  );
};

const RankingTab = ({
  tune,
  version,
}: {
  tune: UseFeedTune;
  version: number;
}): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: profile } = useQuery(feedProfileQueryOptions(user, version));
  const settings = new Map(
    (profile?.ranking ?? []).map((item) => [item.key, item]),
  );

  return (
    <div className="flex flex-col gap-4">
      <PlusBanner>Change how For You ranks every post with Plus.</PlusBanner>
      {rankingGroups.map(({ group, title }, index) => {
        const rows = rankingSettings.flatMap((meta) => {
          const setting = settings.get(meta.key);
          return meta.group === group && !meta.isAdvanced && setting
            ? [{ meta, setting }]
            : [];
        });
        if (!rows.length) {
          return null;
        }
        return (
          <Fragment key={group}>
            {index > 0 && <Divider className="bg-border-subtlest-tertiary" />}
            <Typography bold type={TypographyType.Callout}>
              {title}
            </Typography>
            {rows.map(({ meta, setting }) => (
              <RankingSlider
                key={meta.key}
                meta={meta}
                setting={setting}
                value={isPlus ? tune.getRankingValue(meta.key) : undefined}
                isLocked={!isPlus}
                onChange={(value) => tune.setRanking(meta.key, value)}
              />
            ))}
          </Fragment>
        );
      })}
    </div>
  );
};

const getPlaceChange = (
  base: FeedTune | undefined,
  postId: string | undefined,
  index: number,
): { text: string; className: string } | undefined => {
  const before = base?.items.findIndex(({ post }) => post?.id === postId);
  if (before === undefined || before === index) {
    return undefined;
  }
  if (before < 0) {
    return { text: 'New', className: 'text-accent-avocado-default' };
  }
  return before > index
    ? { text: `Up ${before - index}`, className: 'text-accent-avocado-default' }
    : { text: `Down ${index - before}`, className: 'text-text-tertiary' };
};

const PostRow = ({
  item,
  note,
  noteClassName,
}: {
  item: FeedTuneItem;
  note?: string;
  noteClassName?: string;
}): ReactElement | null => {
  if (!item.post) {
    return null;
  }
  return (
    <li className="flex items-baseline gap-2 py-1.5">
      <span className="flex min-w-0 flex-1 flex-col">
        <a
          href={item.post.commentsPermalink}
          target="_blank"
          rel="noopener"
          className="line-clamp-2 text-text-primary typo-footnote hover:underline"
        >
          {item.post.title}
        </a>
        <span className="truncate text-text-tertiary typo-caption1">
          {item.post.source?.name}
        </span>
      </span>
      {note && (
        <span className={classNames('shrink-0 typo-caption1', noteClassName)}>
          {note}
        </span>
      )}
    </li>
  );
};

const Preview = ({ tune }: { tune: UseFeedTune }): ReactElement => {
  const page = tune.preview;

  return (
    <div
      className={classNames(
        'flex flex-col gap-4 transition-opacity',
        tune.isFetching && 'opacity-60',
      )}
    >
      <section className="flex flex-col">
        <Typography bold type={TypographyType.Callout}>
          {tune.isPreviewing ? 'For You with your changes' : 'For You now'}
        </Typography>
        <ol className="flex flex-col">
          {page?.items.map((item, index) => {
            const change = tune.isPreviewing
              ? getPlaceChange(tune.base, item.post?.id, index)
              : undefined;
            return (
              <PostRow
                key={item.post?.id ?? index}
                item={item}
                note={change?.text}
                noteClassName={change?.className}
              />
            );
          })}
        </ol>
      </section>
      {!!page?.leftOut.length && (
        <section className="flex flex-col">
          <Typography bold type={TypographyType.Callout}>
            Left out
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            The best of the {page.summary.leftOut} posts For You looked at and
            left out.
          </Typography>
          <ul className="flex flex-col">
            {page.leftOut.map((item, index) => (
              <PostRow
                key={item.post?.id ?? index}
                item={item}
                note={item.explain?.reasons
                  ?.map(describeLeftOutReason)
                  .join(' · ')}
                noteClassName="max-w-[45%] text-right text-text-tertiary"
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export interface FeedTuneModalProps extends LazyModalCommonProps {
  /** The For You version to preview, the one the reader is on. */
  version: number;
  initialTab?: FeedTuneTab;
}

/**
 * Tune: the For You controls beside a preview of the feed they make.
 * Changes stay a draft until saved, and the Plus ones show locked for free
 * readers.
 */
const FeedTuneModal = ({
  version,
  initialTab = FeedTuneTab.Topics,
  onRequestClose,
  ...props
}: FeedTuneModalProps): ReactElement => {
  const [tab, setTab] = useState<FeedTuneTab>(initialTab);
  const tune = useFeedTune(version);

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      isDrawerOnMobile
      drawerProps={{
        displayCloseButton: false,
        className: { wrapper: '!px-0 !pt-0' },
      }}
      onRequestClose={onRequestClose}
      {...props}
    >
      <Modal.Body className="!p-0">
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary px-4 pt-4 tablet:px-6 tablet:pt-6">
            <div className="flex items-center gap-2">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title3}
                className="min-w-0 flex-1"
                bold
              >
                Tune your feed
              </Typography>
              <Button
                tag="a"
                href={`${settingsUrl}/feed/general`}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                All settings
              </Button>
              <ModalClose
                position="static"
                size={ButtonSize.Small}
                onClick={onRequestClose}
              />
            </div>
            <TabList<FeedTuneTab>
              items={tuneTabs.map((label) => ({ label }))}
              active={tab}
              onClick={(label) => setTab(label)}
            />
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto p-4 tablet:p-6">
            {tab === FeedTuneTab.Topics && (
              <TopicsTab tune={tune} version={version} />
            )}
            {tab === FeedTuneTab.Sources && <SourcesTab tune={tune} />}
            {tab === FeedTuneTab.Ranking && (
              <RankingTab tune={tune} version={version} />
            )}
            <Divider className="bg-border-subtlest-tertiary" />
            <Preview tune={tune} />
          </div>
          {/* Sticky: a phone's drawer scrolls as a whole. */}
          <footer className="sticky bottom-0 flex items-center gap-2 border-t border-border-subtlest-tertiary bg-background-default px-4 py-3 tablet:rounded-b-16 tablet:bg-accent-pepper-subtlest tablet:px-6">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="min-w-0 flex-1"
              aria-live="polite"
            >
              {tune.movement ??
                (tune.isPreviewing
                  ? 'Updating the preview.'
                  : 'Change anything and see your feed follow. Nothing is saved until you save it.')}
            </Typography>
            {tune.changeCount > 0 && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<UndoIcon />}
                onClick={tune.undo}
              >
                Undo
              </Button>
            )}
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={!tune.changeCount}
              onClick={() => {
                tune.save();
                onRequestClose();
              }}
            >
              Save
            </Button>
          </footer>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FeedTuneModal;
