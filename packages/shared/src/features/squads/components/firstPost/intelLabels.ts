import type { IntelIndexRow } from '../../../../graphql/squadIntel';

interface IntelLabel {
  /** The name shown, the intel's own label when unset */
  name?: string;
  /** What puts a post in the row, from how Bragi classifies posts */
  hint?: string;
  /** Rows the page never shows, kept out of older intel too */
  hidden?: boolean;
}

// Keyed by the intel's labels (`common/startups/intel/build.ts` in daily-api)
const LABELS: Record<string, IntelLabel> = {
  // Formats
  News: {
    hint: 'Recent events that date fast, like incidents and announcements.',
  },
  Release: {
    hint: 'A new version, feature or launch, like release notes or a changelog.',
  },
  Opinion: {
    hint: 'A personal view on a topic, a prediction or a look at a trend.',
  },
  'Hot take': {
    hint: 'A bold opinion that picks a side and invites pushback.',
  },
  Tutorial: { hint: 'Step-by-step help to get one task done.' },
  Listicle: { hint: 'A curated list of tools, links or tips.' },
  Comparison: { hint: 'Two or more tools side by side, to help pick one.' },
  Story: {
    hint: 'Lessons from something that happened, like a postmortem or a case study.',
  },
  Product: { hint: 'A page that markets a product, service or project.' },
  Drama: {
    hint: 'A public dispute or rivalry between companies, tools or people.',
  },
  Endorsement: { hint: 'A known person or company recommends a tool.' },
  Criticism: { hint: 'A known person or company warns against a tool.' },
  Leak: {
    hint: 'Unconfirmed signs of what is coming, like features spotted in testing.',
  },
  Milestone: {
    hint: 'Numbers that show growth, like users, funding or adoption.',
  },
  Meme: { hint: 'A joke or a meme.' },
  Poll: { hint: 'A question readers vote on.' },

  // What the post is like
  'Teaches a skill': {
    hint: "Teaches a concept or skill the reader didn't know before.",
  },
  'Starts a discussion': {
    hint: 'An argument, an experience or a focused question that invites replies.',
  },
  'Shares news': {
    hint: 'News or updates that keep the reader current, with nothing for them to do.',
  },
  'Fixes one problem': {
    hint: 'Solves a concrete problem or error the reader has right now.',
  },
  'Helps pick an option': {
    hint: 'Compares options, evaluates them or weighs pros and cons.',
  },
  'For beginners': {
    hint: 'Introduces a whole topic to newcomers, like "What is Kubernetes?"',
  },
  'For practitioners': {
    hint: 'Covers one aspect or use case of a topic, like "GraphQL pagination patterns".',
  },
  'For experts': {
    hint: 'A narrow deep dive that needs prior knowledge, like tuning etcd in large clusters.',
  },
  // Labels of intel built before the names above
  'Intent: teaches': { name: 'Teaches a skill' },
  'Intent: opens a discussion': { name: 'Starts a discussion' },
  'Intent: informs': { name: 'Shares news' },
  'Intent: solves a specific problem': { name: 'Fixes one problem' },
  'Intent: helps decide': { name: 'Helps pick an option' },
  'Focused on one topic': { name: 'For practitioners' },
  'Highly specific': { name: 'For experts' },
  // Rows the intel no longer builds
  'Intent: promotes': { hidden: true },
  'Self-promotion: lowest quarter': { hidden: true },
  'Self-promotion: highest quarter': { hidden: true },
  'Title oversells the content': { hidden: true },
  "Doesn't deliver what it promises": { hidden: true },
  'Likely clickbait': { hidden: true },

  // What the post has, counted on posts written on daily.dev
  'Body under 500 characters': { name: 'Under 500 characters' },
  'Body of 500 to 4,000 characters': { name: '500 to 4,000 characters' },
  'Body over 4,000 characters': { name: 'Over 4,000 characters' },
};

export interface NamedIntelRow extends IntelIndexRow {
  name: string;
  hint?: string;
}

/** The rows the page shows, with the names and hints it shows them by */
export const nameIntelRows = (rows: IntelIndexRow[]): NamedIntelRow[] =>
  rows.flatMap((row) => {
    const label = LABELS[row.label];
    const name = label?.name ?? row.label;

    return label?.hidden
      ? []
      : [{ ...row, name, hint: label?.hint ?? LABELS[name]?.hint }];
  });
