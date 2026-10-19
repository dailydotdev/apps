import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { MessageRequestComposer } from './MessageRequestComposer';
import { DirectMessageAccess } from '../graphql';
import type { DmPeer } from '../types';
import { DM_REQUEST_MAX_LENGTH } from '../types';

const peer: DmPeer = {
  id: 'peer',
  name: 'Peer',
  username: 'peer',
  image: 'https://daily.dev/peer.png',
  permalink: 'https://app.daily.dev/peer',
  access: DirectMessageAccess.Request,
};

const renderComposer = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <MessageRequestComposer peer={peer} />
    </TestBootProvider>,
  );

it('should show how many characters are left in the request note', () => {
  renderComposer();

  expect(screen.getByText(`${DM_REQUEST_MAX_LENGTH}`)).toBeInTheDocument();

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Hi there' },
  });

  expect(
    screen.getByText(`${DM_REQUEST_MAX_LENGTH - 'Hi there'.length}`),
  ).toBeInTheDocument();
});
