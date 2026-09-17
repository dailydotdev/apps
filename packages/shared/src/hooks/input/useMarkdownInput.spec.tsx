import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { MutableRefObject, ReactNode } from 'react';
import React from 'react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { UseMarkdownInputProps } from './useMarkdownInput';
import { MarkdownCommand, useMarkdownInput } from './useMarkdownInput';

const gifUrl = 'https://media.klipy.com/example.gif';

const createWrapper = () => {
  const client = new QueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestBootProvider client={client}>{children}</TestBootProvider>;
  };
};

const renderMarkdownInputHook = (
  value: string,
  enabledCommand: UseMarkdownInputProps['enabledCommand'] = {
    [MarkdownCommand.Gif]: true,
  },
) => {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.selectionStart = value.length;
  textarea.selectionEnd = value.length;
  document.body.appendChild(textarea);

  const textareaRef = {
    current: textarea,
  } as MutableRefObject<HTMLTextAreaElement>;

  const view = renderHook(
    () =>
      useMarkdownInput({
        textareaRef,
        initialContent: value,
        enabledCommand,
      }),
    { wrapper: createWrapper() },
  );

  return { ...view, textarea };
};

describe('useMarkdownInput', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a GIF command only when GIFs are enabled', () => {
    const view = renderMarkdownInputHook('', {});
    expect(view.result.current.onGifCommand).toBeUndefined();
    view.unmount();

    const utils = renderMarkdownInputHook('', {
      [MarkdownCommand.Gif]: true,
    });
    expect(utils.result.current.onGifCommand).toBeDefined();
  });

  it('inserts a GIF without a leading spacer at the start of the textarea', async () => {
    const { result } = renderMarkdownInputHook('');

    await act(async () => {
      await result.current.onGifCommand?.(gifUrl, 'GIF');
    });

    expect(result.current.input).toBe(`![GIF](${gifUrl})\n\n`);
  });

  it('prefixes a GIF with a spacer when the cursor follows content', async () => {
    const { result } = renderMarkdownInputHook('About me ');

    await act(async () => {
      await result.current.onGifCommand?.(gifUrl, 'GIF');
    });

    expect(result.current.input).toBe(`About me \n\n![GIF](${gifUrl})\n\n`);
  });
});
