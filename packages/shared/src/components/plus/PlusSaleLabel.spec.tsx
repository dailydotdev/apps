import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlusSaleLabel } from './PlusSaleLabel';
import { usePlusSale } from '../../hooks/usePlusSale';

jest.mock('../../hooks/usePlusSale', () => ({
  usePlusSale: jest.fn(),
}));

const mockUsePlusSale = usePlusSale as jest.MockedFunction<typeof usePlusSale>;

describe('PlusSaleLabel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sale label while a sale is running', () => {
    mockUsePlusSale.mockReturnValue({
      isActive: true,
      label: '50% off',
    } as never);

    render(<PlusSaleLabel />);

    expect(screen.getByText('50% off')).toBeInTheDocument();
  });

  it('renders nothing when no sale is running', () => {
    mockUsePlusSale.mockReturnValue({
      isActive: false,
      label: '50% off',
    } as never);

    const { container } = render(<PlusSaleLabel />);

    expect(container).toBeEmptyDOMElement();
  });
});
