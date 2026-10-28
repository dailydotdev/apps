import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { SquadDetails } from './Details';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { SQUAD_HANDE_AVAILABILITY_QUERY } from '../../graphql/squads';

beforeEach(() => {
  nock.cleanAll();
});

describe('SquadDetails', () => {
  it('creates the squad with the uploaded image', async () => {
    const onSubmit = jest.fn();
    mockGraphQL({
      request: {
        query: SQUAD_HANDE_AVAILABILITY_QUERY,
        variables: { handle: 'devs' },
      },
      result: { data: { sourceHandleExists: false } },
    });
    const { container } = render(
      <TestBootProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <SquadDetails
          onSubmit={onSubmit}
          initialData={{ name: 'Devs', handle: 'devs' }}
        />
      </TestBootProvider>,
    );

    const file = new File(['image'], 'logo.png', { type: 'image/png' });
    // eslint-disable-next-line testing-library/no-container
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByAltText('Squad logo')).toHaveAttribute(
        'src',
        expect.stringContaining('data:image/png'),
      ),
    );

    // eslint-disable-next-line testing-library/no-container
    fireEvent.submit(container.querySelector('#squad-form') as HTMLFormElement);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ name: 'Devs', handle: 'devs', file }),
        undefined,
      ),
    );
  });
});
