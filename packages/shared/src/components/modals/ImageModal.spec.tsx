import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageModal from './ImageModal';

const src = 'https://media.daily.dev/image.png';

const setup = (onRequestClose = jest.fn()) => {
  render(
    <ImageModal
      isOpen
      src={src}
      alt="Cover image"
      onRequestClose={onRequestClose}
    />,
  );
  return onRequestClose;
};

describe('ImageModal', () => {
  it('renders the image full-screen with its alt and contained sizing', () => {
    setup();
    const img = screen.getByAltText('Cover image');
    expect(img).toHaveAttribute('src', src);
    expect(img).toHaveClass('object-contain', 'max-h-full', 'max-w-full');
  });

  it('closes when the backdrop is clicked', () => {
    const onRequestClose = setup();
    const [overlay] = screen.getAllByRole('button', { name: 'Close' });
    fireEvent.click(overlay);
    expect(onRequestClose).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onRequestClose = setup();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalled();
  });
});
