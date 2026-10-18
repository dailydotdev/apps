import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { useViewSize } from '../../hooks/useViewSize';
import { FeedbackWidget } from './FeedbackWidget';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;

const renderWidget = ({
  showFeedbackButton = true,
  user = loggedUser,
  isMobile = false,
  placement,
}: {
  showFeedbackButton?: boolean;
  user?: typeof loggedUser | null;
  isMobile?: boolean;
  placement?: 'fixed' | 'sidebar' | 'support';
} = {}) => {
  mockUseViewSize.mockReturnValue(isMobile);

  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: user ?? undefined }}
      settings={{ showFeedbackButton }}
    >
      <FeedbackWidget placement={placement} />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(false);
});

it('renders the fixed feedback button for a logged-in desktop user when enabled', () => {
  renderWidget();

  expect(
    screen.getByRole('button', { name: 'Send feedback. Real people reply.' }),
  ).toBeInTheDocument();
});

it.each([
  { name: 'disabled in settings', showFeedbackButton: false },
  { name: 'logged out', user: null },
  { name: 'mobile', isMobile: true },
])(
  'does not render the fixed feedback button when $name',
  ({ showFeedbackButton, user, isMobile }) => {
    renderWidget({ showFeedbackButton, user, isMobile });

    expect(
      screen.queryByRole('button', {
        name: 'Send feedback. Real people reply.',
      }),
    ).not.toBeInTheDocument();
  },
);

it('renders the support placement even when the feedback button setting is disabled', () => {
  renderWidget({ showFeedbackButton: false, placement: 'support' });

  expect(
    screen.getByRole('button', { name: 'Send feedback. Real people reply.' }),
  ).toBeInTheDocument();
});
