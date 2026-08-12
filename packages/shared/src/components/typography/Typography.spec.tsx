import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Typography, TypographyTag, TypographyType } from './Typography';
import { Tooltip } from '../tooltip/Tooltip';

describe('Typography', () => {
  it('renders the requested tag with its computed classes', () => {
    render(
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        bold
        className="custom"
      >
        heading
      </Typography>,
    );

    const element = screen.getByRole('heading', { level: 2 });
    expect(element).toHaveClass('custom', 'typo-title3', 'font-bold');
  });

  it('forwards the ref to the rendered element', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Typography tag={TypographyTag.Span} ref={ref}>
        label
      </Typography>,
    );

    expect(ref.current).toBe(screen.getByText('label'));
  });

  // The element type has to be stable across renders. Building it during render
  // makes React remount on every pass, which loops a Radix `asChild` slot.
  it('keeps the same DOM node across re-renders', () => {
    const { rerender } = render(
      <Typography tag={TypographyTag.Span}>label</Typography>,
    );
    const first = screen.getByText('label');

    rerender(<Typography tag={TypographyTag.Span}>label</Typography>);

    expect(screen.getByText('label')).toBe(first);
  });

  it('does not loop when used as a Tooltip trigger', () => {
    expect(() =>
      render(
        <QueryClientProvider client={new QueryClient()}>
          <Tooltip content="tooltip content">
            <Typography tag={TypographyTag.Span}>trigger</Typography>
          </Tooltip>
        </QueryClientProvider>,
      ),
    ).not.toThrow();

    expect(screen.getByText('trigger')).toBeInTheDocument();
  });
});
