import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { featurePlusCtaCopy } from '@dailydotdev/shared/src/lib/featureManagement';
import { plusUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import type { Interest, TopicControl } from '../policy/profile';
import { TopicMode } from '../policy/profile';
import { formatParam, ParamFormat } from '../policy/params';
import { SourceMode } from '../policy/rank';
import { describeAction, FeedAction, glossary } from '../policy/glossary';
import { Duration } from '../policy/timed';
import { defaultBootData, getBootMock } from '../../../../mock/boot';
import { usePersonalization } from './PersonalizationContext';
import type { SegmentOption } from './controls';
import { DurationPicker, Segmented } from './controls';

/**
 * Free viewers pick what's in their feed and a level for each topic or
 * source; Plus viewers set the exact numbers.
 */
export enum Level {
  StopLearning = 'stop_learning',
  Less = 'less',
  Auto = 'auto',
  More = 'more',
}

export const topicModes: Record<Level, TopicMode | undefined> = {
  [Level.StopLearning]: TopicMode.StopLearning,
  [Level.Less]: TopicMode.Demoted,
  [Level.Auto]: undefined,
  [Level.More]: TopicMode.Boosted,
};

export const levelActions: Record<Level, FeedAction> = {
  [Level.StopLearning]: FeedAction.StopLearning,
  [Level.Less]: FeedAction.ShowLess,
  [Level.Auto]: FeedAction.Auto,
  [Level.More]: FeedAction.ShowMore,
};

const levelColors: Partial<Record<Level, string>> = {
  [Level.StopLearning]: 'text-accent-ketchup-default',
  [Level.Less]: 'text-accent-bun-default',
  [Level.More]: 'text-accent-avocado-default',
};

/** A level's glossary verb, effect and color, for pickers and lists. */
export const getLevelOption = (
  level: Level,
  subject: string,
): SegmentOption<Level | undefined> => ({
  value: level,
  label: glossary[levelActions[level]].verb,
  activeClassName: levelColors[level],
  description: describeAction(levelActions[level], subject),
});

const sourceModes: Partial<Record<Level, SourceMode | undefined>> = {
  [Level.Less]: SourceMode.Demoted,
  [Level.Auto]: undefined,
};

/** No level when the viewer set an exact boost, which only Plus can. */
export const getTopicLevel = (control?: TopicControl): Level | undefined => {
  if (control?.weight !== undefined) {
    return undefined;
  }
  switch (control?.mode) {
    case TopicMode.StopLearning:
      return Level.StopLearning;
    case TopicMode.Demoted:
      return Level.Less;
    case TopicMode.Boosted:
      return Level.More;
    default:
      return Level.Auto;
  }
};

const LevelValue = ({
  display,
  isSet,
}: {
  display: string;
  isSet: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'ml-auto w-14 shrink-0 text-right tabular-nums typo-callout',
      isSet ? 'text-accent-cabbage-default' : 'text-text-secondary',
    )}
  >
    {display}
  </span>
);

/** The free version of a topic's boost slider. */
export const TopicLevelPicker = ({
  tag,
  interest,
  hasValue = true,
  className,
}: {
  tag: string;
  interest?: Interest;
  /** Hidden where the boost already shows next to it. */
  hasValue?: boolean;
  className?: string;
}): ReactElement => {
  const store = usePersonalization();
  const control = store.state.controls[tag];
  const weight = interest?.weight ?? 0;

  return (
    <span className={classNames('flex min-w-0 items-center gap-2', className)}>
      <Segmented
        label={`Level for #${tag}`}
        value={getTopicLevel(control)}
        options={[Level.StopLearning, Level.Less, Level.Auto].map((level) =>
          getLevelOption(level, `#${tag}`),
        )}
        onChange={(level) =>
          store.setTopicMode(tag, level ? topicModes[level] : undefined)
        }
      />
      {hasValue && (
        <LevelValue
          display={formatParam(ParamFormat.Boost, weight)}
          isSet={!!control}
        />
      )}
    </span>
  );
};

/** The free version of a source's boost slider. */
export const SourceLevelPicker = ({
  source,
  display,
  className,
}: {
  source: { id: string; name: string };
  display: string;
  className?: string;
}): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const isExact = state.sourceWeights?.[source.id] !== undefined;
  const mode = state.sourceControls[source.id];
  const level = mode === SourceMode.Demoted ? Level.Less : Level.Auto;

  return (
    <span className={classNames('flex min-w-0 items-center gap-2', className)}>
      <Segmented
        label={`Level for ${source.name}`}
        value={isExact ? undefined : level}
        options={[Level.Less, Level.Auto].map((option) =>
          getLevelOption(option, `from ${source.name}`),
        )}
        onChange={(next) =>
          store.setSourceMode(source, next ? sourceModes[next] : undefined)
        }
      />
      <LevelValue display={display} isSet={isExact || !!mode} />
    </span>
  );
};

const useUpgradeClick = () => {
  const { logSubscriptionEvent } = usePlusSubscription();

  return () =>
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.FeedSettings,
    });
};

/** The feed settings Plus banner, as AI superpowers has it. */
export const PlusBanner = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const onClick = useUpgradeClick();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  if (isPlus) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex w-full flex-wrap items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-action-plus-float p-3',
        className,
      )}
    >
      <Typography type={TypographyType.Callout} className="flex-auto">
        {children}
      </Typography>
      <Link href={plusUrl} passHref>
        <Button
          className="w-fit"
          tag="a"
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          icon={<DevPlusIcon className="text-action-plus-default" />}
          onClick={onClick}
        >
          {plusCta}
        </Button>
      </Link>
    </div>
  );
};

/** A small Get Plus button, as the bookmark folders strip has it. */
export const GetPlusButton = ({
  className,
}: {
  className?: string;
}): ReactElement => {
  const onClick = useUpgradeClick();

  return (
    <Link href={plusUrl} passHref>
      <Button
        tag="a"
        className={className}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Bacon}
        size={ButtonSize.Small}
        icon={<DevPlusIcon secondary />}
        onClick={onClick}
      >
        Get Plus
      </Button>
    </Link>
  );
};

/** Changes for a while (3 days, a week) are Plus; until I change it is free. */
export const isTimedLocked = (
  duration: Duration | undefined,
  isPlus: boolean,
): boolean => !isPlus && !!duration && duration !== Duration.Ongoing;

const timedDurations = [Duration.ThreeDays, Duration.Week];

/** DurationPicker with 3 days and a week locked for free viewers. */
export const PlusDurationPicker = ({
  value,
  onChange,
  label,
  hasUpsell = true,
}: {
  value: Duration;
  onChange: (duration: Duration) => void;
  label?: string;
  /** Off where the screen already names what Plus adds. */
  hasUpsell?: boolean;
}): ReactElement => {
  const { isPlus } = usePlusSubscription();

  return (
    <div className="flex flex-col gap-2">
      <DurationPicker
        label={label}
        value={isTimedLocked(value, isPlus) ? Duration.Ongoing : value}
        onChange={onChange}
        lockedValues={isPlus ? [] : timedDurations}
      />
      {!isPlus && hasUpsell && (
        <PlusLine>Make it last 3 days or a week with Plus</PlusLine>
      )}
    </div>
  );
};

/**
 * Story setup, not product UI: boots the viewer on Plus. Call it from
 * `beforeEach` so Storybook's mock restore undoes it between stories.
 */
export const bootAsPlus = (): void => {
  getBootMock.mockReturnValue({
    ...defaultBootData,
    user: { ...defaultBootData.user, isPlus: true },
  });
};

/** One line that names what Plus adds, with a link to it. */
export const PlusLine = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const onClick = useUpgradeClick();

  return (
    <Link href={plusUrl} passHref>
      <a
        href={plusUrl}
        onClick={onClick}
        className="flex items-center gap-1 font-bold text-action-plus-default typo-footnote hover:underline"
      >
        <DevPlusIcon secondary className="shrink-0" />
        <span className="min-w-0 shrink">{children}</span>
      </a>
    </Link>
  );
};

/**
 * Prototype chrome, not product UI: switches the signed-in viewer between
 * free and Plus, so every Plus check on the screen follows.
 */
export const PlanSwitch = ({
  isFloatingOnPhone,
}: {
  /** For screens whose phone header is fixed at the top, like settings. */
  isFloatingOnPhone?: boolean;
}): ReactElement | null => {
  const { user, updateUser } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const isPhone = useViewSize(ViewSize.MobileL);

  if (!user) {
    return null;
  }

  const plans = (
    <Segmented
      label="Plan"
      value={isPlus}
      options={[
        { value: false, label: 'Free' },
        { value: true, label: 'Plus' },
      ]}
      onChange={(next) => updateUser({ ...(user as LoggedUser), isPlus: next })}
    />
  );

  if (isFloatingOnPhone && isPhone) {
    return <div className="fixed right-4 top-2.5 z-modal">{plans}</div>;
  }

  return (
    <div className="flex items-center justify-center gap-3 border-b border-dashed border-border-subtlest-tertiary bg-background-subtle px-4 py-2">
      <span className="text-text-tertiary typo-footnote">
        Prototype: viewing as
      </span>
      {plans}
    </div>
  );
};
