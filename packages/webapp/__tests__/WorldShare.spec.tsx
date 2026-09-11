import type { ReactElement } from 'react';
import React from 'react';
import {
  act,
  fireEvent,
  render as rtlRender,
  screen,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { WorldShare } from '../components/world/WorldShare';

const mockShareOrCopy = jest.fn();
const mockUseShareOrCopyLink = jest.fn();

jest.mock('@dailydotdev/shared/src/hooks/useShareOrCopyLink', () => ({
  useShareOrCopyLink: (props: unknown) => mockUseShareOrCopyLink(props),
}));

const { useShareOrCopyLink: actualUseShareOrCopyLink } = jest.requireActual(
  '@dailydotdev/shared/src/hooks/useShareOrCopyLink',
);

const user = {
  id: 'u1',
  username: 'ido',
  name: 'Ido',
} as PublicProfile;

interface ShareArgs {
  link: string;
  text: string;
  cid?: ReferralCampaignKey;
  logObject: (provider: ShareProvider) => Record<string, unknown>;
}

const argsOf = (): ShareArgs =>
  mockUseShareOrCopyLink.mock.calls[0][0] as ShareArgs;

// Tooltip reads the request protocol off a query client.
const render = (ui: ReactElement) =>
  rtlRender(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

beforeEach(() => {
  mockShareOrCopy.mockReset();
  mockUseShareOrCopyLink.mockReset();
  mockUseShareOrCopyLink.mockReturnValue([false, mockShareOrCopy]);
});

describe('WorldShare', () => {
  it('hands out an absolute link to the world', () => {
    render(<WorldShare user={user} isOwn={false} />);

    // Absolute on purpose: the whole point is a link that survives the tab,
    // and `webappUrl` is a bare `/` on the webapp.
    expect(argsOf().link).toBe(`${globalThis.location.origin}/world/ido`);
  });

  it('falls back to the id for a reader with no username', () => {
    render(
      <WorldShare user={{ ...user, username: undefined }} isOwn={false} />,
    );

    expect(argsOf().link).toBe(`${globalThis.location.origin}/world/u1`);
  });

  it('tags the link with the world share campaign', () => {
    render(<WorldShare user={user} isOwn={false} />);

    expect(argsOf().cid).toBe(ReferralCampaignKey.ShareWorld);
  });

  it('copies a link that still works once pasted', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    mockUseShareOrCopyLink.mockImplementation(actualUseShareOrCopyLink);
    rtlRender(
      <TestBootProvider client={new QueryClient()} auth={{ user: loggedUser }}>
        <WorldShare user={user} isOwn={false} />
      </TestBootProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share this world' }));
    });

    expect(writeText).toHaveBeenCalledWith(
      `${globalThis.location.origin}/world/ido?userid=${loggedUser.id}&cid=share_world`,
    );
  });

  it('names the owner when the world belongs to somebody else', () => {
    render(<WorldShare user={user} isOwn={false} />);

    expect(argsOf().text).toBe("Check out Ido's world on daily.dev");
  });

  it('speaks in the first person on your own world', () => {
    render(<WorldShare user={user} isOwn />);

    expect(argsOf().text).toBe('Check out my world on daily.dev');
  });

  it('leads with the name its owner gave the place', () => {
    render(<WorldShare user={user} worldName="Shamunia" isOwn />);

    expect(argsOf().text).toBe('Check out Shamunia, my world on daily.dev');
  });

  it('logs the world it shared and how it was shared', () => {
    render(<WorldShare user={user} isOwn={false} />);

    expect(argsOf().logObject(ShareProvider.Native)).toEqual({
      event_name: LogEvent.ShareWorld,
      target_id: 'u1',
      extra: JSON.stringify({ provider: ShareProvider.Native }),
    });
  });

  it('shares on click', () => {
    render(<WorldShare user={user} isOwn={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Share this world' }));

    expect(mockShareOrCopy).toHaveBeenCalled();
  });

  it('says so once the link is on the clipboard', () => {
    mockUseShareOrCopyLink.mockReturnValue([true, mockShareOrCopy]);
    render(<WorldShare user={user} isOwn={false} />);

    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  });
});
