import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ad from '../../../../__tests__/fixture/ad';
import { AdGrid } from './AdGrid';
import { AdList } from './AdList';
import type { AdCardProps } from './common/common';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ActiveFeedContext } from '../../../contexts';

const defaultProps: AdCardProps = {
  ad,
  onLinkClick: jest.fn(),
  index: 0,
  feedIndex: 0,
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<AdCardProps> = {}): RenderResult => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ActiveFeedContext.Provider value={{ queryKey: ['test'], items: [] }}>
        <AdGrid {...defaultProps} {...props} />
      </ActiveFeedContext.Provider>
    </TestBootProvider>,
  );
};

const renderListComponent = (
  props: Partial<AdCardProps> = {},
): RenderResult => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ActiveFeedContext.Provider value={{ queryKey: ['test'], items: [] }}>
        <AdList {...defaultProps} {...props} />
      </ActiveFeedContext.Provider>
    </TestBootProvider>,
  );
};

const getNormalizedText = (element?: Element | null): string =>
  element?.textContent?.replace(/\u200B/g, '').trim() ?? '';

it('should call on click on component left click', async () => {
  renderComponent();
  const el = await screen.findByTestId('adItem');
  const links = await within(el).findAllByRole('link');
  links[0].click();
  await waitFor(() => expect(defaultProps.onLinkClick).toBeCalledWith(ad));
});

it('should call on click on component middle mouse up', async () => {
  renderComponent();
  const el = await screen.findByTestId('adItem');
  const links = await within(el).findAllByRole('link');
  links[0].dispatchEvent(
    new MouseEvent('auxclick', { bubbles: true, button: 1 }),
  );
  await waitFor(() => expect(defaultProps.onLinkClick).toBeCalledWith(ad));
});

it('should show a single image by default', async () => {
  renderComponent();
  const img = await screen.findByAltText('Ad image');
  const background = screen.queryByAltText('Ad image background');
  expect(img).toBeInTheDocument();
  expect(background).not.toBeInTheDocument();
});

it('should show blurred image for carbon', async () => {
  renderComponent({ ad: { ...ad, source: 'Carbon' } });
  const img = await screen.findByAltText('Ad image');
  const background = screen.queryByAltText('Ad image background');
  expect(img).toHaveClass('absolute');
  expect(background).toBeInTheDocument();
});

it('should show pixel images', async () => {
  renderComponent({
    ad: { ...ad, pixel: ['https://daily.dev/pixel'] },
  });
  const el = await screen.findByTestId('pixel');
  expect(el).toHaveAttribute('src', 'https://daily.dev/pixel');
});

it('should render promoted attribution outside of list title clamp', async () => {
  const promotedMatcher = (_: string, element?: Element | null): boolean => {
    const text = getNormalizedText(element);
    return text === 'Promoted' || text.startsWith('Promoted by ');
  };

  renderListComponent();

  const title = screen.getByRole('heading', { level: 3 });
  expect(getNormalizedText(title)).not.toContain('Promoted');
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});
