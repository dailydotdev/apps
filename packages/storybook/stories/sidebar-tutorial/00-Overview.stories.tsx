import React from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

interface ConceptRow {
  id: string;
  name: string;
  trigger: string;
  teaches: string;
  recommended?: string;
}

const CONCEPTS: ConceptRow[] = [
  {
    id: '01',
    name: 'Spotlight tour (3 steps)',
    trigger: 'Push, once after the switch',
    teaches: 'Reorg → dock → customization',
    recommended: 'Day one (optional, skippable)',
  },
  {
    id: '02',
    name: 'Hotspot beacons',
    trigger: 'Pull, self-paced',
    teaches: 'Any region, user picks the order',
  },
  {
    id: '03',
    name: 'Make-it-yours checklist',
    trigger: 'Push once, then pull',
    teaches: 'All three lessons, by doing',
    recommended: 'If we want measurable activation',
  },
  {
    id: '04',
    name: 'Intent-based nudges',
    trigger: 'Pull, behavioral (Nth visit, hover-linger)',
    teaches: 'Pinning, at the moment of need',
    recommended: 'Behavioral layer',
  },
  {
    id: '05',
    name: 'Empty dock that teaches',
    trigger: 'Ambient, zero interruption',
    teaches: 'Dock as a drag target',
    recommended: 'Always on',
  },
  {
    id: '06',
    name: 'Drag signifiers',
    trigger: 'Ambient, first-run decay',
    teaches: 'The drag affordance itself',
    recommended: 'Always on',
  },
  {
    id: '07',
    name: "What's-new card",
    trigger: 'Push, in-flow',
    teaches: 'Reorg headline + tour entry',
    recommended: 'Day one',
  },
  {
    id: '08',
    name: 'Interactive playground',
    trigger: 'Push, learn-by-doing sandbox',
    teaches: 'Drag-and-drop without risk',
  },
  {
    id: '09',
    name: 'New pills',
    trigger: 'Pull, per moved element',
    teaches: 'Where renamed/moved items went',
    recommended: 'Behavioral layer',
  },
  {
    id: '10',
    name: 'Replayable help menu',
    trigger: 'Pull, always available',
    teaches: 'Everything, retrievable after dismissal',
    recommended: 'Always on',
  },
  {
    id: '11',
    name: 'Panel teaching moments',
    trigger: 'Pull, on hover-opened panels',
    teaches: 'Pin/drag squads and pages to the dock',
    recommended: 'Behavioral layer',
  },
  {
    id: '12',
    name: 'Game Center intro',
    trigger: 'Pull, first Streak-tab open',
    teaches: 'Streaks + Quests merged into one tab',
    recommended: 'Behavioral layer',
  },
];

const FINDINGS: { title: string; body: string }[] = [
  {
    title: 'Upfront tours get skipped',
    body: 'NN/g calls them "push revelations": out of context, easy to dismiss, hard to remember. Tours with 5+ steps see ~67% abandonment; contextual tips measure ~61% higher engagement. If we tour at all: 3 steps, skippable.',
  },
  {
    title: 'A nav reorg still deserves one push',
    body: 'Shipping a reorganization with only a changelog is "rearranging the office and explaining it by memo". One benefit-framed announcement is warranted — say where things went, then go contextual.',
  },
  {
    title: 'Drag-and-drop is invisible',
    body: 'Without signifiers (handles, cursor, lift feedback) nobody discovers dragging. Always pair it with a click path — the ••• tray is our fallback.',
  },
  {
    title: 'Checklists convert',
    body: 'Checklist onboarding lifts feature adoption ~32% when each item is a real action, not a slide. Progress bars exploit the completion instinct.',
  },
  {
    title: 'Trigger on readiness',
    body: 'Linear reveals the command palette when usage signals readiness. Our equivalents: third visit to a page → offer to pin it; hover-linger on a new region → explain it.',
  },
  {
    title: 'Dismissible AND retrievable',
    body: 'Every overlay needs an easy out and a way back in. A "?" replay entry means closing a tip never loses the lesson.',
  },
];

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <Typography bold tag={TypographyTag.H2} type={TypographyType.Title3}>
      {title}
    </Typography>
    {children}
  </section>
);

const meta: Meta = {
  title: 'Sidebar Tutorial/00 Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const ResearchAndCatalog: Story = {
  render: () => (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 bg-background-default p-8">
      <div className="flex flex-col gap-2">
        <Typography bold tag={TypographyTag.H1} type={TypographyType.Title2}>
          Teaching the new sidebar
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Twelve interactive concepts for exposing the layout-v2 reorganization,
          drag-and-drop customization, and the shortcuts dock. Each numbered
          story in this folder is one concept; this page is the map. Full
          research notes and sources live in the folder README.
        </Typography>
      </div>

      <Section title="What we need to teach">
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          {[
            'The reorganization — navigation became a rail with tabs, Home lives on the logo, panels open on hover. Muscle memory breaks on day one.',
            'Drag-and-drop — pins drag from panels into the dock and reorder. Invisible without signifiers.',
            'The shortcuts dock — a customizable set of pinned pages below the rail, also manageable from the ••• tray.',
          ].map((item) => (
            <li key={item}>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                {item}
              </Typography>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Research in six lines">
        <div className="grid grid-cols-2 gap-3">
          {FINDINGS.map((finding) => (
            <div
              key={finding.title}
              className="flex flex-col gap-1 rounded-14 border border-border-subtlest-tertiary p-4"
            >
              <Typography bold type={TypographyType.Footnote}>
                {finding.title}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {finding.body}
              </Typography>
            </div>
          ))}
        </div>
      </Section>

      <Section title="The concepts">
        <div className="overflow-x-auto rounded-14 border border-border-subtlest-tertiary">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtlest-tertiary bg-surface-float">
                {['#', 'Concept', 'Trigger style', 'Teaches', 'Role'].map(
                  (header) => (
                    <th key={header} className="px-3 py-2">
                      <Typography bold type={TypographyType.Caption1}>
                        {header}
                      </Typography>
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {CONCEPTS.map((concept) => (
                <tr
                  key={concept.id}
                  className="border-b border-border-subtlest-tertiary last:border-b-0"
                >
                  <td className="px-3 py-2 align-top">
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Quaternary}
                    >
                      {concept.id}
                    </Typography>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Typography bold type={TypographyType.Caption1}>
                      {concept.name}
                    </Typography>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      {concept.trigger}
                    </Typography>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      {concept.teaches}
                    </Typography>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {concept.recommended ? (
                      <span className="inline-flex rounded-8 bg-accent-cabbage-flat px-2 py-0.5">
                        <Typography
                          type={TypographyType.Caption2}
                          className="text-accent-cabbage-default"
                        >
                          {concept.recommended}
                        </Typography>
                      </span>
                    ) : (
                      <Typography
                        type={TypographyType.Caption2}
                        color={TypographyColor.Quaternary}
                      >
                        Exploration
                      </Typography>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Recommendation: layers, not a winner">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          The research points at a layered system. Day one: the what&apos;s-new
          card (07) with an optional 3-step spotlight (01) — the single
          sanctioned interruption. Always on: the teaching empty dock (05), drag
          signifiers (06), and the replayable help menu (10) — ambient, zero
          interruption. Behavioral: intent nudges (04) for pinning, new pills
          (09) for moved items, in-panel teaching (11) at the highest-intent
          moment we get — a hover-opened panel — and the Game Center intro (12)
          on the first Streak-tab open. The checklist (03) is an optional
          engagement play if we want a measurable activation metric.
        </Typography>
      </Section>
    </div>
  ),
};
