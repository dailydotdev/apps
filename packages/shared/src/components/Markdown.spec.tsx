import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import Markdown from './Markdown';
import { LazyModal } from './modals/common/types';
import { useRequestProtocol } from '../hooks/useRequestProtocol';

const mockOpenModal = jest.fn();

jest.mock('../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('../hooks/useDomPurify', () => ({
  useDomPurify: () => ({ sanitize: (content: string) => content }),
}));

jest.mock('../hooks/useRequestProtocol', () => ({
  useRequestProtocol: jest.fn(),
}));

const mockUseRequestProtocol = useRequestProtocol as jest.MockedFunction<
  typeof useRequestProtocol
>;

const renderMarkdown = (content: string) => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <Markdown content={content} />
    </QueryClientProvider>,
  );
};

describe('Markdown image interactions', () => {
  const imageUrl = 'https://media.daily.dev/image/upload/f_auto/v1/posts/abc';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRequestProtocol.mockReturnValue({
      requestMethod: jest.fn(),
      fetchMethod: jest.fn(),
      isCompanion: false,
    } as unknown as ReturnType<typeof useRequestProtocol>);
  });

  it('opens a linked image in the lightbox and prevents navigation', () => {
    renderMarkdown(
      `<a href="${imageUrl}" target="_blank" rel="noopener nofollow ugc"><img src="${imageUrl}" alt="Screenshot" /></a>`,
    );

    const image = screen.getByRole('button', { name: 'Open image' });
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });

    image.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LazyModal.ImageView,
        props: expect.objectContaining({
          src: imageUrl,
          alt: 'Screenshot',
          originRect: expect.objectContaining({
            top: expect.any(Number),
            left: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number),
          }),
        }),
      }),
    );
  });

  it('opens a linked image from the keyboard and prevents navigation', () => {
    renderMarkdown(
      `<a href="${imageUrl}" target="_blank" rel="noopener nofollow ugc"><img src="${imageUrl}" alt="Screenshot" /></a>`,
    );

    const image = screen.getByRole('button', { name: 'Open image' });

    expect(fireEvent.keyDown(image, { key: 'Enter' })).toBe(false);
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LazyModal.ImageView,
        props: expect.objectContaining({
          src: imageUrl,
          alt: 'Screenshot',
        }),
      }),
    );
  });

  it('allows an image wrapped by a non-image link to follow that link once', () => {
    const linkUrl = 'https://github.com/dailydotdev/apps';
    renderMarkdown(
      `<a href="${linkUrl}" target="_blank" rel="noopener nofollow ugc"><img src="${imageUrl}" alt="Repository badge" /></a>`,
    );

    const image = screen.getByRole('button', { name: 'Open image' });
    const anchor = image.closest('a');
    const onAnchorClick = jest.fn();

    anchor?.addEventListener('click', onAnchorClick);
    fireEvent.click(image);

    expect(onAnchorClick).toHaveBeenCalledTimes(1);
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('allows an image wrapped by a non-image link to follow that link from the keyboard', () => {
    const linkUrl = 'https://github.com/dailydotdev/apps';
    renderMarkdown(
      `<a href="${linkUrl}" target="_blank" rel="noopener nofollow ugc"><img src="${imageUrl}" alt="Repository badge" /></a>`,
    );

    const image = screen.getByRole('button', { name: 'Open image' });
    const anchor = image.closest('a');
    const onAnchorClick = jest.fn();

    anchor?.addEventListener('click', onAnchorClick);
    expect(fireEvent.keyDown(image, { key: 'Enter' })).toBe(false);

    expect(onAnchorClick).toHaveBeenCalledTimes(1);
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('opens a bare image in the lightbox', () => {
    renderMarkdown(`<img src="${imageUrl}" alt="Screenshot" />`);

    fireEvent.click(screen.getByRole('button', { name: 'Open image' }));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LazyModal.ImageView,
        props: expect.objectContaining({
          src: imageUrl,
          alt: 'Screenshot',
        }),
      }),
    );
  });

  it('opens a text link to an image in the lightbox', () => {
    renderMarkdown(
      `<a href="https://example.com/screenshot.png?raw=1" target="_blank" rel="noopener nofollow ugc">screenshot</a>`,
    );

    fireEvent.click(screen.getByRole('link', { name: 'screenshot' }));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LazyModal.ImageView,
        props: expect.objectContaining({
          src: 'https://example.com/screenshot.png?raw=1',
          alt: 'screenshot',
        }),
      }),
    );
  });

  it('opens image links in a new tab for the companion', () => {
    mockUseRequestProtocol.mockReturnValue({
      requestMethod: jest.fn(),
      fetchMethod: jest.fn(),
      isCompanion: true,
    } as unknown as ReturnType<typeof useRequestProtocol>);

    renderMarkdown(`<img src="${imageUrl}" alt="Screenshot" />`);

    fireEvent.click(screen.getByRole('button', { name: 'Open image' }));

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      imageUrl,
      '_blank',
      'noopener,noreferrer',
    );
    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});
