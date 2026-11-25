import type { Squad } from '../../../graphql/sources';
import { isCompanySquad } from './features';

// Agents fetch this URL, so it is the production one in every environment.
export const COMPANY_PAGE_SKILL_URL = 'https://daily.dev/agents/company.md';

export const companyPagePrompt = `Read ${COMPANY_PAGE_SKILL_URL} and set up a free daily.dev company page for my company.`;

// Free company pages carry the flag; plan and Enterprise pages may predate it
export const isCompanyPage = (
  squad: Pick<Squad, 'flags' | 'features'>,
): boolean => !!squad.flags?.company || isCompanySquad(squad);

/**
 * Hands what's still missing on a company page and its admin's profile to
 * their agent. The page may be half done by hand or by an earlier prompt, so
 * the agent starts from what is there now and never makes a new page.
 */
export const getCompanyPageReadinessPrompt = ({
  handle,
  steps,
  plan,
}: {
  handle: string;
  steps: string[];
  /** "Starter", when the page is on a plan */
  plan?: string;
}): string =>
  [
    `Finish our daily.dev company page @${handle} and my daily.dev profile${
      plan ? `, and help us get the most out of our ${plan} plan` : ''
    }. Use the daily.dev MCP tools if you have them, otherwise my daily.dev API token (\`DAILY_DEV_TOKEN\`). If you have neither, read ${COMPANY_PAGE_SKILL_URL} and connect the way it says.`,
    '',
    `The page already exists, so update @${handle} and don't create a new one. Read the page and my profile as they are now first, and skip anything that's already filled in. I may have done some of it since I copied this.`,
    '',
    'What was missing when I copied this:',
    ...steps.map((step) => `- ${step}`),
    '',
    "Before each change, show me what you'll save and wait for my OK. Finish with a link to the page and a short list of anything left.",
  ].join('\n');
