import type { Squad } from '../../../graphql/sources';
import type { LoggedUser } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { getSquadManageUrl, getSquadUrl, SquadManageSection } from './routes';
import { getStartupsSkillPrompt, skillRef } from './setup';

// What a company page and the profile of the admin looking at it still miss,
// with where to fix each by hand and what to ask their agent.

export enum ReadinessGroup {
  Page = 'page',
  Profile = 'profile',
  Reach = 'reach',
  Agent = 'agent',
  Included = 'included',
}

export enum ReadinessKind {
  /** Something to fill in or do, once */
  Task = 'task',
  /** A skill to try from their agent: copies a prompt */
  Skill = 'skill',
  /** Part of the plan that needs nothing from them */
  Included = 'included',
}

/** The checkout's in-place editors that a row can open */
export type ReadinessEditor = 'details' | 'links' | 'product' | 'intel' | 'cta';

export interface ReadinessItem {
  id: string;
  group: ReadinessGroup;
  title: string;
  /** Why it matters, in one short line */
  hint: string;
  isDone: boolean;
  /** Unset for a task */
  kind?: ReadinessKind;
  href?: string;
  cta?: string;
  /** What the agent should do, for the copied prompt */
  agentStep?: string;
  /** A skill's own prompt, copied by its button */
  prompt?: string;
  /** Opens in place in the checkout instead of going to settings */
  editor?: ReadinessEditor;
}

const PROFILE_SKILL_URL =
  'https://github.com/dailydotdev/daily/blob/master/skills/daily-dev-profile/SKILL.md';

export const isPlaceholderSquadImage = (image?: string): boolean =>
  !image || image.includes('squad_placeholder');

/** Mirrors COMPANY_PAGE_MIN_DESCRIPTION_LENGTH in daily-api */
export const COMPANY_PAGE_MIN_DESCRIPTION_LENGTH = 40;

/** What a company page needs before its free boost can start */
export const FREE_BOOST_SETUP_ROWS = ['logo', 'website', 'description'];

export const isCompanyPageDescriptionReady = (description?: string): boolean =>
  (description?.trim().length ?? 0) >= COMPANY_PAGE_MIN_DESCRIPTION_LENGTH;

export const getCompanyPageReadinessItems = ({
  squad,
  user,
  hasLinks,
  products,
}: {
  squad: Pick<
    Squad,
    'handle' | 'image' | 'description' | 'headerImage' | 'website' | 'links'
  >;
  user: Pick<LoggedUser, 'profileCompletion'>;
  /** Paid pages list more links than the website */
  hasLinks: boolean;
  /** How many products the page lists; unset when its plan has none */
  products?: number;
}): ReadinessItem[] => {
  const manage = (section: SquadManageSection) =>
    getSquadManageUrl(squad.handle, section);
  const profile = user.profileCompletion;
  const items: Array<ReadinessItem | false> = [
    {
      id: 'logo',
      group: ReadinessGroup.Page,
      editor: 'details',
      title: 'Logo',
      hint: 'Shows on every post from your page.',
      isDone: !isPlaceholderSquadImage(squad.image),
      href: manage(SquadManageSection.Details),
      cta: 'Add logo',
      agentStep: 'Logo: use the one from our website, or ask me for it.',
    },
    {
      id: 'description',
      group: ReadinessGroup.Page,
      editor: 'details',
      title: 'Description',
      hint: "One or two sentences on what you build and who it's for.",
      isDone: isCompanyPageDescriptionReady(squad.description),
      href: manage(SquadManageSection.Details),
      cta: 'Write it',
      agentStep:
        "Description: one or two sentences on what we build and who it's for.",
    },
    {
      id: 'cover',
      group: ReadinessGroup.Page,
      editor: 'details',
      title: 'Cover image',
      hint: 'The banner at the top of your page.',
      isDone: !!squad.headerImage,
      href: manage(SquadManageSection.Details),
      cta: 'Add cover',
      agentStep:
        "Cover image: a wide image from our site. If there's none, make one with our logo, name and one line on what we do, and show it to me first.",
    },
    {
      id: 'website',
      group: ReadinessGroup.Page,
      editor: 'links',
      title: 'Website',
      hint: "Your site's link, at the top of your page.",
      isDone: !!squad.website,
      href: manage(SquadManageSection.Links),
      cta: 'Add website',
      agentStep: "Website: our site's homepage.",
    },
    hasLinks && {
      id: 'links',
      group: ReadinessGroup.Page,
      editor: 'links',
      title: 'Docs and GitHub links',
      hint: 'Where developers go to try your product.',
      isDone: !!squad.links?.length,
      href: manage(SquadManageSection.Links),
      cta: 'Add links',
      agentStep: 'Links: docs, GitHub, changelog, community.',
    },
    products !== undefined && {
      id: 'product',
      group: ReadinessGroup.Page,
      editor: 'product',
      title: 'Your product',
      hint: 'A card with its tagline, pricing and link.',
      isDone: products > 0,
      href: manage(SquadManageSection.Products),
      cta: 'Add product',
      agentStep: 'Product: name, tagline, URL and pricing.',
    },
    !!profile && {
      id: 'photo',
      group: ReadinessGroup.Profile,
      title: 'Photo',
      hint: 'Shows next to every post you write.',
      isDone: profile.hasProfileImage,
      href: `${webappUrl}settings/profile`,
      cta: 'Add photo',
      agentStep: 'My photo: ask me for one.',
    },
    !!profile && {
      id: 'headline',
      group: ReadinessGroup.Profile,
      title: 'Headline',
      hint: "Who you are, like 'Co-founder of Acme'.",
      isDone: profile.hasHeadline,
      href: `${webappUrl}settings/profile?field=bio`,
      cta: 'Add headline',
      agentStep: `My headline: improve my profile with the daily-dev-profile skill (if you don't have it, read and follow ${PROFILE_SKILL_URL}).`,
    },
    !!profile && {
      id: 'job',
      group: ReadinessGroup.Profile,
      title: 'Current job',
      hint: 'Shows readers you build what you write about.',
      isDone: profile.hasWork,
      href: `${webappUrl}settings/profile/experience/work`,
      cta: 'Add job',
      agentStep: 'My current job: add it to my work experience.',
    },
  ];

  return items.filter((item): item is ReadinessItem => !!item);
};

// docs.daily.dev page on what the feed recommends and why a post gets less reach
const REACH_DOCS_URL = 'https://docs.daily.dev/what-the-feed-recommends/';

/**
 * What a plan adds to the readiness rows: reaching developers, the skills
 * their agent can use, and what the plan does without them.
 */
export const getPlanChecklistItems = ({
  squad,
  hasSeat,
  intelTopics,
  hasCta,
  done,
  credits,
}: {
  squad: Pick<Squad, 'handle'>;
  /** Intel and the API are for paid seats */
  hasSeat: boolean;
  /** How many topics the plan's intel covers, unset when unknown */
  intelTopics?: number;
  /** The plan has the header CTA */
  hasCta: boolean;
  done: Record<
    'cta' | 'intel' | 'post' | 'boost' | 'agent' | PlanChecklistSkill,
    boolean
  >;
  /** "$245", the boost credits in the page wallet */
  credits?: string;
}): ReadinessItem[] => {
  const { handle } = squad;
  const manage = (section: SquadManageSection) =>
    getSquadManageUrl(handle, section);
  const skill = (
    id: PlanChecklistSkill,
    title: string,
    hint: string,
  ): ReadinessItem => ({
    id,
    group: ReadinessGroup.Agent,
    kind: ReadinessKind.Skill,
    title,
    hint,
    isDone: done[id],
    cta: 'Try it',
    prompt: getStartupsSkillPrompt(id, handle),
  });
  const items: Array<ReadinessItem | false> = [
    hasCta && {
      id: 'cta',
      group: ReadinessGroup.Page,
      editor: 'cta',
      title: 'Header CTA',
      hint: 'Send developers to sign up, your docs or a demo.',
      isDone: done.cta,
      href: manage(SquadManageSection.Branding),
      cta: 'Add CTA',
      agentStep:
        'Header CTA: a short label and the URL developers should land on, like sign up or docs.',
    },
    hasSeat && {
      id: 'intel',
      group: ReadinessGroup.Reach,
      editor: 'intel',
      title: 'Pick your intel topics',
      hint: 'See what developers in your space read, every Monday.',
      isDone: done.intel,
      href: manage(SquadManageSection.Intel),
      cta: 'Pick topics',
      agentStep: `Weekly intel: pick ${
        intelTopics ? `up to ${intelTopics}` : 'the'
      } daily.dev tags that match what we build and save them as our intel topics.`,
    },
    {
      id: 'post',
      group: ReadinessGroup.Reach,
      title: 'Publish your first post',
      hint: 'Developers see it in their feed, on Google and in AI answers.',
      isDone: done.post,
      href: `${webappUrl}squads/create?sid=${handle}`,
      cta: 'Write a post',
      agentStep: `First post: suggest one with ${skillRef(
        'daily-dev-content-ideas',
      )}. I write it myself, so don't write it or a draft. When it's written, review it with ${skillRef(
        'daily-dev-content-review',
      )} and publish it to @${handle} when I say so.`,
    },
    {
      id: 'boost',
      group: ReadinessGroup.Reach,
      title: 'Boost a post with your credits',
      hint: credits
        ? `Your page wallet has ${credits} in boost credits for it.`
        : 'Your page wallet pays for it.',
      isDone: done.boost,
      href: getSquadUrl(handle),
      cta: 'Boost',
      agentStep:
        "Boost: check our page wallet and the estimated reach of boosting our best post, recommend a budget, and start it from the page wallet when I say yes. If the wallet can't cover it, tell me.",
    },
    hasSeat && {
      id: 'agent',
      group: ReadinessGroup.Agent,
      title: 'Connect your agent',
      hint: 'A one-time setup in Claude Code, Cursor or Codex.',
      isDone: done.agent,
      href: manage(SquadManageSection.Agent),
      cta: 'Show me',
    },
    hasSeat &&
      skill(
        'strategy',
        'Plan your content',
        'Your agent asks about your readers and what your team knows, then saves a plan for what to post each week.',
      ),
    hasSeat &&
      skill(
        'ideas',
        'Get post ideas',
        'Your agent reads your intel and recent work and suggests posts. You write them.',
      ),
    hasSeat &&
      skill(
        'review',
        'Review a post before you publish',
        'Your agent flags what limits reach, like a post that reads as an ad.',
      ),
    hasSeat &&
      skill(
        'routine',
        'Get a daily report',
        'Each morning, how your posts and boosts did, plus a reminder when the next post is due.',
      ),
    {
      id: 'indexed',
      group: ReadinessGroup.Included,
      kind: ReadinessKind.Included,
      title: 'On Google and in AI answers',
      hint: 'Your page and every post get indexed.',
      isDone: true,
    },
    {
      id: 'agent-views',
      group: ReadinessGroup.Included,
      kind: ReadinessKind.Included,
      title: 'See which AI agents read your posts',
      hint: 'Find ChatGPT, Claude and other agents in your page analytics.',
      isDone: true,
      href: manage(SquadManageSection.Analytics),
      cta: 'Open',
    },
    {
      id: 'reach-notes',
      group: ReadinessGroup.Included,
      kind: ReadinessKind.Included,
      title: 'Reach notes',
      hint: 'If a post gets less reach, we tell you why and how to fix it.',
      isDone: true,
      href: REACH_DOCS_URL,
      cta: 'Learn more',
    },
  ];

  return items.filter((item): item is ReadinessItem => !!item);
};

export type PlanChecklistSkill = 'strategy' | 'ideas' | 'review' | 'routine';

/** Rows that count towards the progress bar and decide when it's all done */
export const isCountedItem = (item: ReadinessItem): boolean =>
  item.kind !== ReadinessKind.Included;
