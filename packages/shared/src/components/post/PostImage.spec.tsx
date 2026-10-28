import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostImage } from './PostImage';
import { LazyModal } from '../modals/common/types';
import { REQUEST_PROTOCOL_KEY } from '../../graphql/common';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';

const mockOpenModal = jest.fn();

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

const src = 'https://media.daily.dev/comic.png';

const renderImage = (isCompanion = false, image = src) => {
  const client = new QueryClient();
  client.setQueryData(REQUEST_PROTOCOL_KEY, { isCompanion });
  return render(
    <QueryClientProvider client={client}>
      <PostImage src={image} alt="A comic" />
    </QueryClientProvider>,
  );
};

beforeEach(() => jest.clearAllMocks());

it('opens the full image in the viewer from an accessible button', () => {
  renderImage();

  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Open image' })).toHaveFocus();
  userEvent.keyboard('{Enter}');

  expect(mockOpenModal).toHaveBeenCalledWith({
    type: LazyModal.ImageView,
    props: {
      src,
      alt: 'A comic',
      originRect: expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
      }),
    },
  });
  expect(screen.getByAltText('A comic')).toHaveClass(
    'h-auto',
    'object-contain',
  );
});

it('opens the image in a new tab in the extension companion', () => {
  renderImage(true);

  fireEvent.click(screen.getByRole('button', { name: 'Open image' }));

  expect(window.open).toHaveBeenCalledWith(
    src,
    '_blank',
    'noopener,noreferrer',
  );
  expect(mockOpenModal).not.toHaveBeenCalled();
});

it.each(['', cloudinaryPostImageCoverPlaceholder])(
  'does not offer a viewer for an absent or placeholder image: %s',
  (image) => {
    renderImage(false, image);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  },
);
