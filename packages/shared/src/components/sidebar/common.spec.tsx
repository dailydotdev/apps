import React from 'react';
import { render, screen } from '@testing-library/react';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import { ItemInner } from './common';

const mockSimpleTooltipSpy = jest.fn();

jest.mock('../tooltips/SimpleTooltip', () => ({
  SimpleTooltip: ({ children, ...props }: TooltipProps) => {
    mockSimpleTooltipSpy(props);
    return <div>{children}</div>;
  },
}));

describe('ItemInner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap font icons with a tooltip when labels are hidden', () => {
    render(
      <ItemInner
        item={{ icon: '🧪', title: 'Custom feed' }}
        shouldShowLabel={false}
      />,
    );

    expect(screen.getByText('🧪')).toBeInTheDocument();
    expect(mockSimpleTooltipSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Custom feed',
        placement: 'right',
      }),
    );
  });

  it('should not render a tooltip for font icons when labels are shown', () => {
    render(
      <ItemInner item={{ icon: '🧪', title: 'Custom feed' }} shouldShowLabel />,
    );

    expect(screen.getByText('🧪')).toBeInTheDocument();
    expect(mockSimpleTooltipSpy).not.toHaveBeenCalled();
  });
});
