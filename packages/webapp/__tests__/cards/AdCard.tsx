import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { AdCard, AdCardProps } from '../../components/cards/AdCard';
import { Ad } from '../../graphql/posts';

const defaultAd: Ad = {
  description: 'I am an ad!',
  image: 'https://daily.dev/daily.png',
  link: 'https://daily.dev',
  source: 'Daily',
};

const defaultProps: AdCardProps = {
  ad: defaultAd,
  onImpression: jest.fn(),
  onLinkClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<AdCardProps> = {}): RenderResult => {
  return render(<AdCard {...defaultProps} {...props} />);
};

it('should call on impression as soon as the component is mounted', async () => {
  renderComponent();
  await waitFor(() =>
    expect(defaultProps.onImpression).toBeCalledWith(defaultAd),
  );
});

it('should call on click on component left click', async () => {
  renderComponent();
  const el = await screen.findByRole('link');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onLinkClick).toBeCalledWith(defaultAd),
  );
});

it('should call on click on component middle mouse up', async () => {
  renderComponent();
  const el = await screen.findByRole('link');
  el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 1 }));
  await waitFor(() =>
    expect(defaultProps.onLinkClick).toBeCalledWith(defaultAd),
  );
});

it('should show a single image by default', async () => {
  renderComponent();
  const img = await screen.findByAltText('Ad image');
  const background = screen.queryByAltText('Ad image background');
  expect(img).toBeInTheDocument();
  expect(background).not.toBeInTheDocument();
});

it('should show blurred image for carbon', async () => {
  renderComponent({ ad: { ...defaultAd, source: 'Carbon' } });
  const img = await screen.findByAltText('Ad image');
  const background = screen.queryByAltText('Ad image background');
  expect(img).toBeInTheDocument();
  // eslint-disable-next-line testing-library/no-node-access
  expect(img.parentElement).toHaveClass('absolute');
  expect(background).toBeInTheDocument();
});

it('should show promoted text by default', async () => {
  renderComponent();
  const el = await screen.findByText('Promoted');
  expect(el).toBeInTheDocument();
});

it('should show referral text when available', async () => {
  renderComponent({
    ad: { ...defaultAd, referralLink: 'https://daily.dev/referral' },
  });
  const el = await screen.findByText('Promoted by Daily');
  expect(el).toHaveAttribute('href', 'https://daily.dev/referral');
});

it('should show pixel images', async () => {
  renderComponent({
    ad: { ...defaultAd, pixel: ['https://daily.dev/pixel'] },
  });
  const el = await screen.findByTestId('pixel');
  expect(el).toHaveAttribute('src', 'https://daily.dev/pixel');
});
