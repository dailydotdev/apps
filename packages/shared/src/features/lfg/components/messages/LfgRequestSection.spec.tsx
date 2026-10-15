import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LfgRequestSection } from './LfgRequestSection';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';
import { getLfgReachOutInbox } from '../../graphql';
import type { LfgReachOut } from '../../types';
import { LfgKind, LfgReachOutStatus } from '../../types';

jest.mock('../../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../hooks/useLfgEnabled', () => ({
  useLfgEnabled: jest.fn(),
}));
jest.mock('../../graphql', () => ({
  ...jest.requireActual('../../graphql'),
  getLfgReachOutInbox: jest.fn(),
}));

const reachOut = (
  id: string,
  name: string,
  post = { id: 'post-1', title: 'Teammate for a query-plan visualizer' },
): LfgReachOut => ({
  id,
  pitch: `${name}'s pitch`,
  status: LfgReachOutStatus.Pending,
  filtered: false,
  createdAt: new Date().toISOString(),
  answers: [],
  post: { ...post, kind: LfgKind.Build, asks: [] },
  sender: {
    id: `user-${id}`,
    name,
    username: name.toLowerCase(),
    image: '',
    permalink: '',
    reputation: 10,
    createdAt: '2024-01-01T00:00:00Z',
  },
});

const renderSection = (activeReachOutId?: string) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LfgRequestSection activeReachOutId={activeReachOutId} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as ReturnType<typeof useAuthContext>);
  jest.mocked(useLfgEnabled).mockReturnValue({
    isEnabled: true,
    isGatedOut: false,
    isLaunched: true,
    isLaunchKnown: true,
  });
});

describe('LfgRequestSection', () => {
  it('groups waiting reach-outs under the post they answer', async () => {
    jest
      .mocked(getLfgReachOutInbox)
      .mockImplementation(async (filtered) =>
        filtered ? [] : [reachOut('r1', 'Lior'), reachOut('r2', 'Dana')],
      );

    renderSection('r2');

    expect(
      await screen.findByText('Responses to your post · 2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Lior').closest('a')).toHaveAttribute(
      'href',
      expect.stringMatching(/messages\?tab=requests&reachOut=r1$/),
    );
    expect(screen.getByText('Dana').closest('a')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('keeps the ones that look like spam folded away', async () => {
    jest
      .mocked(getLfgReachOutInbox)
      .mockImplementation(async (filtered) =>
        filtered ? [reachOut('r3', 'Studio')] : [],
      );

    renderSection();

    const folder = await screen.findByRole('button', {
      name: /Filtered \(1\)/,
    });
    expect(screen.queryByText('Studio')).not.toBeInTheDocument();

    fireEvent.click(folder);

    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('shows nothing to people without Looking for group', () => {
    jest.mocked(useLfgEnabled).mockReturnValue({
      isEnabled: false,
      isGatedOut: true,
      isLaunched: false,
      isLaunchKnown: false,
    });

    const { container } = renderSection();

    expect(container).toBeEmptyDOMElement();
    expect(getLfgReachOutInbox).not.toHaveBeenCalled();
  });
});
