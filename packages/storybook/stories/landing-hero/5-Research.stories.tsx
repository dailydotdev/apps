import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { Case, Page, Prose, Table } from './parts';
import type { Site } from './research';
import { doors, facts, principles, sources, surfaces } from './research';

const meta: Meta = {
  title: 'Landing Hero/5. Research',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Shots = ({ sites }: { sites: Site[] }): ReactElement => (
  <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2 laptopL:grid-cols-3">
    {sites.map((site) => (
      <figure key={site.id} className="m-0 flex flex-col gap-2">
        <img
          src={`/landing-hero/${site.id}.jpg`}
          alt={`${site.name}, logged out, 1440px`}
          className="w-full rounded-12 border border-border-subtlest-tertiary"
        />
        <figcaption className="flex flex-col gap-1">
          <span className="flex items-baseline justify-between gap-2">
            <strong className="text-text-primary typo-callout">
              {site.name}
            </strong>
            <span className="text-text-quaternary typo-caption1">
              {site.usedBy.join(' · ')}
            </span>
          </span>
          <span className="text-text-secondary typo-footnote">
            {site.pattern}
          </span>
          <span className="text-text-tertiary typo-footnote">
            → {site.lesson}
          </span>
        </figcaption>
      </figure>
    ))}
  </div>
);

export const Doors: StoryObj = {
  name: '1. The doors',
  render: () => (
    <Page
      chapter="Chapter 5"
      question="What does a visitor see on the big platforms before signing up?"
      title="Nine logged-out homepages, captured 28 Oct 2026"
      goal="Name the patterns the winners share so round two borrows mechanisms, not looks."
      metric="None. Reference."
    >
      <Prose>
        <p>
          Three families. <strong>Doors</strong> (X, Instagram, LinkedIn,
          Pinterest): a promise and the ways in, content as decoration.{' '}
          <strong>Windows</strong> (TikTok, Reddit, Threads, Substack, Bluesky,
          DEV): the product is the page and the ask rides on scroll or
          interaction. <strong>Minimal</strong> (Medium, GitHub): one line, one
          button. What they share: a promise under eight words, one sentence on
          what it is, the real product, one primary and at most one secondary.
          The code on the right of each caption lists the variations that borrow
          it.
        </p>
      </Prose>
      <Shots sites={doors} />
    </Page>
  ),
};

export const Surfaces: StoryObj = {
  name: '2. Selling the second surface',
  render: () => (
    <Page
      chapter="Chapter 5"
      question="How do products with a browser extension or app sell it next to the account?"
      title="Eleven second-surface pitches"
      goal="Learn the copy order (gain, proof, button) and the placement (after signup, header, secondary) before writing ours."
      metric="None. Reference."
    >
      <Prose>
        <p>
          Extension-only products (Honey, Momentum, Toby, Tabliss) lead with the
          gain, put the store proof under it and make install the only button.
          Account-first products with an extension (Grammarly, Loom, Raindrop,
          Readwise) sell the account and sequence the surface after it, or
          beside it at a clearly lower weight. daily.dev is the second kind.
          Copy rule for us: say what the reader gains (“stay ahead without
          trying”, “your feed shows up on its own”), then the proof (4.9★, 400K
          developers, Featured), then the mechanism in small type.
        </p>
      </Prose>
      <Shots sites={surfaces} />
    </Page>
  ),
};

export const Mindset: StoryObj = {
  name: '3. Principles and our numbers',
  render: () => (
    <Page
      chapter="Chapter 5"
      question="Which rules and which of our own numbers decide the round-two arms?"
      title="Nikita Bier’s rules, the published tests, and what our data says"
      goal="Every variation in chapters 3 and 4 points back to a row here."
      metric="None. Reference."
    >
      <Case
        title="Rules"
        note="Published principles, with the arms that apply them."
      >
        <Table
          head={['Who', 'Rule', 'Source', 'Applied in']}
          rows={principles.map((row) => [
            row.who,
            row.rule,
            row.source,
            row.applied.join(' · '),
          ])}
        />
      </Case>
      <Case
        title="Our numbers"
        note="From Smith’s analyses in the org brain and GrowthBook, Oct 2026."
      >
        <Table
          head={['Fact', 'Source', 'Applied in']}
          rows={facts.map((row) => [
            row.fact,
            row.source,
            row.applied.join(' · '),
          ])}
        />
      </Case>
      <Case title="Sources">
        <ul className="flex max-w-[56rem] flex-col gap-1 typo-callout">
          {sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-text-link underline"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </Case>
    </Page>
  ),
};
