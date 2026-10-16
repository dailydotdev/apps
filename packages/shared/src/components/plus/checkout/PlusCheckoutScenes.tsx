import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  LanguageIcon,
  ShieldCheckIcon,
  TerminalIcon,
  TourIcon,
} from '../../icons';
import { IconSize } from '../../Icon';
import type {
  PlusBannerAccent,
  PlusBannerFeature,
} from '../PlusFeedBannerScenes';
import {
  Bar,
  Card,
  Pill,
  Row,
  Scene,
  Title,
  accentStyle,
  plusBannerFeatures,
  useTimeline,
} from '../PlusFeedBannerScenes';

/* Scenes for the four Plus features the feed banner doesn't animate, so every
   row of the checkout's feature list plays one. Same primitives and rules as
   PlusFeedBannerScenes: skeleton feed, one element changes, one accent.
   What each shows follows the production feature copy (PlusList):
   - API: "higher rate limits" (no numbers: the limits aren't published here)
   - Auto-translate: "post titles and summaries into your preferred language"
   - Bonus quests: "one in your daily bucket and one in your weekly bucket"
   - Priority support: the Members-only Squad, "get priority support" */

// Accents beyond the PR's union; accentStyle only builds a CSS variable name.
const bacon = 'bacon' as PlusBannerAccent;
const cabbage = 'cabbage' as PlusBannerAccent;

/* ---------------------------------------------------------------- */
/* Higher API rate limits                                            */
/* ---------------------------------------------------------------- */

const requests = [
  '/feeds/popular',
  '/search?q=rust',
  '/bookmarks',
  '/feeds/custom/ai-coding',
];

const ApiScene = (): ReactElement => {
  const step = useTimeline([900, 1700]);
  const limited = step === 1;
  const plus = step >= 2;
  let meterWidth = '82%';
  if (plus) {
    meterWidth = '34%';
  } else if (step >= 1) {
    meterWidth = '100%';
  }
  return (
    <Scene>
      <div className="flex flex-col gap-1.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 font-mono typo-caption1">
        <div className="flex items-center gap-2 pb-1">
          <TerminalIcon size={IconSize.Size16} className="text-text-tertiary" />
          <span className="flex-1 text-text-tertiary">
            your-agent → api.daily.dev
          </span>
          {plus && <Pill accent="cheese">Plus limits</Pill>}
        </div>
        {requests.map((path, i) => {
          const last = i === requests.length - 1;
          const blocked = last && limited;
          return (
            <div key={path} className="flex items-center gap-2">
              <span className="text-text-quaternary">GET</span>
              <span className="min-w-0 flex-1 truncate text-text-secondary">
                {path}
              </span>
              {last && step === 0 ? (
                <Bar width="2.5rem" className="h-1.5" />
              ) : (
                <span
                  key={`${path}-${step}`}
                  className={classNames(
                    'plus-perk-in font-bold',
                    blocked || (last && plus)
                      ? 'plus-banner-tint-text'
                      : 'text-text-tertiary',
                  )}
                  style={accentStyle(blocked ? 'ketchup' : 'cheese')}
                >
                  {blocked ? '429 rate limited' : '200 OK'}
                </span>
              )}
            </div>
          );
        })}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-text-quaternary">requests / min</span>
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-max bg-surface-float">
            <span
              className="plus-banner-tint absolute inset-y-0 left-0 rounded-max transition-[width] duration-700"
              style={{
                ...accentStyle(plus ? 'cheese' : 'ketchup'),
                width: meterWidth,
              }}
            />
          </span>
        </div>
      </div>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

/* ---------------------------------------------------------------- */
/* Auto-translate your feed                                          */
/* ---------------------------------------------------------------- */

const TranslateScene = (): ReactElement => {
  const step = useTimeline([1000]);
  const translated = step >= 1;
  return (
    <Scene>
      <Row>
        <Card
          accent={translated ? bacon : undefined}
          source="Frontend Notes"
          tag="react"
          meta={
            translated ? (
              <Pill accent={bacon}>
                <LanguageIcon size={IconSize.Size16} />
                Español
              </Pill>
            ) : (
              <Pill>English</Pill>
            )
          }
          title={
            translated ? (
              <span key="es" className="plus-perk-in">
                <Title>
                  useTransition mantiene las entradas fluidas durante renders
                  pesados
                </Title>
              </span>
            ) : (
              <Title>
                useTransition keeps inputs responsive during heavy renders
              </Title>
            )
          }
        />
      </Row>
      <Row>
        <Card
          accent={translated ? bacon : undefined}
          source="Infra Weekly"
          tag="kubernetes"
          title={
            translated ? (
              <span
                key="es2"
                className="plus-perk-in"
                style={{ animationDelay: '120ms' }}
              >
                <Title>Cómo reducir el arranque en frío de tus pods</Title>
              </span>
            ) : (
              <Title>How to cut cold starts in your pods</Title>
            )
          }
        />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

/* ---------------------------------------------------------------- */
/* Bonus quest slots                                                 */
/* ---------------------------------------------------------------- */

const QuestRow = ({
  name,
  reward,
  bonus,
}: {
  name?: string;
  reward?: string;
  bonus?: boolean;
}) => (
  <div
    className={classNames(
      'flex h-7 items-center gap-2 rounded-8 px-2.5',
      bonus ? 'plus-banner-tint-soft plus-perk-in' : 'bg-background-subtle',
    )}
    style={bonus ? accentStyle(cabbage) : undefined}
  >
    <TourIcon
      size={IconSize.Size16}
      className={bonus ? 'plus-banner-tint-text' : 'text-text-quaternary'}
    />
    {name ? (
      <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-caption1">
        {name}
      </span>
    ) : (
      <span className="flex-1">
        <Bar width="55%" />
      </span>
    )}
    {bonus && <Pill accent={cabbage}>Plus slot</Pill>}
    {reward ? (
      <span
        className={classNames(
          'tabular-nums typo-caption1',
          bonus ? 'plus-banner-tint-text font-bold' : 'text-text-tertiary',
        )}
      >
        {reward}
      </span>
    ) : (
      <Bar width="2rem" className="h-1.5" />
    )}
  </div>
);

const QuestsScene = (): ReactElement => {
  const shown = useTimeline([800, 1200]);
  return (
    <Scene>
      <div className="flex flex-col gap-1">
        <span className="px-1 font-bold text-text-tertiary typo-caption2">
          Daily quests
        </span>
        <QuestRow />
        {shown >= 1 && (
          <QuestRow bonus name="Read 3 posts tagged #rust" reward="+XP" />
        )}
        <span className="px-1 pt-1 font-bold text-text-tertiary typo-caption2">
          Weekly quests
        </span>
        {shown >= 2 && (
          <QuestRow bonus name="Upvote 10 posts this week" reward="+Cores" />
        )}
        <QuestRow />
      </div>
    </Scene>
  );
};

/* ---------------------------------------------------------------- */
/* Priority support                                                  */
/* ---------------------------------------------------------------- */

const SupportScene = (): ReactElement => {
  const step = useTimeline([700, 1600]);
  return (
    <Scene>
      <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3">
        <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary pb-2">
          <span aria-hidden className="size-5 rounded-6 bg-surface-float" />
          <span className="flex-1 font-bold text-text-primary typo-footnote">
            Plus members
          </span>
          <span className="text-text-quaternary typo-caption2">
            Members-only Squad
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span
            aria-hidden
            className="size-6 shrink-0 rounded-max bg-surface-float"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <Bar width="22%" className="h-1.5" />
            <span className="text-text-secondary typo-caption1">
              My custom feed stopped picking up new #rust posts. Anyone else?
            </span>
          </span>
        </div>
        {step >= 1 && (
          <div className="plus-perk-in flex items-start gap-2">
            <span
              aria-hidden
              className="plus-banner-tint size-6 shrink-0 rounded-max border"
              style={accentStyle('onion')}
            />
            <span
              className="plus-banner-tint-soft flex min-w-0 flex-1 flex-col gap-1 rounded-10 px-2.5 py-2"
              style={accentStyle('onion')}
            >
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-text-primary typo-caption1">
                  daily.dev team
                </span>
                <Pill accent="onion">
                  <ShieldCheckIcon size={IconSize.Size16} />
                  Priority
                </Pill>
              </span>
              <span className="text-text-secondary typo-caption1">
                {step >= 2
                  ? 'Found it: a source changed its feed. Fixed, your posts are back.'
                  : 'Looking into it now.'}
              </span>
            </span>
          </div>
        )}
      </div>
    </Scene>
  );
};

/* ---------------------------------------------------------------- */

/** Ids follow production's PlusList ids, as #6868's do, so analytics read the same. */
export const moreFeatures: PlusBannerFeature[] = [
  {
    id: 'public-api',
    label: 'Higher API rate limits',
    perk: 'Raises your API rate limits',
    Icon: TerminalIcon,
    accent: 'cheese',
    Scene: ApiScene,
  },
  {
    id: 'auto-translate',
    label: 'Auto-translate',
    perk: 'Translates titles and summaries into your language',
    Icon: LanguageIcon,
    accent: bacon,
    Scene: TranslateScene,
  },
  {
    id: 'bonus-quest-slots',
    label: 'Bonus quest slots',
    perk: 'Adds a daily and a weekly quest slot',
    Icon: TourIcon,
    accent: cabbage,
    Scene: QuestsScene,
  },
  {
    id: 'member squad',
    label: 'Priority support',
    perk: 'Faster answers in the Members-only Squad',
    Icon: ShieldCheckIcon,
    accent: 'onion',
    Scene: SupportScene,
  },
];

/** #6868's six + these four: one entry per checklist feature. */
export const allSceneFeatures: PlusBannerFeature[] = [
  ...plusBannerFeatures,
  ...moreFeatures,
];
