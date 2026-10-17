import React from 'react';
import { render, screen } from '@testing-library/react';
import { TypographicCover } from './TypographicCover';

const post = {
  title: 'Introducing OpenFatigue',
  hook: 'Open in name only',
  tags: ['open-source', 'licensing'],
  readTime: 4,
  source: {
    handle: 'hn',
    name: 'Hacker News',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
  },
};

describe('TypographicCover', () => {
  it('paints the hook with the source and read time, not the title', () => {
    render(<TypographicCover post={post} variant="hook" />);
    const cover = screen.getByTestId('typographicCover');
    expect(cover).toHaveAttribute('data-cover', 'hook');
    expect(screen.getByText('Open in name only')).toBeInTheDocument();
    expect(
      screen.queryByText('Introducing OpenFatigue'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('hn')).toBeInTheDocument();
    expect(screen.getByText('4m read')).toBeInTheDocument();
    expect(screen.getByAltText('Avatar of hn')).toBeInTheDocument();
  });

  it('falls back to the title when asked', () => {
    render(<TypographicCover post={post} variant="title" />);
    expect(screen.getByTestId('typographicCover')).toHaveAttribute(
      'data-cover',
      'title',
    );
    expect(screen.getByText('Introducing OpenFatigue')).toBeInTheDocument();
    expect(screen.queryByText('Open in name only')).not.toBeInTheDocument();
  });
});
