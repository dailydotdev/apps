import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Page, Section } from '../onboarding-fixes/kit';
import { Card, Grid } from '../startups-onboarding/kit';
import { groups, notScreens } from './map';

const meta: Meta = {
  title: 'Startups Playgrounds/4. Coverage',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const allStates = groups.flatMap(({ states }) => states);
const proposedCount = allStates.filter(({ proposed }) => proposed).length;
const todayCount = allStates.filter(({ today }) => today).length;

const Cell = ({ id }: { id?: string }): ReactElement =>
  id ? (
    <a
      href={`/?path=/story/${id}`}
      target="_top"
      className="inline-flex items-center gap-1 text-text-link underline"
    >
      <VIcon size={IconSize.Size16} /> Open
    </a>
  ) : (
    <span className="text-text-quaternary">Not yet</span>
  );

export const Coverage: StoryObj = {
  name: 'Coverage',
  render: (): ReactElement => (
    <Page
      eyebrow="Audit against apps #7238"
      title="Everything in the PR, and where it is"
      intro={`${allStates.length} states: ${todayCount} show today's build and ${proposedCount} have a proposed design. The one with neither is the real Paddle form, which only runs live. Below the table is everything that can't be a screen.`}
    >
      {groups.map((group) => (
        <Section key={group.id} title={group.title}>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full min-w-[32rem] text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-bold">State</th>
                  <th className="p-3 font-bold">Today</th>
                  <th className="p-3 font-bold">Proposed</th>
                </tr>
              </thead>
              <tbody>
                {group.states.map((state) => (
                  <tr
                    key={state.id}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 text-text-primary">
                      <span className="mr-2 text-text-tertiary">
                        {state.id}
                      </span>
                      {state.label}
                    </td>
                    <td className="p-3">
                      <Cell id={state.today} />
                    </td>
                    <td className="p-3">
                      <Cell id={state.proposed} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
      <Section
        title="Not screens"
        note="Part of the PR, and worth knowing when you evolve the design, but there's nothing to draw."
      >
        <Grid>
          {notScreens.map(({ title, items }) => (
            <Card key={title} title={title}>
              <ul className="flex list-disc flex-col gap-1 pl-4">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
};
