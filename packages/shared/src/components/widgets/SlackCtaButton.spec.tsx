import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import post from '../../../__tests__/fixture/post';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { USER_INTEGRATIONS } from '../../graphql/users';
import { UserIntegrationType } from '../../graphql/integrations';
import { SlackCtaButton } from './SlackCtaButton';

const mockConnect = jest.fn();

jest.mock('../../hooks/integrations/slack/useSlack', () => ({
  useSlack: () => ({ connect: mockConnect, connectSource: jest.fn() }),
}));

const integrationsResult = (connected: boolean) => ({
  data: {
    userIntegrations: {
      pageInfo: { endCursor: null, hasNextPage: false },
      edges: connected
        ? [
            {
              node: {
                id: 'slack-1',
                type: UserIntegrationType.Slack,
                name: 'daily.dev',
                canPostAsUser: true,
              },
            },
          ]
        : [],
    },
  },
});

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: loggedUser }}>
      <SlackCtaButton post={post} />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

it('should not start OAuth when pressed before integrations settle', async () => {
  nock('http://localhost:3000')
    .post('/graphql', { query: USER_INTEGRATIONS })
    .delay(200)
    .reply(200, integrationsResult(true));
  renderComponent();

  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  fireEvent.click(button);
  expect(mockConnect).not.toHaveBeenCalled();

  await waitFor(() => expect(button).toBeEnabled());
  expect(button).toHaveTextContent('Send to Slack');
  fireEvent.click(button);
  expect(mockConnect).not.toHaveBeenCalled();
});

it('should connect Slack when settled without a workspace', async () => {
  mockGraphQL({
    request: { query: USER_INTEGRATIONS },
    result: integrationsResult(false),
  });
  renderComponent();

  const button = await screen.findByRole('button', { name: 'Connect Slack' });
  fireEvent.click(button);
  await waitFor(() => expect(mockConnect).toHaveBeenCalledTimes(1));
});
