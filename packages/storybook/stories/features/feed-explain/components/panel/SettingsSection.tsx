import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { AiIcon } from '@dailydotdev/shared/src/components/icons/Ai';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { settingsUrl, webappUrl } from '@dailydotdev/shared/src/lib/constants';
import type { ParamKey } from '../../policy/params';
import { defaultParams } from '../../policy/params';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { PanelCard, PanelSection } from './Section';

const SettingLink = ({
  icon,
  title,
  summary,
  href,
}: {
  icon: ReactNode;
  title: string;
  summary: string;
  href: string;
}): ReactElement => (
  <li>
    <a
      href={href}
      className="flex h-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 hover:border-border-subtlest-secondary"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">
          {title}
        </span>
        <span className="text-text-tertiary typo-footnote">{summary}</span>
      </span>
      <ArrowIcon
        size={IconSize.Size16}
        className="shrink-0 rotate-90 text-text-tertiary"
      />
    </a>
  </li>
);

/** Filters that live in settings; this page only links to them. */
export const SettingsSection = (): ReactElement => {
  const { state } = usePersonalization();
  const blockedCount =
    state.blockedTags.length +
    state.blockedSources.length +
    state.blockedAuthors.length;

  return (
    <PanelSection
      section={ControlSection.Settings}
      title="Other feed settings"
      description="Filters that remove posts before anything is ranked. They live in your settings."
    >
      <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        <SettingLink
          icon={<BlockIcon />}
          title="Blocked"
          summary={
            blockedCount
              ? `${blockedCount} topics, sources or people you blocked, plus words in titles`
              : 'Topics, sources, people and words in titles you never want to see'
          }
          href={`${settingsUrl}/feed/blocked`}
        />
        <SettingLink
          icon={<FilterIcon />}
          title="Content types"
          summary="Which kinds of posts can show up"
          href={`${settingsUrl}/feed/preferences`}
        />
        <SettingLink
          icon={<AiIcon />}
          title="AI filters"
          summary="How much AI-generated content and clickbait to allow"
          href={`${settingsUrl}/feed/ai`}
        />
        <SettingLink
          icon={<SquadIcon />}
          title="Squads"
          summary="Squads you join count as sources you follow"
          href={`${webappUrl}squads`}
        />
        <SettingLink
          icon={<EyeIcon />}
          title="Reading history"
          summary="The posts your topics from reading come from"
          href={`${webappUrl}history`}
        />
      </ul>
    </PanelSection>
  );
};

const ResetRow = ({
  title,
  description,
  isDisabled,
  onReset,
  isDanger,
}: {
  title: string;
  description: string;
  isDisabled?: boolean;
  onReset: () => void;
  isDanger?: boolean;
}): ReactElement => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <li className="flex flex-wrap items-center gap-3 p-4">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">
          {title}
        </span>
        <span className="text-text-tertiary typo-footnote">{description}</span>
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
            onClick={() => {
              onReset();
              setIsConfirming(false);
            }}
          >
            Yes, reset
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          variant={isDanger ? ButtonVariant.Secondary : ButtonVariant.Float}
          color={isDanger ? ButtonColor.Ketchup : undefined}
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

export const ResetSection = (): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const learned = state.evidence.filter(
    ({ topic }) => !state.followedTags.includes(topic),
  ).length;
  const adjusted = new Set([
    ...Object.keys(state.controls),
    ...Object.keys(state.sourceControls),
    ...Object.keys(state.sourceWeights ?? {}),
  ]).size;
  const changedSettings =
    (Object.keys(state.params) as ParamKey[]).filter(
      (key) => state.params[key] !== defaultParams[key],
    ).length + (state.isFillingWithPopular ? 0 : 1);
  const seen = Object.keys(state.impressions).length;

  return (
    <PanelSection
      section={ControlSection.Reset}
      title="Start over"
      description="Each reset is separate. None of them touch your follows, blocks or filters."
    >
      <PanelCard>
        <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
          <ResetRow
            title="Forget my reading"
            description={
              learned
                ? `${learned} ${
                    learned === 1 ? 'topic' : 'topics'
                  } from your reading go away, and topics you follow lose what reading added. What you read next starts fresh.`
                : 'Nothing learned from your reading yet.'
            }
            isDisabled={!state.evidence.length}
            onReset={store.resetLearned}
          />
          <ResetRow
            title="Clear the boosts I set"
            description={
              adjusted
                ? `${adjusted} ${
                    adjusted === 1
                      ? 'topic or source goes'
                      : 'topics and sources go'
                  } back to automatic.`
                : "You haven't set any boosts."
            }
            isDisabled={!adjusted}
            onReset={store.resetControls}
          />
          <ResetRow
            title="Reset ranking settings"
            description={
              changedSettings
                ? `${changedSettings} changed ${
                    changedSettings === 1 ? 'setting goes' : 'settings go'
                  } back to the default.`
                : 'Every setting is at its default.'
            }
            isDisabled={!changedSettings && state.isLearning}
            onReset={store.resetParams}
          />
          <ResetRow
            title="Forget what I scrolled past"
            description={
              seen
                ? `${seen} ${
                    seen === 1
                      ? 'post you scrolled past gets'
                      : 'posts you scrolled past get'
                  } a fresh chance.`
                : "You haven't scrolled past anything yet."
            }
            isDisabled={!seen}
            onReset={store.clearSeen}
          />
          <ResetRow
            title="Reset everything"
            description="All of the above, plus posts you asked to see less of."
            onReset={store.resetAll}
            isDanger
          />
        </ul>
      </PanelCard>
    </PanelSection>
  );
};
