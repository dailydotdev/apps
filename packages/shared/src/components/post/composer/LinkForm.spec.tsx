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

jest.mock('../write/WriteLinkPreview', () => ({
  WriteLinkPreview: () => null,
}));

jest.mock('../write/WritePreviewSkeleton', () => ({
  WritePreviewSkeleton: () => null,
}));

const renderLinkForm = ({
  initialValue = DEFAULT_LINK,
  onSubmit = jest.fn(),
}: {
  initialValue?: LinkFormState;
  onSubmit?: jest.Mock;
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
        />
        <button type="submit">Post</button>
      </form>
    );
  };

  render(<FormHarness />);

  return { fetchPreview, onSubmit };
};

describe('LinkForm', () => {
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
});
