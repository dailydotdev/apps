import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@testing-library/jest-dom';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { render, RenderResult, screen } from '@testing-library/preact';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import { CompanionPermission } from './CompanionPermission';

let client: QueryClient;

jest.mock('content-scripts-register-polyfill', () => ({}));

jest.mock('webextension-polyfill-ts', () => {
  return {
    browser: {
      contentScripts: {
        register: jest.fn(),
      },
      runtime: {
        id: 123,
        onMessage: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
        },
        sendMessage: () =>
          new Promise((resolve) => {
            resolve(true);
          }),
      },
      permissions: {
        remove: jest.fn(),
        request: () =>
          new Promise((resolve) => {
            resolve(true);
          }),
        contains: () =>
          new Promise((resolve) => {
            resolve(false);
          }),
      },
    },
  };
});

beforeEach(() => {
  client = new QueryClient();
});

const renderComponent = (): RenderResult => {
  return render(
    <QueryClientProvider client={client}>
      <FeaturesContext.Provider value={{ flags: {} }}>
        <CompanionPermission />
      </FeaturesContext.Provider>
    </QueryClientProvider>,
  );
};

describe('companion permission component', () => {
  it('should render the title and description', async () => {
    renderComponent();
    const title = await screen.findByTestId('companion_permission_title');
    expect(title).toBeInTheDocument();
    const description = await screen.findByTestId(
      'companion_permission_description',
    );
    expect(description).toBeInTheDocument();
  });

  it('should render the links to the video for reference', async () => {
    renderComponent();
    const links = await screen.findAllByRole('link');
    expect(links.length).toEqual(2);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', companionExplainerVideo);
    });
  });

  it('should render the image preview for the video', async () => {
    renderComponent();
    const img = await screen.findByAltText('Companion video preview');
    expect(img).toBeInTheDocument();
  });

  it('should ask for permission when button is clicked', async () => {
    renderComponent();
    const key = 'permission_key';
    expect(client.getQueryData(key)).toBeFalsy();
    const button = await screen.findByRole('button');
    expect(button).toBeInTheDocument();
    await button.click();
    expect(client.getQueryData(key)).toEqual(true);
  });
});
