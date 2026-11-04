import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import post from '../../../__tests__/fixture/post';
import { ArchiveFeedPage } from './ArchiveFeedPage';
import {
  ArchivePeriodType,
  ArchiveRankingType,
  ArchiveScopeType,
  ArchiveSubjectType,
} from '../../graphql/archive';
import { PostType } from '../../graphql/posts';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

// The copy link sits in the phone block, which this render has no slot for.
jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: () => false,
  useIsPhone: () => false,
}));

it('logs a copy link on a monthly best-of page as an archive share', () => {
  const logEvent = jest.fn();
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <ArchiveFeedPage
        archive={null}
        scopeType={ArchiveScopeType.Global}
        scopeName="daily.dev"
        periodType={ArchivePeriodType.Month}
        year={2025}
        month={8}
      />
    </TestBootProvider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ShareArchive,
    target_id: undefined,
    extra: JSON.stringify({
      provider: ShareProvider.CopyLink,
      origin: Origin.ArchiveIndex,
    }),
  });
});

it('server renders a month whose ranked posts include a freeform post with no image', () => {
  const { DOMParser } = global;
  // @ts-expect-error Node has no DOMParser
  delete global.DOMParser;

  try {
    expect(
      renderToString(
        <TestBootProvider client={new QueryClient()}>
          <ArchiveFeedPage
            archive={{
              id: 'archive',
              subjectType: ArchiveSubjectType.Post,
              rankingType: ArchiveRankingType.Best,
              scopeType: ArchiveScopeType.Global,
              scopeId: null,
              periodType: ArchivePeriodType.Month,
              periodStart: '2025-08-01T00:00:00.000Z',
              items: [
                { rank: 1, post },
                {
                  rank: 2,
                  post: {
                    ...post,
                    id: 'freeform',
                    title: 'A freeform post',
                    type: PostType.Freeform,
                    image: '',
                  },
                },
              ],
            }}
            scopeType={ArchiveScopeType.Global}
            scopeName="daily.dev"
            periodType={ArchivePeriodType.Month}
            year={2025}
            month={8}
          />
        </TestBootProvider>,
      ),
    ).toContain('A freeform post');
  } finally {
    global.DOMParser = DOMParser;
  }
});
