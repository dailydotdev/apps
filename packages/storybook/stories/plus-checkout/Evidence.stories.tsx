import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Markdown } from './docs/Markdown';
import evidence from './docs/EVIDENCE.md?raw';
import { sourcedFlows } from './flowsSourced';

const meta: Meta = {
  title: 'Plus Checkout/7. Evidence',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Page = () => (
  <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 pb-24 text-text-primary">
    <Markdown source={evidence} />
    <section className="flex flex-col gap-3">
      <h2 className="border-t border-border-subtlest-tertiary pt-6 font-bold typo-title2">17 subscription flows, sourced</h2>
      <p className="typo-callout text-text-tertiary">Each step from the company’s help centre, its live page (captured logged out, 9 Oct 2026) or a dated walkthrough. “Not documented” is kept where no source says.</p>
      <div className="overflow-x-auto rounded-12 border border-border-subtlest-tertiary">
        <table className="w-full min-w-[960px] typo-caption1">
          <thead>
            <tr className="text-left font-mono uppercase tracking-wider text-text-quaternary">
              {['Product', 'Price before login', 'Steps', 'Checkout', 'Methods', 'Sources'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sourcedFlows.map((f) => (
              <tr key={f.id} className="border-t border-border-subtlest-tertiary align-top">
                <td className="px-3 py-2 font-bold text-text-primary">{f.name}</td>
                <td className="px-3 py-2 text-text-tertiary">{f.pricePublic}</td>
                <td className="px-3 py-2 text-text-tertiary"><ol className="list-decimal pl-4">{f.steps.map((s) => <li key={s}>{s}</li>)}</ol></td>
                <td className="px-3 py-2 text-text-tertiary">{f.checkout}</td>
                <td className="px-3 py-2 text-text-tertiary">{f.methods}</td>
                <td className="px-3 py-2">
                  {f.sources.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="block text-accent-cabbage-default underline underline-offset-2">{s.label}{s.date ? ` (${s.date})` : ''}</a>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

export const Research: StoryObj = { name: 'Data and research', render: () => <Page /> };
