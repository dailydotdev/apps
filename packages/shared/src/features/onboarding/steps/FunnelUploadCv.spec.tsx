/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import the component
import { FunnelUploadCv } from './FunnelUploadCv';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';
import { useUploadCv } from '../../profile/hooks/useUploadCv';
import { useAuthContext } from '../../../contexts/AuthContext';

// Mock the hooks
jest.mock('../../profile/hooks/useUploadCv');
jest.mock('../../../contexts/AuthContext');

// Mock the UploadCv component to make testing easier
jest.mock('../components/UploadCv', () => ({
  UploadCv: ({
    onFilesDrop,
    status,
  }: {
    onFilesDrop: (files: File[]) => void;
    status: string;
  }) => (
    <div data-testid="upload-cv-mock">
      <div data-testid="status">{status}</div>
      <button
        type="button"
        data-testid="file-drop-trigger"
        onClick={() => onFilesDrop([new File(['test'], 'test.pdf')])}
      >
        Drop File
      </button>
    </div>
  ),
}));

// Mock the FunnelStepCtaWrapper
jest.mock('../shared/FunnelStepCtaWrapper', () => ({
  FunnelStepCtaWrapper: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled: boolean;
    onClick: () => void;
  }) => (
    <div data-testid="cta-wrapper">
      <div data-testid="disabled-state">{disabled.toString()}</div>
      <button
        type="button"
        data-testid="complete-button"
        onClick={onClick}
        disabled={disabled}
      >
        Complete
      </button>
      {children}
    </div>
  ),
}));

// Mock the withIsActiveGuard HOC to just return the component
jest.mock('../shared/withActiveGuard', () => ({
  withIsActiveGuard: <T,>(Component: T): T => Component,
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

interface TestParameters {
  headline: string;
  description: string;
  dragDropDescription: string;
  ctaDesktop: string;
  ctaMobile: string;
  linkedin: {
    cta: string;
    image: string;
    headline: string;
    explainer: string;
    steps: string[];
  };
}

const renderComponent = (
  parameters: TestParameters,
  onTransition = jest.fn(),
) => {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <FunnelUploadCv
        parameters={parameters}
        onTransition={onTransition}
        type={FunnelStepType.UploadCv}
        id="test-id"
        transitions={[]}
      />
    </QueryClientProvider>,
  );
};

describe('FunnelUploadCv', () => {
  const mockOnTransition = jest.fn();
  const mockOnUpload = jest.fn();

  const mockUseUploadCv = useUploadCv as jest.MockedFunction<
    typeof useUploadCv
  >;
  const mockUseAuthContext = useAuthContext as jest.MockedFunction<
    typeof useAuthContext
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUploadCv.mockReturnValue({
      onUpload: mockOnUpload,
      status: 'idle',
      isSuccess: false,
      isPending: false,
      shouldShow: false,
      onCloseBanner: undefined,
    });
    mockUseAuthContext.mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        linkedin: 'test-linkedin-profile',
        image: '',
        providers: [],
        createdAt: '',
        permalink: '',
        username: '',
        balance: {
          amount: 0,
        },
      },
    } as never);
  });

  const defaultParameters = {
    headline: 'Upload your CV',
    description: 'Upload your CV to get started',
    dragDropDescription: 'Drag & Drop your CV or',
    ctaDesktop: 'Browse files',
    ctaMobile: 'Upload CV',
    linkedin: {
      cta: 'Go to LinkedIn',
      image: 'https://example.com/linkedin.jpg',
      headline: 'Export from LinkedIn',
      explainer: 'Here’s how to get your CV from LinkedIn:',
      steps: ['Step 1', 'Step 2', 'Step 3'],
    },
  };

  describe('Basic functionality', () => {
    it('should render the component', () => {
      renderComponent(defaultParameters, mockOnTransition);

      expect(screen.getByTestId('upload-cv-mock')).toBeInTheDocument();
      expect(screen.getByTestId('cta-wrapper')).toBeInTheDocument();
    });

    it('should be disabled when upload is not successful', () => {
      renderComponent(defaultParameters, mockOnTransition);

      expect(screen.getByTestId('disabled-state')).toHaveTextContent('true');
      expect(screen.getByTestId('complete-button')).toBeDisabled();
    });

    it('should be enabled when upload is successful', () => {
      mockUseUploadCv.mockReturnValue({
        onUpload: mockOnUpload,
        status: 'success',
        isSuccess: true,
        isPending: false,
        shouldShow: false,
        onCloseBanner: undefined,
      });

      renderComponent(defaultParameters, mockOnTransition);

      expect(screen.getByTestId('disabled-state')).toHaveTextContent('false');
      expect(screen.getByTestId('complete-button')).toBeEnabled();
    });

    it('should call onTransition when complete button is clicked', () => {
      mockUseUploadCv.mockReturnValue({
        onUpload: mockOnUpload,
        status: 'success',
        isSuccess: true,
        isPending: false,
        shouldShow: false,
        onCloseBanner: undefined,
      });

      renderComponent(defaultParameters, mockOnTransition);

      const completeButton = screen.getByTestId('complete-button');
      fireEvent.click(completeButton);

      expect(mockOnTransition).toHaveBeenCalledTimes(1);
      expect(mockOnTransition).toHaveBeenCalledWith({
        type: FunnelStepTransitionType.Complete,
      });
    });

    it('should handle file drop', () => {
      renderComponent(defaultParameters, mockOnTransition);

      const fileDropTrigger = screen.getByTestId('file-drop-trigger');
      fireEvent.click(fileDropTrigger);

      expect(mockOnUpload).toHaveBeenCalledTimes(1);
      expect(mockOnUpload).toHaveBeenCalledWith(expect.any(File));
    });

    it('should pass status to UploadCv component', () => {
      mockUseUploadCv.mockReturnValue({
        onUpload: mockOnUpload,
        status: 'pending',
        isSuccess: false,
        isPending: true,
        shouldShow: false,
        onCloseBanner: jest.fn(),
      });

      renderComponent(defaultParameters, mockOnTransition);

      expect(screen.getByTestId('status')).toHaveTextContent('pending');
    });

    it('should return null when no user', () => {
      mockUseAuthContext.mockReturnValue({
        user: null,
        isLoggedIn: false,
        shouldShowLogin: false,
      } as never);

      const { container } = renderComponent(
        defaultParameters,
        mockOnTransition,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Upload hook integration', () => {
    it('should initialize useUploadCv with correct options', () => {
      renderComponent(defaultParameters, mockOnTransition);

      expect(mockUseUploadCv).toHaveBeenCalledWith({
        shouldOpenModal: false,
      });
    });

    it('should handle different upload statuses', () => {
      const statuses = ['idle', 'pending', 'success', 'error'] as const;

      statuses.forEach((status) => {
        jest.clearAllMocks();
        mockUseUploadCv.mockReturnValue({
          onUpload: mockOnUpload,
          status,
          isSuccess: status === 'success',
          isPending: status === 'pending',
          shouldShow: false,
          onCloseBanner: jest.fn(),
        });

        const { unmount } = renderComponent(
          defaultParameters,
          mockOnTransition,
        );

        expect(screen.getByTestId('status')).toHaveTextContent(status);
        expect(screen.getByTestId('disabled-state')).toHaveTextContent(
          status === 'success' ? 'false' : 'true',
        );

        unmount();
      });
    });
  });
});
