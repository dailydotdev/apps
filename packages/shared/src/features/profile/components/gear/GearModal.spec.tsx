import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GearModal } from './GearModal';
import { useGearSearch } from '../../hooks/useGearSearch';
import { useViewSize } from '../../../../hooks';

jest.mock('../../hooks/useGearSearch');
jest.mock('../../../../hooks', () => {
  const originalModule = jest.requireActual('../../../../hooks');
  return {
    ...originalModule,
    useViewSize: jest.fn(),
  };
});

const mockUseGearSearch = useGearSearch as jest.MockedFunction<
  typeof useGearSearch
>;
const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;

describe('GearModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGearSearch.mockReturnValue({
      results: [],
      isSearching: false,
    } as ReturnType<typeof useGearSearch>);
    mockUseViewSize.mockReturnValue(false);
  });

  it('should submit and close when pressing Enter in the input', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onRequestClose = jest.fn();

    render(
      <GearModal
        isOpen
        ariaHideApp={false}
        onRequestClose={onRequestClose}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText('Gear name');
    await userEvent.type(input, 'Magic Keyboard{enter}');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Magic Keyboard' });
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(onRequestClose).toHaveBeenCalledWith(null);
  });

  it('should submit and close when clicking add gear button', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onRequestClose = jest.fn();

    render(
      <GearModal
        isOpen
        ariaHideApp={false}
        onRequestClose={onRequestClose}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText('Gear name');
    fireEvent.change(input, { target: { value: 'MX Master' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add gear' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'MX Master' });
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(onRequestClose).toHaveBeenCalledWith(null);
  });
});
