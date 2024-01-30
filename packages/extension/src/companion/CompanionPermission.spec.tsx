import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, RenderResult, screen } from '@testing-library/react';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import { ExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { contentScriptKey } from '@dailydotdev/shared/src/hooks';
import { CompanionPermission } from './CompanionPermission';
import {
  registerBrowserContentScripts,
  requestContentScripts,
  getContentScriptPermission,
} from '../lib/extensionScripts';

let client: QueryClient;

jest.mock('content-scripts-register-polyfill', () => ({}));

jest.mock('webextension-polyfill', () => {
  return {
    contentScripts: {
      register: jest.fn(),
    },
    scripting: {
      getRegisteredContentScripts: jest.fn().mockImplementation(() => []),
      registerContentScripts: jest.fn(),
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
  };
});

const renderComponent = (): RenderResult => {
  client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ExtensionContext.Provider
        value={{
          requestContentScripts: requestContentScripts?.(client, jest.fn()),
          registerBrowserContentScripts,
          getContentScriptPermission,
        }}
      >
        <CompanionPermission />
      </ExtensionContext.Provider>
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
    expect(client.getQueryData(contentScriptKey)).toBeFalsy();
    const button = await screen.findByRole('button');
    expect(button).toBeInTheDocument();
    await button.click();
    expect(client.getQueryData(contentScriptKey)).toEqual(true);
  });
});
