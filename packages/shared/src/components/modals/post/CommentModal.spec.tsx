import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import CommentModal from './CommentModal';
import Post from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { useAuthContext } from '../../../contexts/AuthContext';
import useCommentById from '../../../hooks/comments/useCommentById';
import { useNotificationToggle } from '../../../hooks/notifications';
import { useMutateComment } from '../../../hooks/post/useMutateComment';

jest.mock('../common/Modal', () => {
  const mockReact = jest.requireActual('react') as typeof React;

  const MockModalBody = mockReact.forwardRef<
    HTMLElement,
    { children: ReactNode; className?: string }
  >(({ children, className }, ref) => (
    <section className={className} data-testid="modal-body" ref={ref}>
      {children}
    </section>
  ));

  MockModalBody.displayName = 'MockModalBody';

  const Modal = ({ children }: { children: ReactNode }) => (
    <div data-testid="modal">{children}</div>
  );

  Modal.Body = MockModalBody;

  return { Modal };
});

jest.mock('../../comments/CommentContainer', () => ({
  __esModule: true,
  default: () => <div data-testid="comment-container" />,
}));

jest.mock('../../fields/Switch', () => {
  const mockReact = jest.requireActual('react') as typeof React;

  const MockSwitch = mockReact.forwardRef<
    HTMLLabelElement,
    {
      children: ReactNode;
      className?: string;
      labelClassName?: string;
    }
  >(({ children, className, labelClassName }, ref) => (
    <label
      className={className}
      data-testid="notification-switch"
      htmlFor="notification-switch-input"
      ref={ref}
    >
      <span className={labelClassName}>{children}</span>
      <input id="notification-switch-input" type="checkbox" />
    </label>
  ));

  MockSwitch.displayName = 'MockSwitch';

  return {
    Switch: MockSwitch,
  };
});

jest.mock('../../fields/MarkdownInput/CommentMarkdownInput', () => {
  const mockReact = jest.requireActual('react') as typeof React;

  const MockCommentMarkdownInput = mockReact.forwardRef<
    HTMLFormElement,
    {
      className?: Record<string, string>;
      formProps?: Record<string, string>;
    }
  >(({ className, formProps }, ref) => (
    <form
      {...formProps}
      className={className?.container}
      data-testid="comment-form"
      ref={ref}
    >
      <div
        className={className?.markdownContainer}
        data-testid="markdown-container"
      >
        <textarea
          aria-label="Share your thoughts"
          className={className?.input}
        />
      </div>
    </form>
  ));

  MockCommentMarkdownInput.displayName = 'MockCommentMarkdownInput';

  return {
    CommentMarkdownInput: MockCommentMarkdownInput,
  };
});

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../../hooks/post/useMutateComment', () => ({
  useMutateComment: jest.fn(),
}));

jest.mock('../../../hooks/notifications', () => ({
  useNotificationToggle: jest.fn(),
}));

jest.mock('../../../hooks/comments/useCommentById', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseMutateComment = useMutateComment as jest.Mock;
const mockUseNotificationToggle = useNotificationToggle as jest.Mock;
const mockUseCommentById = useCommentById as jest.Mock;

const defaultProps = {
  isOpen: true,
  onRequestClose: jest.fn(),
  post: Post,
};

const renderComponent = () => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <CommentModal {...defaultProps} />
    </QueryClientProvider>,
  );
};

describe('CommentModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: loggedUser });
    mockUseMutateComment.mockReturnValue({
      mutateComment: jest.fn(),
      isLoading: false,
      isSuccess: false,
    });
    mockUseNotificationToggle.mockReturnValue({
      shouldShowCta: true,
      isEnabled: true,
      onToggle: jest.fn(),
      onSubmitted: jest.fn(),
    });
    mockUseCommentById.mockReturnValue({ comment: null });
  });

  it('should keep the mobile modal background on the scroll surface', () => {
    renderComponent();

    expect(screen.getByTestId('modal-body')).toHaveClass(
      'bg-background-default',
    );
  });

  it('should keep the editor and notification switch in the normal flex flow', () => {
    renderComponent();

    const commentForm = screen.getByTestId('comment-form');

    expect(commentForm).toHaveClass('flex', 'min-h-0');
    expect(screen.getByTestId('markdown-container')).toHaveClass(
      'min-h-0',
      'flex-1',
    );
    expect(screen.getByTestId('notification-switch')).toBeInTheDocument();
    expect(commentForm).not.toHaveAttribute('style');
  });
});
