import type { ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Switch } from '../../../components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Divider } from '../../../components/utilities/Divider';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { Origin } from '../../../lib/log';
import { pluralize } from '../../../lib/strings';
import type { SignalMeta } from '../describe';
import { followModeMeta, getControlMeta } from '../describe';
import type { FeedControls } from '../types';
import type { FeedPersonalizationReset } from '../graphql';
import type { UseFeedControls } from '../useFeedControls';
import {
  useFeedControls,
  useFeedPersonalizationReset,
} from '../useFeedControls';
import { useForYouControls } from '../useFeedExplainMode';

const SettingTitle = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography bold type={TypographyType.Body}>
      {title}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </div>
);

const SettingDivider = (): ReactElement => (
  <Divider className="my-1 bg-border-subtlest-tertiary" />
);

interface TimedChange {
  key: string;
  name: string;
  expiresAt: string;
  meta?: SignalMeta;
  onEnd: () => void;
}

const getTimedChanges = (
  controls: FeedControls,
  isPlus: boolean,
  { setTopic, setSource, setAuthor }: UseFeedControls,
): TimedChange[] =>
  [
    ...controls.topics.map(
      (control): Partial<TimedChange> => ({
        key: `topic:${control.keyword}`,
        name: `#${control.keyword}`,
        expiresAt: control.expiresAt ?? undefined,
        meta: getControlMeta(control, isPlus),
        onEnd: () => setTopic(control.keyword, { mode: null }),
      }),
    ),
    ...controls.sources.map(
      (control): Partial<TimedChange> => ({
        key: `source:${control.source.id}`,
        name: control.source.name ?? control.source.id,
        expiresAt: control.expiresAt ?? undefined,
        meta: getControlMeta(control, isPlus, followModeMeta),
        onEnd: () => setSource(control.source.id, { mode: null }),
      }),
    ),
    ...controls.authors.map(
      (control): Partial<TimedChange> => ({
        key: `author:${control.user.id}`,
        name: control.user.name ?? control.user.id,
        expiresAt: control.expiresAt ?? undefined,
        meta: getControlMeta(control, isPlus, followModeMeta),
        onEnd: () => setAuthor(control.user.id, { mode: null }),
      }),
    ),
  ]
    .filter((change): change is TimedChange => !!change.expiresAt)
    .sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );

/**
 * Every change set for a while, when it ends, and a way to end it now. A row
 * ended here stays, marked ended, until the page opens again, so the rest
 * don't move under the pointer.
 */
const TimedChanges = ({
  controls,
  feedControls,
}: {
  controls: FeedControls;
  feedControls: UseFeedControls;
}): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const seen = useRef(new Map<string, TimedChange>());
  const current = getTimedChanges(controls, isPlus, feedControls);
  current.forEach((change) => seen.current.set(change.key, change));

  if (!seen.current.size) {
    return null;
  }

  return (
    <>
      <SettingDivider />
      <div className="flex flex-col gap-2">
        <SettingTitle title="Changes that end on their own">
          Each goes back to Auto on the day shown, unless you end it sooner.
        </SettingTitle>
        <ul className="flex flex-col">
          {[...seen.current.values()].map(({ key, name, meta, onEnd }) => {
            const isEnded = !current.some((change) => change.key === key);
            return (
              <li key={key} className="flex items-center gap-3 py-2">
                <span className="flex min-w-0 flex-1 flex-col">
                  <Typography
                    type={TypographyType.Callout}
                    className="truncate"
                    bold
                  >
                    {name}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={isEnded ? TypographyColor.Tertiary : undefined}
                    className={isEnded ? undefined : meta?.className}
                  >
                    {isEnded ? 'Ended, back to Auto' : meta?.text}
                  </Typography>
                </span>
                {!isEnded && (
                  <Button
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    aria-label={`End now: ${name}`}
                    onClick={onEnd}
                  >
                    End now
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

/**
 * Overview's For You controls: changes set for a while, learning and popular
 * fill-ins. Only where the reader's For You ranking takes them, and each
 * block comes with the divider above it.
 */
export const ForYouOverviewControls = (): ReactElement | null => {
  const { isAvailable } = useForYouControls();
  const feedControls = useFeedControls({
    origin: Origin.Settings,
    enabled: isAvailable,
  });
  const { controls, setLearning, setFillIns } = feedControls;
  const { feedSettings } = useFeedSettings();

  if (!isAvailable || !controls) {
    return null;
  }

  const hasFollows =
    !!feedSettings?.includeTags?.length ||
    !!feedSettings?.includeSources?.length;

  return (
    <>
      <TimedChanges controls={controls} feedControls={feedControls} />
      <SettingDivider />
      <div className="flex flex-col gap-4">
        <SettingTitle title="Learn from your reading">
          Topics you read about count in For You, even ones you don&apos;t
          follow. Turn it off and only your follows count.
        </SettingTitle>
        <Switch
          inputId="for-you-learning"
          name="for-you-learning"
          compact={false}
          checked={controls.learning}
          onToggle={() => setLearning(!controls.learning)}
        >
          Learn from my reading
        </Switch>
      </div>
      <SettingDivider />
      <div className="flex flex-col gap-4">
        <SettingTitle title="Popular posts">
          When your topics and follows don&apos;t find enough posts for For You,
          popular posts fill the rest. Turn it off and For You shows only what
          your topics and follows find, even when that&apos;s only a few posts.
        </SettingTitle>
        <Switch
          inputId="for-you-fill-ins"
          name="for-you-fill-ins"
          compact={false}
          checked={controls.fillIns}
          onToggle={() => setFillIns(!controls.fillIns)}
        >
          Fill a short feed with popular posts
        </Switch>
        {!hasFollows && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Until you follow a topic or source, popular posts keep filling For
            You so it&apos;s never empty.
          </Typography>
        )}
      </div>
    </>
  );
};

interface ResetRowProps {
  title: string;
  description: string;
  doneMessage: string;
  isDisabled?: boolean;
  isPending?: boolean;
  isDanger?: boolean;
  /** Resolves whether the reset went through. */
  onReset: () => Promise<boolean>;
}

const ResetRow = ({
  title,
  description,
  doneMessage,
  isDisabled,
  isPending,
  isDanger,
  onReset,
}: ResetRowProps): ReactElement => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { displayToast } = useToastNotification();

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <span className="flex min-w-0 flex-[1_1_16rem] flex-col">
        <Typography type={TypographyType.Callout} bold>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </span>
      {isConfirming ? (
        <span className="flex gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => setIsConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Ketchup}
            size={ButtonSize.Small}
            loading={isPending}
            onClick={async () => {
              if (await onReset()) {
                displayToast(doneMessage);
              }
              setIsConfirming(false);
            }}
          >
            Yes, reset
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          {...(isDanger
            ? { variant: ButtonVariant.Secondary, color: ButtonColor.Ketchup }
            : { variant: ButtonVariant.Float })}
          size={ButtonSize.Small}
          disabled={isDisabled}
          onClick={() => setIsConfirming(true)}
        >
          Reset
        </Button>
      )}
    </li>
  );
};

const PersonalizationResetRow = ({
  reset,
  ...props
}: Omit<ResetRowProps, 'onReset' | 'isPending'> & {
  reset: FeedPersonalizationReset;
}): ReactElement => {
  const { reset: onReset, isPending } = useFeedPersonalizationReset({
    origin: Origin.Settings,
  });

  return (
    <ResetRow {...props} isPending={isPending} onReset={() => onReset(reset)} />
  );
};

// "2 topics, 1 source and 3 creators" go back to Auto.
const describeLevels = ({ topics, sources, authors }: FeedControls): string => {
  const counts = (
    [
      [topics.length, 'topic'],
      [sources.length, 'source'],
      [authors.length, 'creator'],
    ] as const
  )
    .filter(([count]) => count > 0)
    .map(([count, noun]) => `${count} ${pluralize(noun, count)}`);
  const last = counts.pop();
  return counts.length ? `${counts.join(', ')} and ${last}` : last ?? '';
};

/**
 * The resets, each on its own, and all of them at once. Only where the
 * reader's For You ranking takes the controls.
 */
export const ForYouStartOver = (): ReactElement | null => {
  const { isAvailable } = useForYouControls();
  const { controls, resetRankingSettings } = useFeedControls({
    origin: Origin.Settings,
    enabled: isAvailable,
  });

  if (!isAvailable) {
    return null;
  }

  const changedSettings = controls?.ranking.length ?? 0;
  const levels = controls
    ? controls.topics.length + controls.sources.length + controls.authors.length
    : 0;

  return (
    <div className="flex flex-col gap-1">
      <SettingTitle title="Start over">
        Each reset works on its own and leaves your follows and blocks alone.
      </SettingTitle>
      <ul className="flex flex-col">
        <PersonalizationResetRow
          title="Forget my reading"
          description="For You forgets the topics it learned from your reading, and topics you follow lose the boost reading gave them."
          reset={{ learned: true }}
          doneMessage="For You forgot your reading"
        />
        <PersonalizationResetRow
          title="Clear the boosts I set"
          description={
            controls && levels
              ? `${describeLevels(controls)} ${
                  levels === 1 ? 'goes' : 'go'
                } back to Auto.`
              : "You haven't set any boosts."
          }
          isDisabled={!levels}
          reset={{ levels: true }}
          doneMessage="Every topic, source and creator is back to Auto"
        />
        <ResetRow
          title="Reset ranking settings"
          description={
            changedSettings
              ? `${changedSettings} changed ${pluralize(
                  'setting',
                  changedSettings,
                )} ${
                  changedSettings === 1 ? 'goes' : 'go'
                } back to the default.`
              : 'Every ranking setting is at its default.'
          }
          isDisabled={!changedSettings}
          doneMessage="Your ranking settings are back to the default"
          onReset={async () => {
            resetRankingSettings();
            return true;
          }}
        />
        <PersonalizationResetRow
          title="Forget what I scrolled past"
          description="Posts you scrolled past can show up in For You again."
          reset={{ seen: true }}
          doneMessage="For You forgot what you scrolled past"
        />
        <PersonalizationResetRow
          title="Reset everything"
          description="All of the above at once. Learning and popular posts stay as you set them."
          reset={{ learned: true, seen: true, levels: true, ranking: true }}
          doneMessage="For You is starting over from your follows"
          isDanger
        />
      </ul>
    </div>
  );
};
