import type { Opportunity } from '../../opportunity/types';

/**
 * Simple seeded random number generator for consistent randomization per session.
 * Uses a linear congruential generator (LCG) algorithm.
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Returns a pseudo-random number between 0 and 1.
   */
  next(): number {
    // LCG parameters from Numerical Recipes
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
    return this.seed / 2 ** 32;
  }

  /**
   * Returns a pseudo-random integer between 0 (inclusive) and max (exclusive).
   */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /**
   * Returns a pseudo-random integer between min (inclusive) and max (inclusive).
   */
  nextIntRange(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
}

/**
 * Simple hash function to convert a string to a number.
 * Uses a polynomial rolling hash algorithm.
 */
export function hashCode(str: string): number {
  let hash = 0;
  const prime = 31;

  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash * prime + char) % 2 ** 32;
  }

  return Math.abs(hash);
}

/**
 * Skill-based message templates that use {keyword} placeholder.
 * These will be cycled through with each keyword from the opportunity.
 */
const SKILL_MESSAGE_TEMPLATES = [
  'Matching {keyword} interest to your role...',
  'Reviewing {keyword} engagement patterns...',
];

/**
 * Location-based message template that uses {location} placeholder.
 * Works with city, country, or continent.
 */
const LOCATION_MESSAGE_TEMPLATE = 'Searching for candidates in {location}...';

/**
 * Generic messages that don't require any opportunity data.
 */
const GENERIC_MESSAGES = [
  'Matching profiles to role requirements...',
  'Scanning developer profiles...',
  'Analyzing reading patterns...',
  'Checking candidate availability...',
  'Reviewing job preferences...',
];

/**
 * Gets all keywords from the opportunity.
 */
function getKeywords(opportunity: Opportunity | undefined): string[] {
  const keywords = opportunity?.keywords;
  if (!keywords?.length) {
    return [];
  }
  return keywords.map((k) => k.keyword);
}

/**
 * Gets the best available location string from the opportunity.
 * Priority: city > country > continent
 */
function getLocation(opportunity: Opportunity | undefined): string | undefined {
  const locations = opportunity?.locations;
  if (!locations?.length) {
    return undefined;
  }

  // Try to find a location with city first
  const cityLoc = locations.find((loc) => loc.location?.city);
  if (cityLoc?.location?.city) {
    return cityLoc.location.city;
  }

  // Then try country
  const countryLoc = locations.find((loc) => loc.location?.country);
  if (countryLoc?.location?.country) {
    return countryLoc.location.country;
  }

  // Finally try continent
  const continentLoc = locations.find((loc) => loc.location?.continent);
  if (continentLoc?.location?.continent) {
    return continentLoc.location.continent;
  }

  return undefined;
}

/**
 * Builds the complete list of messages by cycling through all keywords
 * with each skill template, plus location and generic messages.
 */
export function buildMessageList(
  opportunity: Opportunity | undefined,
): string[] {
  const keywords = getKeywords(opportunity);
  const location = getLocation(opportunity);

  // Add skill-based messages for each keyword
  // Cycle through: keyword1+template1, keyword1+template2, keyword2+template1, ...
  const skillMessages = keywords.flatMap((keyword) =>
    SKILL_MESSAGE_TEMPLATES.map((template) =>
      template.replace('{keyword}', keyword),
    ),
  );

  // Add location message if available
  const locationMessages = location
    ? [LOCATION_MESSAGE_TEMPLATE.replace('{location}', location)]
    : [];

  return [...skillMessages, ...locationMessages, ...GENERIC_MESSAGES];
}

/**
 * Shuffles an array using the Fisher-Yates algorithm with a seeded random.
 */
function shuffleArray<T>(array: T[], random: SeededRandom): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = random.nextInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a message for the agent status bar based on opportunity data.
 * Uses seeded randomization for consistent message order per session.
 */
export function generateMessage(
  opportunity: Opportunity | undefined,
  messageIndex: number,
  seed: number,
): string {
  // Build the message list and shuffle with seed for consistent order per session
  const messages = buildMessageList(opportunity);
  const random = new SeededRandom(seed);
  const shuffledMessages = shuffleArray(messages, random);

  // Cycle through shuffled messages
  const index = messageIndex % shuffledMessages.length;
  return shuffledMessages[index];
}

/**
 * Creates a seed based on opportunityId and current date.
 * This ensures consistent randomization per session/day.
 */
export function createSeed(opportunityId: string): number {
  const dateString = new Date().toDateString();
  return hashCode(opportunityId + dateString);
}

/**
 * Fixed interval between messages in seconds.
 * Used for calculating consistent messageIndex from time.
 */
export const MESSAGE_INTERVAL_SECONDS = 10;

/**
 * Gets the timestamp for midnight of the current day.
 */
export function getMidnightTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/**
 * Calculates the message index based on seconds elapsed since midnight.
 * This ensures consistency across page refreshes - same second = same message.
 */
export function getMessageIndexFromTime(): number {
  const secondsSinceMidnight = (Date.now() - getMidnightTimestamp()) / 1000;
  return Math.floor(secondsSinceMidnight / MESSAGE_INTERVAL_SECONDS);
}

/**
 * Gets milliseconds until the next message transition.
 */
export function getMillisecondsUntilNextMessage(): number {
  const secondsSinceMidnight = (Date.now() - getMidnightTimestamp()) / 1000;
  const secondsIntoCurrentInterval =
    secondsSinceMidnight % MESSAGE_INTERVAL_SECONDS;
  const secondsRemaining =
    MESSAGE_INTERVAL_SECONDS - secondsIntoCurrentInterval;
  return secondsRemaining * 1000;
}
