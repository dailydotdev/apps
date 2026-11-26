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
  'Intent: teaches': {
    name: 'Teaches a skill',
    hint: 'The reader learns something they did not know before.',
  },
  'Intent: opens a discussion': {
    name: 'Starts a discussion',
    hint: 'An argument, an experience or a question that gets people talking.',
  },
  'Intent: promotes': {
    name: 'Sells a product',
    hint: 'Its main goal is to sell or push a product, service or tool.',
  },
  'Intent: informs': {
    name: 'Shares news',
    hint: 'Keeps the reader up to date, with nothing for them to do.',
  },
  'Intent: solves a specific problem': {
    name: 'Fixes one problem',
    hint: 'Answers a concrete issue or error the reader has right now.',
  },
  'Intent: helps decide': {
    name: 'Helps pick an option',
    hint: 'Compares options or weighs pros and cons.',
  },
  'Broad overview': {
    name: 'An overview for newcomers',
    hint: 'Covers a topic from the top, like "What is Kubernetes?"',
  },
  'Focused on one topic': {
    name: 'One part of a topic',
    hint: 'Goes into one part of a topic, like "GraphQL pagination patterns".',
  },
  'Highly specific': {
    name: 'A deep dive for experts',
    hint: 'A narrow topic that needs prior knowledge, like tuning etcd in large clusters.',
  },
  'Self-promotion: lowest quarter': {
    name: 'Barely mentions its own product',
    hint: 'The quarter of posts that promote the author or company least.',
  },
  'Self-promotion: highest quarter': {
    name: 'Mostly about its own product',
    hint: 'The quarter of posts that promote the author or company most.',
  },
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

    return label?.hidden
      ? []
      : [{ ...row, name: label?.name ?? row.label, hint: label?.hint }];
  });
