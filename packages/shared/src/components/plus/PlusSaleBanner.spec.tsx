import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlusSaleBanner } from './PlusSaleBanner';
import { usePlusSale } from '../../hooks/usePlusSale';

jest.mock('../../hooks/usePlusSale', () => ({
  usePlusSale: jest.fn(),
}));

const mockUsePlusSale = usePlusSale as jest.MockedFunction<typeof usePlusSale>;

const sale = {
  isActive: true,
  label: '50% off',
  headline: 'Black Friday: 50% off daily.dev Plus',
  description: 'Offer ends December 1.',
  code: 'BLACKFRIDAY50',
};

describe('PlusSaleBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds the Black Friday eyebrow and discount for the Black Friday theme', () => {
    mockUsePlusSale.mockReturnValue({ ...sale, theme: 'blackFriday' } as never);

    render(<PlusSaleBanner />);

    expect(screen.getByText(sale.headline)).toBeInTheDocument();
    expect(screen.getByText('Black Friday')).toBeInTheDocument();
    expect(screen.getByText('50% off')).toBeInTheDocument();
  });

  it('keeps the plain banner when no theme is set', () => {
    mockUsePlusSale.mockReturnValue(sale as never);

    render(<PlusSaleBanner />);

    expect(screen.getByText(sale.headline)).toBeInTheDocument();
    expect(screen.queryByText('Black Friday')).not.toBeInTheDocument();
  });

  it('renders nothing when no sale is running', () => {
    mockUsePlusSale.mockReturnValue({ ...sale, isActive: false } as never);

    const { container } = render(<PlusSaleBanner />);

    expect(container).toBeEmptyDOMElement();
  });
});
