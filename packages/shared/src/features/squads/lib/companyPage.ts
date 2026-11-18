import type { Squad } from '../../../graphql/sources';
import { isCompanySquad } from './features';

// Agents fetch this URL, so it is the production one in every environment.
export const COMPANY_PAGE_SKILL_URL = 'https://daily.dev/agents/company.md';

export const companyPagePrompt = `Read ${COMPANY_PAGE_SKILL_URL} and set up a free daily.dev company page for my company.`;

// Free company pages carry the flag; plan and Enterprise pages may predate it
export const isCompanyPage = (
  squad: Pick<Squad, 'flags' | 'features'>,
): boolean => !!squad.flags?.company || isCompanySquad(squad);
