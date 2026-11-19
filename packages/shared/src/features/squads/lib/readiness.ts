import type { Squad } from '../../../graphql/sources';
import type { LoggedUser } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { getSquadManageUrl, SquadManageSection } from './routes';

// What a company page and the profile of the admin looking at it still miss,
// with where to fix each by hand and what to ask their agent.

export enum ReadinessGroup {
  Page = 'page',
  Profile = 'profile',
}

export interface ReadinessItem {
  id: string;
  group: ReadinessGroup;
  title: string;
  /** Why it matters, in one short line */
  hint: string;
  isDone: boolean;
  href: string;
  cta: string;
  /** What the agent should do, for the copied prompt */
  agentStep: string;
}

const PROFILE_SKILL_URL =
  'https://github.com/dailydotdev/daily/blob/master/skills/daily-dev-profile/SKILL.md';

export const isPlaceholderSquadImage = (image?: string): boolean =>
  !image || image.includes('squad_placeholder');

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
      title: 'Description',
      hint: "One or two sentences on what you build and who it's for.",
      isDone: !!squad.description?.trim(),
      href: manage(SquadManageSection.Details),
      cta: 'Write it',
      agentStep:
        "Description: one or two sentences on what we build and who it's for.",
    },
    {
      id: 'cover',
      group: ReadinessGroup.Page,
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
