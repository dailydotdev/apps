import type { Squad } from '../../../graphql/sources';
import type {
  SquadWelcome,
  SquadWelcomeInput,
} from '../../../graphql/squadWelcomeAudience';

export const SQUAD_WELCOME_HEADLINE_MAX = 60;
export const SQUAD_WELCOME_TEXT_MAX = 160;
export const SQUAD_WELCOME_CTA_LABEL_MAX = 24;
export const SQUAD_WELCOME_RULES_SHOWN = 3;

/** What the pop-up shows, with the defaults filled in. */
export interface SquadWelcomeView {
  coverUrl?: string;
  imageUrl: string;
  headline: string;
  text: string | null;
  rules: string[];
  ctaLabel: string;
  ctaUrl: string | null;
}

export const getSquadWelcomeView = (
  welcome: Omit<SquadWelcome, 'enabled'>,
  squad: Pick<Squad, 'name' | 'image' | 'headerImage' | 'rules'>,
): SquadWelcomeView => ({
  coverUrl: welcome.coverUrl ?? squad.headerImage,
  imageUrl: welcome.imageUrl ?? squad.image,
  headline: welcome.headline || `Welcome to ${squad.name}`,
  text: welcome.text,
  rules: welcome.showRules
    ? (squad.rules ?? [])
        .slice(0, SQUAD_WELCOME_RULES_SHOWN)
        .map(({ title }) => title)
    : [],
  ctaLabel: welcome.ctaLabel || (welcome.ctaUrl ? 'Open' : 'Got it'),
  ctaUrl: welcome.ctaUrl,
});

type WelcomeText = Pick<
  SquadWelcomeInput,
  'headline' | 'text' | 'showRules' | 'ctaLabel' | 'ctaUrl'
>;

/**
 * The same template filled in four ways, as a starting point. Only the
 * words change; the images stay whatever the squad chose.
 */
export const getSquadWelcomeExamples = (
  squad: Pick<Squad, 'name'>,
): { label: string; text: WelcomeText }[] => [
  {
    label: 'Default',
    text: {
      headline: `Welcome to ${squad.name}`,
      text: 'Launches and answers from the team now show in your feed. A few house rules:',
      showRules: true,
      ctaLabel: 'Introduce yourself',
      ctaUrl: null,
    },
  },
  {
    label: 'An event',
    text: {
      headline: 'Join us live',
      text: 'Our next session is open to every member: 45 minutes with the team, then your questions.',
      showRules: false,
      ctaLabel: 'Save my spot',
      ctaUrl: null,
    },
  },
  {
    label: 'A product',
    text: {
      headline: `Try ${squad.name}`,
      text: 'Members get started free. Here is the quickest way in.',
      showRules: false,
      ctaLabel: 'Start free',
      ctaUrl: null,
    },
  },
  {
    label: 'A launch',
    text: {
      headline: 'Our biggest launch this year',
      text: 'Here is what it does and why we built it.',
      showRules: false,
      ctaLabel: 'Read the launch',
      ctaUrl: null,
    },
  },
];
