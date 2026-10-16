import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { settingsUrl, webappUrl } from '@dailydotdev/shared/src/lib/constants';
import type { ParamKey } from '../../policy/params';
import { defaultParams } from '../../policy/params';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { PanelCard, PanelSection } from './Section';

const LinkRow = ({
  title,
  summary,
  href,
}: {
  title: string;
  summary: ReactNode;
  href: string;
}): ReactElement => (
  <li>
    <a
      href={href}
      className="flex items-center gap-3 p-4 hover:bg-surface-float"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">{title}</span>
        <span className="truncate text-text-tertiary typo-footnote">
          {summary}
        </span>
      </span>
      <ArrowIcon
        size={IconSize.Size16}
        className="shrink-0 rotate-90 text-text-tertiary"
      />
    </a>
  </li>
);

const list = (items: string[], empty: string): string =>
  items.length ? items.join(', ') : empty;

/** Where the explicit choices already live; this page only links to them. */
export const SettingsSection = (): ReactElement => {
  const { state } = usePersonalization();
  const blockedCount =
    state.blockedTags.length +
    state.blockedSources.length +
    state.blockedAuthors.length;

  return (
    <PanelSection
      section={ControlSection.Settings}
      title="Your explicit choices"
      description="Follows, blocks and filters you set yourself. They are hard rules: filters remove posts before ranking even starts."
    >
      <PanelCard>
        <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
          <LinkRow
            title={`Topics you follow (${state.followedTags.length})`}
            summary={list(
              state.followedTags.map((tag) => `#${tag}`),
              'None yet',
            )}
            href={`${settingsUrl}/feed/tags`}
          />
          <LinkRow
            title={`Sources and people you follow (${
              state.followedSources.length + state.followedAuthors.length
            })`}
            summary={list(state.followedSources, 'None yet')}
            href={`${settingsUrl}/feed/sources`}
          />
          <LinkRow
            title="Squads"
            summary="Squads you join count as followed sources."
            href={`${webappUrl}squads`}
          />
          <LinkRow
            title={`Blocked (${blockedCount})`}
            summary={list(
              [
                ...state.blockedTags.map((tag) => `#${tag}`),
                ...state.blockedSources,
              ],
              'Topics, sources, people and title words you blocked',
            )}
            href={`${settingsUrl}/feed/blocked`}
          />
          <LinkRow
            title="Content and post types"
            summary="Which kinds of posts can appear at all"
            href={`${settingsUrl}/feed/preferences`}
          />
          <LinkRow
            title="AI filters"
            summary="How much AI-generated content and clickbait to allow"
            href={`${settingsUrl}/feed/ai`}
          />
          <LinkRow
            title="Reading history"
            summary="The posts your learned topics come from"
            href={`${webappUrl}history`}
          />
        </ul>
      </PanelCard>
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
        <span className="font-bold text-text-primary typo-callout">{title}</span>
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
  const adjustments =
    Object.keys(state.controls).length + Object.keys(state.sourceControls).length;
  const changedKnobs = (Object.keys(state.params) as ParamKey[]).filter(
    (key) => state.params[key] !== defaultParams[key],
  ).length;
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
            title="Forget what the feed learned"
            description={`Drops what your reading taught it (${state.evidence.length} topics, ${learned} of them not followed). Reading from now on builds a fresh profile.`}
            isDisabled={!state.evidence.length}
            onReset={store.resetLearned}
          />
          <ResetRow
            title="Clear your More, Less and Mute"
            description={
              adjustments
                ? `${adjustments} adjusted ${adjustments === 1 ? 'topic or source' : 'topics and sources'} go back to automatic.`
                : 'Nothing adjusted yet.'
            }
            isDisabled={!adjustments}
            onReset={store.resetControls}
          />
          <ResetRow
            title="Default ranking"
            description={
              changedKnobs
                ? `${changedKnobs} changed ${changedKnobs === 1 ? 'knob goes' : 'knobs go'} back to the default.`
                : 'Every knob is at its default.'
            }
            isDisabled={!changedKnobs && state.isLearning && state.isFillingWithPopular}
            onReset={store.resetParams}
          />
          <ResetRow
            title="Forget what you scrolled past"
            description={`${seen} ${seen === 1 ? 'post you passed gets' : 'posts you passed get'} a fresh chance.`}
            isDisabled={!seen}
            onReset={store.clearSeen}
          />
          <ResetRow
            title="Reset all personalization"
            description="All of the above, plus posts you asked to see fewer of."
            onReset={store.resetAll}
            isDanger
          />
        </ul>
      </PanelCard>
    </PanelSection>
  );
};
