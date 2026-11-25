// Agents fetch this URL, so it is the production one in every environment.
export const AGENT_ONBOARDING_SKILL_URL =
  'https://daily.dev/agents/onboarding.md';

// The instructions live in the skill, so they can improve without anyone
// copying a new prompt.
export const agentOnboardingPrompt = `Read ${AGENT_ONBOARDING_SKILL_URL} and follow it to set up my daily.dev account.`;
