import React from 'react';
import { render, screen } from '@testing-library/react';
import { GeneratedCover } from './GeneratedCover';

const post = {
  id: 'FXWLOZJKE',
  hook: 'Open in name only',
  source: {
    handle: 'hn',
    name: 'Hacker News',
    flags: { logoColors: ['#FF6D00'] },
  },
};

describe('GeneratedCover', () => {
  it('paints the pattern in the source colour without any text', () => {
    render(<GeneratedCover post={post} variant="pattern" />);
    const cover = screen.getByTestId('generatedCover');
    expect(cover).toHaveAttribute('data-cover', 'pattern');
    expect(cover.firstElementChild).toHaveStyle({ color: '#FF6D00' });
    expect(cover.querySelector('svg')).toBeInTheDocument();
    expect(cover).not.toHaveTextContent(/\S/);
  });

  it('paints the hook when asked', () => {
    render(<GeneratedCover post={post} variant="hook" />);
    expect(screen.getByTestId('generatedCover')).toHaveAttribute(
      'data-cover',
      'hook',
    );
    expect(screen.getByText('Open in name only')).toBeInTheDocument();
  });

  it('is deterministic per post and differs between posts', () => {
    const { unmount } = render(
      <GeneratedCover post={post} variant="pattern" />,
    );
    const first = screen.getByTestId('generatedCover').innerHTML;
    unmount();
    render(<GeneratedCover post={post} variant="pattern" />);
    expect(screen.getByTestId('generatedCover').innerHTML).toBe(first);
    render(
      <GeneratedCover post={{ ...post, id: 'FRa4FFU4W' }} variant="pattern" />,
    );
    const [, second] = screen.getAllByTestId('generatedCover');
    expect(second.innerHTML).not.toBe(first);
  });
});
