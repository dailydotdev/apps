import React from 'react';
import type { Category } from '../kit';
import { Box, Center, Lines, Row } from '../kit';

const Transcript = ({ composer = true }: { composer?: boolean }) => (
  <Center max={720} style={{ flex: 1, padding: 24 }}>
    <Box label="Transcript" spec="max-w-[45rem] · 720px" className="flex-1">
      <Lines count={4} />
      <span className="ml-auto h-16 w-2/3 rounded-16 bg-surface-float" />
      <Lines count={6} />
    </Box>
    {composer && (
      <Box
        tone="muted"
        label="Composer"
        spec="sticky bottom"
        className="h-28"
      />
    )}
  </Center>
);

export const workspace: Category = {
  title: 'Full-height workspace',
  summary:
    'The page fills the viewport height and keeps a centred 720px column, with an optional resizable pane on the right.',
  intro: (
    <p>
      The agent pages size themselves with useAgentShellHeight rather than
      scrolling the document, like messages. The 720px column stays centred
      however wide the window is.
    </p>
  ),
  variants: [
    {
      name: 'Agent home and settings',
      production: { story: 'agent-home', url: '/agent' },
      routes: ['/agent', '/agent/[id]/settings'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Agent' },
      widths: [
        'Fixed viewport height, centred max-w-[45rem] · 720px column (AgentHomeScreen.tsx:185, AgentSettingsPane.tsx:95)',
      ],
      render: () => <Transcript />,
    },
    {
      name: 'Agent workspace',
      production: { story: 'agent-workspace', url: '/agent/[id]' },
      routes: ['/agent/[id]'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Agent' },
      widths: [
        'Transcript column flex-1, inner max-w-[45rem] · 720px (AgentWorkspace.tsx:288)',
        'Content pane on the right when open: resizable, 480px by default, at least 384px (AgentWorkspace.tsx:29)',
        'Below laptop the pane is a full-screen right Drawer (AgentContentPane.tsx:509)',
      ],
      render: (bp) =>
        bp === 'laptop' ? (
          <Row gap={0} style={{ flex: 1 }}>
            <div className="flex min-w-0 flex-1 flex-col">
              <Transcript />
            </div>
            <Box
              tone="aside"
              label="Content pane · resizable"
              spec="480px default · min 384px"
              style={{ width: 480 }}
              className="shrink-0 rounded-0"
            >
              <span className="h-48 shrink-0 rounded-16 bg-surface-float" />
              <Lines count={8} />
            </Box>
          </Row>
        ) : (
          <Transcript />
        ),
    },
  ],
};
