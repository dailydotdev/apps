import type { LogData, Archetype } from '../types/log';
import { ARCHETYPES } from '../types/log';

/**
 * Validation result for log data
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Check if a value is a valid archetype
 */
function isValidArchetype(value: unknown): value is Archetype {
  return (
    typeof value === 'string' &&
    Object.keys(ARCHETYPES).includes(value as Archetype)
  );
}

/**
 * Check if a value is a valid reading pattern
 */
function isValidReadingPattern(
  value: unknown,
): value is 'night' | 'early' | 'afternoon' {
  return (
    typeof value === 'string' && ['night', 'early', 'afternoon'].includes(value)
  );
}

/**
 * Validate that the uploaded JSON matches the LogData structure
 */
export function validateLogData(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Must be an object
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['Data must be a JSON object'],
    };
  }

  const logData = data as Partial<LogData>;

  // Required fields for Card 1: Total Impact
  if (typeof logData.totalPosts !== 'number' || logData.totalPosts < 0) {
    errors.push('totalPosts must be a non-negative number');
  }
  if (
    typeof logData.totalReadingTime !== 'number' ||
    logData.totalReadingTime < 0
  ) {
    errors.push('totalReadingTime must be a non-negative number');
  }
  if (typeof logData.daysActive !== 'number' || logData.daysActive < 0) {
    errors.push('daysActive must be a non-negative number');
  }
  if (
    typeof logData.totalImpactPercentile !== 'number' ||
    logData.totalImpactPercentile < 0 ||
    logData.totalImpactPercentile > 100
  ) {
    errors.push('totalImpactPercentile must be a number between 0 and 100');
  }

  // Required fields for Card 2: When You Read
  if (typeof logData.peakDay !== 'string' || !logData.peakDay) {
    errors.push('peakDay must be a non-empty string (e.g., "Thursday")');
  }
  if (!isValidReadingPattern(logData.readingPattern)) {
    errors.push(
      'readingPattern must be one of: "night", "early", or "afternoon"',
    );
  }
  if (
    typeof logData.patternPercentile !== 'number' ||
    logData.patternPercentile < 0 ||
    logData.patternPercentile > 100
  ) {
    errors.push('patternPercentile must be a number between 0 and 100');
  }
  if (!Array.isArray(logData.activityHeatmap)) {
    errors.push('activityHeatmap must be an array');
  } else if (logData.activityHeatmap.length !== 7) {
    errors.push('activityHeatmap must have 7 rows (days)');
  } else {
    logData.activityHeatmap.forEach((row, i) => {
      if (!Array.isArray(row) || row.length !== 24) {
        errors.push(`activityHeatmap row ${i} must have 24 hours`);
      }
    });
  }

  // Required fields for Card 3: Topic Evolution
  if (!Array.isArray(logData.topicJourney)) {
    errors.push('topicJourney must be an array');
  }
  if (typeof logData.uniqueTopics !== 'number' || logData.uniqueTopics < 0) {
    errors.push('uniqueTopics must be a non-negative number');
  }
  if (
    typeof logData.evolutionPercentile !== 'number' ||
    logData.evolutionPercentile < 0 ||
    logData.evolutionPercentile > 100
  ) {
    errors.push('evolutionPercentile must be a number between 0 and 100');
  }

  // Required fields for Card 4: Favorite Sources
  if (!Array.isArray(logData.topSources) || logData.topSources.length !== 3) {
    errors.push('topSources must be an array with exactly 3 sources');
  } else {
    logData.topSources.forEach((source, i) => {
      if (typeof source !== 'object' || source === null) {
        errors.push(`topSources[${i}] must be an object`);
      } else {
        if (typeof source.name !== 'string') {
          errors.push(`topSources[${i}].name must be a string`);
        }
        if (typeof source.postsRead !== 'number' || source.postsRead < 0) {
          errors.push(
            `topSources[${i}].postsRead must be a non-negative number`,
          );
        }
        if (typeof source.logoUrl !== 'string') {
          errors.push(`topSources[${i}].logoUrl must be a string`);
        }
      }
    });
  }
  if (typeof logData.uniqueSources !== 'number' || logData.uniqueSources < 0) {
    errors.push('uniqueSources must be a non-negative number');
  }
  if (
    typeof logData.sourcePercentile !== 'number' ||
    logData.sourcePercentile < 0 ||
    logData.sourcePercentile > 100
  ) {
    errors.push('sourcePercentile must be a number between 0 and 100');
  }
  if (
    typeof logData.sourceLoyaltyName !== 'string' ||
    !logData.sourceLoyaltyName
  ) {
    errors.push('sourceLoyaltyName must be a non-empty string');
  }

  // Required fields for Card 5: Community Engagement
  if (typeof logData.upvotesGiven !== 'number' || logData.upvotesGiven < 0) {
    errors.push('upvotesGiven must be a non-negative number');
  }
  if (
    typeof logData.commentsWritten !== 'number' ||
    logData.commentsWritten < 0
  ) {
    errors.push('commentsWritten must be a non-negative number');
  }
  if (
    typeof logData.postsBookmarked !== 'number' ||
    logData.postsBookmarked < 0
  ) {
    errors.push('postsBookmarked must be a non-negative number');
  }

  // Optional fields for Card 6: Contributions
  if (typeof logData.hasContributions !== 'boolean') {
    errors.push('hasContributions must be a boolean');
  }

  // Required fields for Card 7: Records
  if (!Array.isArray(logData.records)) {
    errors.push('records must be an array');
  }

  // Required fields for Card 8: Archetype
  if (!isValidArchetype(logData.archetype)) {
    errors.push(
      `archetype must be one of: ${Object.keys(ARCHETYPES).join(', ')}`,
    );
  }
  if (typeof logData.archetypeStat !== 'string' || !logData.archetypeStat) {
    errors.push('archetypeStat must be a non-empty string');
  }
  if (
    typeof logData.archetypePercentile !== 'number' ||
    logData.archetypePercentile < 0 ||
    logData.archetypePercentile > 100
  ) {
    errors.push('archetypePercentile must be a number between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
