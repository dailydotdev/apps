import React from 'react';
import '@testing-library/jest-dom';
import {
  findByTestId,
  getByTestId,
  render,
  RenderResult,
  screen,
} from '@testing-library/preact';
import { TopSites } from 'webextension-polyfill-ts';
import App from './App';

jest.mock('webextension-polyfill-ts', () => {
  let providedPermission = false;

  return {
    browser: {
      permissions: {
        remove: jest.fn(),
        request: () =>
          new Promise((resolve) => {
            providedPermission = true;
            resolve(true);
          }),
      },
    },
  };
});

const renderComponent = (postdata, settings): RenderResult => {
  return render(<App postData={postdata} settings={settings} />);
};

describe('companion app', function () {
  it('should render the companion appp', async () => {
    renderComponent({}, {});
    const wrapper = await screen.findByTestId('companion');
    expect(wrapper).toBeInTheDocument();
  });

  it('should not render the companion is opt out', async () => {
    const { container } = renderComponent({}, { optOutCompanion: true });
    expect(container).toBeEmptyDOMElement();
  });

  it('should toggle the companion open', async () => {
    renderComponent({}, {});
    const wrapper = await screen.findByTestId('companion');
    expect(wrapper).toHaveClass('translate-x-[22.5rem]');
    const toggleButton = await screen.findByLabelText('Toggle');
    expect(toggleButton).toBeInTheDocument();
    await toggleButton.click();
    expect(wrapper).toHaveClass('translate-x-0');
    expect(await screen.findByText('TLDR -')).toBeInTheDocument();
  });
});
