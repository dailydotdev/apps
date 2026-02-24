import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SubmitExternalLink } from './SubmitExternalLink';

jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({
    openModal: jest.fn(),
  }),
}));

jest.mock('../../../hooks/input', () => ({
  useDebouncedUrl: (
    callback: (value: string) => void,
    onValidate: (value: string) => boolean,
  ) => [
    (value: string) => {
      if (onValidate(value) && /^https?:\/\//.test(value)) {
        callback(value);
      }
    },
    jest.fn(),
  ],
}));

describe('SubmitExternalLink', () => {
  it('should request link preview for initial url', () => {
    const getLinkPreview = jest.fn();

    render(
      <SubmitExternalLink
        preview={undefined}
        isLoadingPreview={false}
        getLinkPreview={getLinkPreview}
        onSelectedHistory={jest.fn()}
        initialUrl="https://daily.dev"
      />,
    );

    expect(getLinkPreview).toHaveBeenCalledWith('https://daily.dev');
    expect(screen.getByDisplayValue('https://daily.dev')).toBeInTheDocument();
  });

  it('should not request link preview for invalid initial url', () => {
    const getLinkPreview = jest.fn();

    render(
      <SubmitExternalLink
        preview={undefined}
        isLoadingPreview={false}
        getLinkPreview={getLinkPreview}
        onSelectedHistory={jest.fn()}
        initialUrl="invalid-url"
      />,
    );

    expect(getLinkPreview).not.toHaveBeenCalled();
  });

  it('should request link preview after user input', () => {
    const getLinkPreview = jest.fn();

    render(
      <SubmitExternalLink
        preview={undefined}
        isLoadingPreview={false}
        getLinkPreview={getLinkPreview}
        onSelectedHistory={jest.fn()}
      />,
    );

    const input = screen.getByPlaceholderText('Enter URL');
    fireEvent.input(input, { target: { value: 'https://example.com' } });

    expect(getLinkPreview).toHaveBeenCalled();
  });
});
