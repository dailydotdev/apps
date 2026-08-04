import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../../hooks';
import { usePrompt } from '../../../hooks/usePrompt';
import { useNotificationToggle } from '../../../hooks/notifications';
import { useComposerAudience } from '../../post/composer/useComposerAudience';
import { useComposerSubmit } from '../../post/composer/useComposerSubmit';
import { LogEvent } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { SmartComposerModal } from './SmartComposerModal';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
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

jest.mock('../../post/composer/PollForm', () => ({
  PollForm: () => null,
}));

jest.mock('../../post/composer/TextForm', () => ({
  TextForm: () => null,
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));

jest.mock('../../post/write/WriteLinkPreview', () => ({
  WriteLinkPreview: () => null,
}));

jest.mock('../../post/write/WritePreviewSkeleton', () => ({
  WritePreviewSkeleton: () => null,
}));

jest.mock('../common/Modal', () => ({
  Modal: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
};

describe('SmartComposerModal', () => {
  const logEvent = jest.fn();
  const showPrompt = jest.fn();
  const onSubmitted = jest.fn();
  const onRequestClose = jest.fn();
  let handleSubmit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    handleSubmit = jest.fn((event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
    });

    jest.mocked(useAuthContext).mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthContext>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent,
    } as unknown as ReturnType<typeof useLogContext>);
    jest.mocked(useSettingsContext).mockReturnValue({
      flags: {},
      loadedSettings: true,
    } as unknown as ReturnType<typeof useSettingsContext>);
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
      handleSubmit,
      isSubmitDisabled: false,
      isInFlight: false,
      preview: { url: 'https://daily.dev', title: 'daily.dev' },
      isLoadingPreview: false,
      fetchPreview: jest.fn(),
      standupErrors: {},
    });
  });

  it('keeps the production notification CTA visible in the composer', () => {
    renderWithClient(
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
    renderWithClient(
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

  it('keeps Enter in the link URL field from submitting the composer', () => {
    renderWithClient(
      <SmartComposerModal
        isOpen
        initialKind="link"
        onRequestClose={onRequestClose}
      />,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Link URL' }), {
      key: 'Enter',
    });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByRole('textbox', { name: 'Post commentary' }),
    ).toHaveFocus();
  });

  it('ignores the submit shortcut when submitting is blocked', () => {
    jest.mocked(useComposerSubmit).mockReturnValue({
      handleSubmit,
      isSubmitDisabled: true,
      isInFlight: false,
      preview: undefined,
      isLoadingPreview: true,
      fetchPreview: jest.fn(),
      standupErrors: {},
    });

    renderWithClient(
      <SmartComposerModal
        isOpen
        initialKind="link"
        onRequestClose={onRequestClose}
      />,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Link URL' }), {
      key: 'Enter',
      ctrlKey: true,
    });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.SubmitSmartComposer }),
    );
  });

  it('hides the expand control on mobile, where it is already full-screen', () => {
    jest.mocked(useViewSize).mockReturnValue(false);

    renderWithClient(
      <SmartComposerModal isOpen onRequestClose={onRequestClose} />,
    );

    expect(
      screen.queryByRole('button', { name: 'Expand composer' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the expand control on desktop', () => {
    renderWithClient(
      <SmartComposerModal isOpen onRequestClose={onRequestClose} />,
    );

    expect(
      screen.getByRole('button', { name: 'Expand composer' }),
    ).toBeInTheDocument();
  });

  it('moves the schedule action next to the header scheduling control on mobile', () => {
    jest.mocked(useViewSize).mockReturnValue(false);

    renderWithClient(
      <SmartComposerModal isOpen onRequestClose={onRequestClose} />,
    );

    const schedule = screen.getByRole('button', { name: 'Schedule post' });
    const scheduledNav = screen.getByRole('button', {
      name: 'Scheduled posts',
    });
    expect(schedule.parentElement).toBe(scheduledNav.parentElement);
  });

  it('keeps the schedule action beside the Post button on desktop', () => {
    renderWithClient(
      <SmartComposerModal
        isOpen
        initialKind="link"
        onRequestClose={onRequestClose}
      />,
    );

    const schedule = screen.getByRole('button', { name: 'Schedule post' });
    const scheduledNav = screen.getByRole('button', {
      name: 'Scheduled posts',
    });
    expect(schedule.parentElement).not.toBe(scheduledNav.parentElement);
  });

  describe('sharing a post to a squad', () => {
    const postPreview = {
      id: 'post-1',
      title: 'The shared article',
      permalink: 'https://api.daily.dev/r/post-1',
    };

    it('notifies the caller once the post goes through', async () => {
      const onPosted = jest.fn();

      renderWithClient(
        <SmartComposerModal
          isOpen
          initialUrl={postPreview.permalink}
          preview={postPreview}
          onPosted={onPosted}
          onRequestClose={onRequestClose}
        />,
      );

      const hookProps = jest.mocked(useComposerSubmit).mock.calls[0]?.[0];
      await hookProps?.onComplete();

      expect(onPosted).toHaveBeenCalledTimes(1);
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });

    it('closes an untouched seeded composer without the discard prompt', async () => {
      renderWithClient(
        <SmartComposerModal
          isOpen
          initialUrl={postPreview.permalink}
          preview={postPreview}
          onRequestClose={onRequestClose}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Close composer' }));

      await waitFor(() => expect(onRequestClose).toHaveBeenCalledTimes(1));
      expect(showPrompt).not.toHaveBeenCalled();
    });

    it('still prompts once the commentary diverges from the seed', async () => {
      showPrompt.mockResolvedValue(false);
      renderWithClient(
        <SmartComposerModal
          isOpen
          initialUrl={postPreview.permalink}
          preview={postPreview}
          onRequestClose={onRequestClose}
        />,
      );

      fireEvent.change(
        screen.getByRole('textbox', { name: 'Post commentary' }),
        {
          target: { value: 'my take' },
        },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Close composer' }));

      await waitFor(() => expect(showPrompt).toHaveBeenCalledTimes(1));
      expect(onRequestClose).not.toHaveBeenCalled();
    });

    it('opens on the link kind with the post seeded, ready to submit', () => {
      renderWithClient(
        <SmartComposerModal
          isOpen
          initialUrl={postPreview.permalink}
          preview={postPreview}
          initialSquadId="squad-1"
          onRequestClose={onRequestClose}
        />,
      );

      expect(screen.getByRole('textbox', { name: 'Link URL' })).toHaveValue(
        postPreview.permalink,
      );
      expect(
        screen.getByRole('textbox', { name: 'Post commentary' }),
      ).toHaveValue('');

      const hookProps = jest.mocked(useComposerSubmit).mock.calls[0]?.[0];
      expect(hookProps?.initialPreview).toBe(postPreview);
      expect(hookProps?.editPostId).toBeUndefined();
    });
  });

  describe('editing a share post', () => {
    const sharedPost = {
      title: 'The shared article',
      permalink: 'https://daily.dev/posts/shared',
    };
    const editShare = {
      id: 'post-1',
      type: PostType.Share,
      title: 'My take on this',
      sharedPost,
      source: { id: 'squad-1' },
    } as unknown as Post;

    it('opens on the link kind rather than defaulting to text', () => {
      renderWithClient(
        <SmartComposerModal
          isOpen
          editPost={editShare}
          onRequestClose={onRequestClose}
        />,
      );

      expect(
        screen.getByRole('textbox', { name: 'Post commentary' }),
      ).toHaveValue('My take on this');
    });

    it('locks the link, since only the commentary is editable', () => {
      renderWithClient(
        <SmartComposerModal
          isOpen
          editPost={editShare}
          onRequestClose={onRequestClose}
        />,
      );

      expect(
        screen.queryByRole('textbox', { name: 'Link URL' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Remove link preview' }),
      ).not.toBeInTheDocument();
    });

    it('seeds the preview from the post instead of refetching it', () => {
      renderWithClient(
        <SmartComposerModal
          isOpen
          editPost={editShare}
          onRequestClose={onRequestClose}
        />,
      );

      const hookProps = jest.mocked(useComposerSubmit).mock.calls[0]?.[0];
      expect(hookProps?.initialPreview).toBe(sharedPost);
      expect(hookProps?.editPostId).toBe('post-1');
    });

    it('offers an empty commentary when the share never had one', () => {
      // A share posted without commentary carries the shared post's title,
      // which is not the author's words and must not be presented as theirs.
      renderWithClient(
        <SmartComposerModal
          isOpen
          editPost={
            { ...editShare, title: sharedPost.title } as unknown as Post
          }
          onRequestClose={onRequestClose}
        />,
      );

      expect(
        screen.getByRole('textbox', { name: 'Post commentary' }),
      ).toHaveValue('');
    });
  });
});
