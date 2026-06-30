import React from 'react';
import { render } from '@testing-library/react';
import { CreateSharedPostModal } from './CreateSharedPostModal';
import { usePostToSquad } from '../../../hooks/squads/usePostToSquad';
import { useNotificationToggle } from '../../../hooks/notifications';

jest.mock('../../../hooks', () => ({
  ...(jest.requireActual('../../../hooks') as Iterable<unknown>),
  usePostToSquad: jest.fn(),
}));

jest.mock('../../../hooks/notifications', () => ({
  useNotificationToggle: jest.fn(),
}));

jest.mock('../common/Modal', () => {
  const MockModal = ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  );
  const MockModalHeader = () => null;
  const MockModalFooter = ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  );

  MockModal.Kind = { FlexibleCenter: 'FlexibleCenter' };
  MockModal.Size = { Medium: 'Medium' };
  MockModal.Header = MockModalHeader;
  MockModal.Footer = MockModalFooter;

  return {
    Modal: MockModal,
  };
});

jest.mock('../../fields/RichTextInput', () => {
  const { forwardRef } = jest.requireActual('react') as typeof React;

  return forwardRef(() => null);
});
jest.mock('../../post/write', () => ({
  WriteLinkPreview: () => null,
  WritePreviewSkeleton: () => null,
}));
jest.mock('../../cards/common/SourceButton', () => () => null);

describe('CreateSharedPostModal', () => {
  const onRequestClose = jest.fn();
  const onSharedSuccessfully = jest.fn();
  const onSubmitted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useNotificationToggle).mockReturnValue({
      shouldShowCta: false,
      isEnabled: false,
      onToggle: jest.fn(),
      onSubmitted,
    } as unknown as ReturnType<typeof useNotificationToggle>);
    jest.mocked(usePostToSquad).mockReturnValue({
      getLinkPreview: jest.fn(),
      isLoadingPreview: false,
      preview: {},
      isPosting: false,
      onSubmitPost: jest.fn(),
    } as unknown as ReturnType<typeof usePostToSquad>);
  });

  it('closes the modal from the shared completion callback', () => {
    render(
      <CreateSharedPostModal
        isOpen
        preview={{ url: 'https://daily.dev/post' }}
        squad={{ id: 'squad-1', name: 'Squad', handle: 'squad' } as never}
        onRequestClose={onRequestClose}
        onSharedSuccessfully={onSharedSuccessfully}
      />,
    );

    const hookProps = jest.mocked(usePostToSquad).mock.calls[0]?.[0];

    expect(hookProps?.onComplete).toBeDefined();

    hookProps?.onComplete?.();

    expect(onSharedSuccessfully).toHaveBeenCalledTimes(1);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
