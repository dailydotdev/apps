import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { ArchiveFeedPage } from './ArchiveFeedPage';
import { ArchivePeriodType, ArchiveScopeType } from '../../graphql/archive';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

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
