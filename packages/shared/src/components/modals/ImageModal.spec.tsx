import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageModal from './ImageModal';
import { useViewSize } from '../../hooks/useViewSize';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn().mockReturnValue(true),
}));

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

  it('does not send lightbox clicks to the parent post', () => {
    const onParentClick = jest.fn();
    const onRequestClose = jest.fn();
    render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
      <div onClick={onParentClick}>
        <ImageModal isOpen src={src} onRequestClose={onRequestClose} />
      </div>,
    );

    fireEvent.click(screen.getByAltText('Image'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);

    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'keeps focus in the viewer and restores the trigger, tablet: %s',
    (isTablet) => {
      jest.mocked(useViewSize).mockReturnValue(isTablet);
      render(<button type="button">Open cover</button>);
      const trigger = screen.getByRole('button', { name: 'Open cover' });
      trigger.focus();
      const { unmount } = render(<ImageModal isOpen src={src} />);
      const closeButton = screen.getAllByRole('button', { name: 'Close' })[
        isTablet ? 2 : 1
      ];

      expect(closeButton).toHaveFocus();
      fireEvent.keyDown(closeButton, { key: 'Tab' });
      expect(closeButton).toHaveFocus();
      fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });
      expect(closeButton).toHaveFocus();

      unmount();
      expect(trigger).toHaveFocus();
    },
  );
});
