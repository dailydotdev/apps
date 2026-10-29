import type { ReactElement } from 'react';
import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Switch } from '../../../components/fields/Switch';
import { Slider } from '../../../components/fields/Slider';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Divider } from '../../../components/utilities/Divider';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { Origin } from '../../../lib/log';
import type { FeedProfileRankingSetting } from '../types';
import { FeedTuneTab } from '../types';
import { useOpenFeedTune } from '../useOpenFeedTune';
import type { RankingSettingMeta } from '../ranking';
import { formatRankingValue, rankingGroups, rankingSettings } from '../ranking';
import { feedProfileQueryOptions } from '../queries';
import { useFeedControls } from '../useFeedControls';
import { PlusBanner } from './PlusUpsell';

export interface RankingSliderProps {
  meta: RankingSettingMeta;
  setting: FeedProfileRankingSetting;
  /** The reader's own value, while they have Plus. */
  value?: number;
  isLocked: boolean;
  onChange: (value: number | null) => void;
}

export const RankingSlider = ({
  meta,
  setting,
  value,
  isLocked,
  onChange,
}: RankingSliderProps): ReactElement => {
  const current = value ?? setting.defaultValue;
  // A drag that ends where it began never commits, so it only counts over
  // the value it started from, or it would hide a reset made after it.
  const [drag, setDrag] = useState<{ from: number; to: number }>();
  const shown = drag?.from === current ? drag.to : current;
  const isSet = value !== undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 shrink font-bold text-text-primary typo-callout">
          {meta.label}
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          {isSet && !isLocked && (
            <button
              type="button"
              className="text-text-link typo-footnote hover:underline"
              onClick={() => onChange(null)}
            >
              Reset to {formatRankingValue(meta.format, setting.defaultValue)}
            </button>
          )}
          <span
            className={classNames(
              'tabular-nums typo-callout',
              isSet ? 'text-accent-cabbage-default' : 'text-text-secondary',
            )}
          >
            {formatRankingValue(meta.format, shown)}
          </span>
        </span>
      </div>
      <Slider
        compact
        className={classNames(isLocked && 'cursor-not-allowed opacity-40')}
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={[Math.min(meta.max, Math.max(meta.min, shown))]}
        thumbLabel={meta.label}
        disabled={isLocked}
        onValueChange={([next]) => setDrag({ from: current, to: next })}
        onValueCommit={([next]) => {
          setDrag(undefined);
          onChange(next);
        }}
      />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {meta.help}
      </Typography>
    </div>
  );
};

/**
 * How For You ranks every post. Anyone sees the values the feed ranks with;
 * only Plus changes them. Values and defaults come from the feed profile, so
 * the section waits for it and stays out where the ranking takes no
 * settings.
 */
export const ForYouRankingSettings = ({
  version,
}: {
  version: number;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const [isAdvanced, setIsAdvanced] = useState(false);
  const { data: profile } = useQuery(feedProfileQueryOptions(user, version));
  const { controls, setRankingSetting, resetRankingSettings } = useFeedControls(
    { origin: Origin.Settings },
  );
  const openTune = useOpenFeedTune(Origin.Settings);

  if (!profile?.ranking.length || !controls) {
    return null;
  }

  const settings = new Map(profile.ranking.map((item) => [item.key, item]));
  const values = new Map(
    controls.ranking.map(({ key, value }) => [key, value]),
  );
  const pausedCount = isPlus ? 0 : controls.ranking.length;

  return (
    <>
      <Divider className="my-1 bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-1">
            <Typography bold type={TypographyType.Body}>
              Ranking
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Each post starts from how other readers liked it. Your topics and
              follows boost it, and it drops as it gets older or as you scroll
              past it. These settings apply to every post in For You.
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => openTune(version, FeedTuneTab.Ranking)}
            >
              Live preview
            </Button>
            <Switch
              inputId="for-you-ranking-advanced"
              name="for-you-ranking-advanced"
              compact={false}
              checked={isAdvanced}
              onToggle={() => setIsAdvanced(!isAdvanced)}
            >
              Advanced
            </Switch>
            {isPlus && controls.ranking.length > 0 && (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={resetRankingSettings}
              >
                Reset all
              </Button>
            )}
          </div>
        </div>
        <PlusBanner>
          {pausedCount === 1 &&
            'Your change is saved and counts again with Plus.'}
          {pausedCount > 1 &&
            `Your ${pausedCount} changes are saved and count again with Plus.`}
          {!pausedCount && 'Change how For You ranks every post with Plus.'}
        </PlusBanner>
        {rankingGroups.map(({ group, title, description }, index) => {
          const rows = rankingSettings.flatMap((meta) => {
            const setting = settings.get(meta.key);
            return meta.group === group &&
              setting &&
              (isAdvanced || !meta.isAdvanced)
              ? [{ meta, setting }]
              : [];
          });
          if (!rows.length) {
            return null;
          }
          return (
            <Fragment key={group}>
              {index > 0 && (
                <Divider className="my-1 bg-border-subtlest-tertiary" />
              )}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Typography bold type={TypographyType.Callout}>
                    {title}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {description}
                  </Typography>
                </div>
                {rows.map(({ meta, setting }) => (
                  <RankingSlider
                    key={meta.key}
                    meta={meta}
                    setting={setting}
                    value={isPlus ? values.get(meta.key) : undefined}
                    isLocked={!isPlus}
                    onChange={(value) => setRankingSetting(meta.key, value)}
                  />
                ))}
              </div>
            </Fragment>
          );
        })}
      </div>
    </>
  );
};
