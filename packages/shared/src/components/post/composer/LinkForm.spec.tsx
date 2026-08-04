import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LinkForm } from './LinkForm';
import { DEFAULT_LINK, TITLE_MAX_LENGTH, type LinkFormState } from './types';

jest.mock('../../../hooks/input', () => ({
  useDebouncedUrl: (
    callback: (value?: string) => void,
    onValidate: (value?: string) => boolean,
  ) => [
    (value?: string) => {
      if (value && onValidate(value)) {
        callback(value);
      }
    },
    jest.fn(),
  ],
}));

const mockWriteLinkPreview = jest.fn();

jest.mock('../write/WriteLinkPreview', () => ({
  WriteLinkPreview: (props: unknown) => {
    mockWriteLinkPreview(props);
    return null;
  },
}));

jest.mock('../write/WritePreviewSkeleton', () => ({
  WritePreviewSkeleton: () => null,
}));

const renderLinkForm = ({
  initialValue = DEFAULT_LINK,
  onSubmit = jest.fn(),
  isUrlLocked = false,
  initialUrl,
  preview,
}: {
  initialValue?: LinkFormState;
  onSubmit?: jest.Mock;
  isUrlLocked?: boolean;
  initialUrl?: string;
  preview?: { url?: string; title?: string };
} = {}) => {
  const fetchPreview = jest.fn();

  const FormHarness = (): React.ReactElement => {
    const [value, setValue] = useState<LinkFormState>(initialValue);

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <LinkForm
          value={value}
          onChange={setValue}
          fetchPreview={fetchPreview}
          isUrlLocked={isUrlLocked}
          initialUrl={initialUrl}
          preview={preview}
        />
        <button type="submit">Post</button>
      </form>
    );
  };

  render(<FormHarness />);

  return { onSubmit, fetchPreview };
};

describe('LinkForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('collapses pasted commentary newlines into spaces', () => {
    renderLinkForm();

    const commentary = screen.getByRole('textbox', {
      name: 'Post commentary',
    });

    fireEvent.change(commentary, {
      target: { value: 'First line\n  second line\r\n\nthird line' },
    });

    expect(commentary).toHaveValue('First line second line third line');
  });

  it('moves focus to commentary instead of submitting when Enter is pressed in the URL field', () => {
    const { onSubmit } = renderLinkForm();

    const urlInput = screen.getByRole('textbox', { name: 'Link URL' });
    const commentary = screen.getByRole('textbox', {
      name: 'Post commentary',
    });

    fireEvent.keyDown(urlInput, { key: 'Enter' });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(commentary).toHaveFocus();
  });

  it('submits when Ctrl+Enter is pressed in the URL field', () => {
    const { onSubmit } = renderLinkForm();

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Link URL' }), {
      key: 'Enter',
      ctrlKey: true,
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits when Ctrl+Enter is pressed in the commentary field', () => {
    const { onSubmit } = renderLinkForm();

    fireEvent.keyDown(
      screen.getByRole('textbox', {
        name: 'Post commentary',
      }),
      {
        key: 'Enter',
        ctrlKey: true,
      },
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('keeps commentary capped to the composer title length', () => {
    renderLinkForm();

    expect(
      screen.getByRole('textbox', {
        name: 'Post commentary',
      }),
    ).toHaveAttribute('maxlength', `${TITLE_MAX_LENGTH}`);
  });

  it('keeps plain Enter in the commentary from adding a line', () => {
    const { onSubmit } = renderLinkForm();

    const commentary = screen.getByRole('textbox', {
      name: 'Post commentary',
    });
    const notPrevented = fireEvent.keyDown(commentary, { key: 'Enter' });

    expect(notPrevented).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe('with a locked URL', () => {
    const lockedProps = {
      isUrlLocked: true,
      initialValue: { url: 'https://daily.dev/posts/shared', commentary: 'hi' },
      initialUrl: 'https://daily.dev/posts/shared',
      preview: { url: 'https://daily.dev/posts/shared', title: 'Shared' },
    };

    it('drops the URL field and the preview remove button', () => {
      renderLinkForm(lockedProps);

      expect(
        screen.queryByRole('textbox', { name: 'Link URL' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Remove link preview' }),
      ).not.toBeInTheDocument();
    });

    it('starts in the commentary, the only field left to edit', () => {
      renderLinkForm(lockedProps);

      expect(
        screen.getByRole('textbox', { name: 'Post commentary' }),
      ).toHaveFocus();
    });

    it('never refetches a preview for a link that cannot change', () => {
      const { fetchPreview } = renderLinkForm(lockedProps);

      expect(fetchPreview).not.toHaveBeenCalled();
    });

    it('shows no preview card when the shared post is gone', () => {
      renderLinkForm({ ...lockedProps, preview: {} });

      expect(mockWriteLinkPreview).not.toHaveBeenCalled();
    });
  });
});
