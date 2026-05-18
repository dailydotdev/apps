import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useViewSize, ViewSize } from '../../../hooks';
import { usePrompt } from '../../../hooks/usePrompt';
import { useNotificationToggle } from '../../../hooks/notifications';
import { useComposerAudience } from '../../post/composer/useComposerAudience';
import { useComposerSubmit } from '../../post/composer/useComposerSubmit';
import { SmartComposerModal } from './SmartComposerModal';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../../hooks', () => {
  const actual = jest.requireActual('../../../hooks');

  return {
    ...actual,
    useViewSize: jest.fn(),
  };
});

jest.mock('../../../hooks/usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../../../hooks/notifications', () => ({
  useNotificationToggle: jest.fn(),
}));

jest.mock('../../post/composer/useComposerAudience', () => ({
  isUserAudience: jest.fn(() => false),
  useComposerAudience: jest.fn(),
}));

jest.mock('../../post/composer/useComposerSubmit', () => ({
  useComposerSubmit: jest.fn(),
}));

jest.mock('../../post/composer/AudienceChip', () => ({
  AudienceChip: () => null,
}));

jest.mock('../../post/composer/KindModePicker', () => ({
  KindModePicker: () => null,
}));

jest.mock('../../post/composer/LinkForm', () => ({
  LinkForm: () => null,
}));

jest.mock('../../post/composer/PollForm', () => ({
  PollForm: () => null,
}));

jest.mock('../../post/composer/TextForm', () => ({
  TextForm: () => null,
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));

jest.mock('../common/Modal', () => ({
  Modal: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

describe('SmartComposerModal', () => {
  const logEvent = jest.fn();
  const showPrompt = jest.fn();
  const onSubmitted = jest.fn();
  const onRequestClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useAuthContext).mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthContext>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent,
    } as unknown as ReturnType<typeof useLogContext>);
    jest
      .mocked(useViewSize)
      .mockImplementation((size) => size === ViewSize.Laptop);
    jest.mocked(usePrompt).mockReturnValue({
      showPrompt,
    } as unknown as ReturnType<typeof usePrompt>);
    jest.mocked(useNotificationToggle).mockReturnValue({
      shouldShowCta: true,
      isEnabled: true,
      onToggle: jest.fn(),
      onSubmitted,
    } as unknown as ReturnType<typeof useNotificationToggle>);
    jest.mocked(useComposerAudience).mockReturnValue({
      audiences: [],
      selectedIds: ['squad-1'],
      selected: [
        {
          id: 'squad-1',
          name: 'Squad',
          handle: 'squad',
        },
      ],
      setSelectedIds: jest.fn(),
      userAudienceId: 'user-1',
    } as unknown as ReturnType<typeof useComposerAudience>);
    jest.mocked(useComposerSubmit).mockReturnValue({
      handleSubmit: jest.fn(),
      isSubmitDisabled: false,
      isInFlight: false,
      preview: { url: 'https://daily.dev', title: 'daily.dev' },
      isLoadingPreview: false,
      fetchPreview: jest.fn(),
    });
  });

  it('keeps the production notification CTA visible in the composer', () => {
    render(
      <SmartComposerModal
        isOpen
        initialUrl="https://daily.dev"
        onRequestClose={onRequestClose}
      />,
    );

    expect(
      screen.getByText(
        'Receive updates whenever your Squad members engage with your post',
      ),
    ).toBeInTheDocument();
  });

  it('runs notification submit handling before closing after a successful post', async () => {
    render(
      <SmartComposerModal
        isOpen
        initialUrl="https://daily.dev"
        onRequestClose={onRequestClose}
      />,
    );

    const hookProps = jest.mocked(useComposerSubmit).mock.calls[0]?.[0];

    expect(hookProps?.onComplete).toBeDefined();

    await hookProps?.onComplete();

    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
