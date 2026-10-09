import React from 'react';
import { render, screen } from '@testing-library/react';
import PostLoadingSkeleton from './PostLoadingSkeleton';

// The page shows this while the post is still unknown (a private squad post
// has no server copy), so it must paint without a post type.
it('renders the busy skeleton before the post is known', () => {
  render(<PostLoadingSkeleton />);

  expect(screen.getByLabelText('Loading post')).toHaveAttribute(
    'aria-busy',
    'true',
  );
});
