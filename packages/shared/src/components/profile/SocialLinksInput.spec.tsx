import React, { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import type { UserSocialLink } from '../../lib/user';
import {
  SocialLinksInput,
  type SocialLinksInputHandle,
} from './SocialLinksInput';

const mockDisplayToast = jest.fn();

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

type FormValues = {
  socialLinks: UserSocialLink[];
};

const TestForm = ({
  defaultLinks = [],
  isError = false,
  isLoading = false,
  onSubmit,
}: {
  defaultLinks?: UserSocialLink[];
  isError?: boolean;
  isLoading?: boolean;
  onSubmit: (values: FormValues) => void;
}) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      socialLinks: defaultLinks,
    },
  });
  const socialLinksRef = useRef<SocialLinksInputHandle>(null);

  const handleSubmit = methods.handleSubmit(() => {
    if (socialLinksRef.current && !socialLinksRef.current.flushPendingUrl()) {
      return;
    }

    onSubmit(methods.getValues());
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        <SocialLinksInput
          ref={socialLinksRef}
          name="socialLinks"
          isLoading={isLoading}
          isError={isError}
        />
        <button type="submit">Save</button>
      </form>
    </FormProvider>
  );
};

describe('SocialLinksInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('commits pending text before submitting', async () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.type(
      screen.getByPlaceholderText('Paste a URL (e.g., github.com/username)'),
      'github.com/testuser',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        socialLinks: [
          {
            platform: 'github',
            url: 'https://github.com/testuser',
          },
        ],
      }),
    );
  });

  it('blocks submit and renders an inline error for invalid pending text', async () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.type(
      screen.getByPlaceholderText('Paste a URL (e.g., github.com/username)'),
      '://',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).not.toHaveBeenCalled();
    await screen.findByText('Please enter a valid URL');
  });

  it('does not commit pending text on blur', async () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      'Paste a URL (e.g., github.com/username)',
    );
    await userEvent.type(input, 'github.com/testuser');
    await userEvent.tab();

    expect(
      screen.queryByText('https://github.com/testuser'),
    ).not.toBeInTheDocument();
    expect(input).toHaveValue('github.com/testuser');
  });

  it('toasts once when submitting a duplicate of an existing link', async () => {
    const onSubmit = jest.fn();
    render(
      <TestForm
        onSubmit={onSubmit}
        defaultLinks={[
          { platform: 'github', url: 'https://github.com/testuser' },
        ]}
      />,
    );

    await userEvent.type(
      screen.getByPlaceholderText('Paste a URL (e.g., github.com/username)'),
      'github.com/testuser',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(mockDisplayToast).toHaveBeenCalledTimes(1);
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'This link has already been added',
    );
  });

  it('disables adding links while the saved links are loading', () => {
    render(<TestForm onSubmit={jest.fn()} isLoading />);

    expect(
      screen.getByPlaceholderText('Paste a URL (e.g., github.com/username)'),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('explains why links are missing when they failed to load', () => {
    render(<TestForm onSubmit={jest.fn()} isError />);

    expect(
      screen.getByText(
        'We could not load your links. Refresh the page to try again.',
      ),
    ).toBeVisible();
    expect(
      screen.getByPlaceholderText('Paste a URL (e.g., github.com/username)'),
    ).toBeDisabled();
  });
});
