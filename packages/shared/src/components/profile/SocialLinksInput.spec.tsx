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

const TestForm = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      socialLinks: [],
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
        <SocialLinksInput ref={socialLinksRef} name="socialLinks" />
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

  it('commits pending text on blur', async () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      'Paste a URL (e.g., github.com/username)',
    );
    await userEvent.type(input, 'github.com/testuser');
    await userEvent.tab();

    await screen.findByText('https://github.com/testuser');
  });
});
