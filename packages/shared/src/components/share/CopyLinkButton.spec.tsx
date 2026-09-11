import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { CopyLinkButton } from './CopyLinkButton';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';

const writeText = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

const renderComponent = () =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <CopyLinkButton
        origin={Origin.SourcePage}
        shareProps={{
          text: 'Check out theverge on daily.dev',
          link: 'https://app.daily.dev/sources/theverge',
          cid: ReferralCampaignKey.ShareSource,
          logObject: () => ({
            event_name: LogEvent.ShareSource,
            target_id: 'theverge',
          }),
        }}
      />
    </TestBootProvider>,
  );

it('writes the tracked link within the click, before the shortener answers', () => {
  renderComponent();

  // No await: Safari refuses a clipboard write once the click task has ended.
  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  expect(writeText).toHaveBeenCalledWith(
    'https://app.daily.dev/sources/theverge?userid=u1&cid=share_source',
  );
});

it('logs the share with its provider and placement', () => {
  renderComponent();

  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ShareSource,
    target_id: 'theverge',
    extra: JSON.stringify({
      provider: ShareProvider.CopyLink,
      origin: Origin.SourcePage,
    }),
  });
});
