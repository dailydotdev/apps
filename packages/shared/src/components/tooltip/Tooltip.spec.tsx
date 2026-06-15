import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tooltip } from './Tooltip';
import type { TooltipProps } from './Tooltip';

const renderTooltip = (props: Partial<TooltipProps> = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Tooltip content="Saved to library" open {...props}>
        <button type="button">trigger</button>
      </Tooltip>
    </QueryClientProvider>,
  );

describe('Tooltip', () => {
  it('renders its content when open', () => {
    renderTooltip();
    expect(screen.getAllByText('Saved to library').length).toBeGreaterThan(0);
  });

  it('does not render an arrow by default', () => {
    const { baseElement } = renderTooltip();
    expect(baseElement.querySelector('.TooltipArrow')).toBeNull();
  });

  it('renders an arrow only when showArrow is set', () => {
    const { baseElement } = renderTooltip({ showArrow: true });
    expect(baseElement.querySelector('.TooltipArrow')).not.toBeNull();
  });

  it('exposes string content as the trigger aria-label', () => {
    renderTooltip();
    expect(
      screen.getByRole('button', { name: 'Saved to library' }),
    ).toBeInTheDocument();
  });

  it('renders the trigger without a tooltip when not visible', () => {
    const { baseElement } = renderTooltip({ visible: false });
    expect(screen.getByRole('button', { name: 'trigger' })).toBeInTheDocument();
    expect(baseElement.querySelector('.TooltipArrow')).toBeNull();
  });
});
