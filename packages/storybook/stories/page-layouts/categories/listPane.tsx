import React from 'react';
import type { Category } from '../kit';
import { Box, Center, Lines, ListRows, Row, Tabs } from '../kit';

const Pane = ({ label, spec }: { label: string; spec: string }) => (
  <Box label={label} spec={spec} className="flex-1">
    <Lines count={2} height={22} />
    <span className="h-64 shrink-0 rounded-16 bg-surface-float" />
    <Lines count={8} />
  </Box>
);

export const listPane: Category = {
  title: 'List + pane',
  summary:
    'A list column next to a detail pane on laptop, each scrolling on its own. Below laptop the list and the detail are separate screens.',
  intro: (
    <p>
      There are two versions of this pattern. Messages runs edge to edge in the
      card with a 320px list. Bookmarks and history float a 384px list and a
      bordered pane inside a max-w-6xl frame, like the framed two-column pages.
    </p>
  ),
  variants: [
    {
      name: 'Messages',
      production: { story: 'messages', url: '/messages' },
      routes: ['/messages/[[...peer]]'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Messages' },
      widths: [
        'Fixed viewport height (MessagesScreen.tsx:91, useAgentShellHeight)',
        'Inbox list laptop:w-80 · 320px laptop:border-r, edge to edge (:116)',
        'Thread pane flex-1 (:213)',
        'Below laptop: the list, then the thread as its own screen; the bottom bar hides in a thread',
      ],
      render: (bp) =>
        bp === 'laptop' ? (
          <Row gap={0} style={{ flex: 1 }}>
            <Box
              tone="nav"
              label="Inbox"
              spec="w-80 · 320px · border-r"
              style={{ width: 320 }}
              className="shrink-0 rounded-0"
            >
              <Tabs count={2} />
              <ListRows count={9} thumb={false} />
            </Box>
            <Pane label="Thread" spec="flex-1" />
          </Row>
        ) : (
          <Box
            tone="nav"
            label="Inbox"
            spec="full width"
            className="m-4 flex-1"
          >
            <Tabs count={2} />
            <ListRows count={9} thumb={false} />
          </Box>
        ),
    },
    {
      name: 'Bookmarks and reading history',
      production: { story: 'bookmarks', url: '/bookmarks' },
      routes: [
        '/bookmarks',
        '/bookmarks/later',
        '/bookmarks/[folderId]',
        '/history',
      ],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Bookmarks' },
      widths: [
        'Frame mx-auto laptop:max-w-5xl laptopL:max-w-6xl · 1152px, flex-row gap-4 p-4 (BookmarkFeedLayout.tsx:863, history/reading.tsx:328)',
        'List aside laptop:w-96 · 384px, sticky, with its own scroll (:873)',
        'PostPane flex-1 rounded-16 border, laptop only (PostPane.tsx:224)',
        'Tablet: one list with the folders above it; phone: list + search. Rows open the post page',
        'Empty state: a centred max-w-3xl column instead',
      ],
      render: (bp) =>
        bp === 'laptop' ? (
          <Center max={1152} style={{ flex: 1, padding: 16 }}>
            <Row style={{ flex: 1 }}>
              <Box
                tone="nav"
                label="List · sticky"
                spec="w-96 · 384px"
                style={{ width: 384 }}
                className="shrink-0"
              >
                <Tabs count={3} />
                <ListRows count={8} />
              </Box>
              <Pane label="PostPane" spec="flex-1 rounded-16 border" />
            </Row>
          </Center>
        ) : (
          <Box tone="nav" label="List" spec="full width" className="m-4 flex-1">
            <Tabs count={3} />
            <ListRows count={9} />
          </Box>
        ),
    },
  ],
};
