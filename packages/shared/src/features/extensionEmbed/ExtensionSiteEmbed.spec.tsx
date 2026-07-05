import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ExtensionSiteEmbed } from './ExtensionSiteEmbed';
import { useExtensionSiteEmbed } from './useExtensionSiteEmbed';

jest.mock('./useExtensionSiteEmbed');

const mockUseExtensionSiteEmbed = useExtensionSiteEmbed as jest.MockedFunction<
  typeof useExtensionSiteEmbed
>;

const defaultEmbedState = (): ReturnType<typeof useExtensionSiteEmbed> => ({
  permissionFrameRef: { current: null },
  targetFrameRef: { current: null },
  permissionFrameKey: 'permission-frame',
  permissionFrameSrc: '',
  showPermissionFrame: false,
  targetFrameKey: 'target-frame',
  targetFrameSrc: 'https://example.com/article',
  showTargetFrame: true,
  status: 'ready',
  error: null,
  errorReason: null,
  isTargetValid: true,
  isTargetDomReady: false,
  reset: jest.fn(),
});

describe('ExtensionSiteEmbed', () => {
  beforeEach(() => {
    mockUseExtensionSiteEmbed.mockReturnValue(defaultEmbedState());
  });

  it('keeps the embedded target canvas transparent until DOM ready', () => {
    render(<ExtensionSiteEmbed targetUrl="https://example.com/article" />);

    const targetFrame = screen.getByTitle('Embedded site');
    const frameContainer = targetFrame.parentElement as HTMLElement;
    expect(targetFrame).not.toHaveClass('bg-white');
    expect(frameContainer).toHaveStyle('background-color: transparent');
    expect(targetFrame).toHaveStyle('color-scheme: normal');
  });

  it('renders ready embedded target pages on the browser canvas without inheriting the host color scheme', () => {
    render(
      <ExtensionSiteEmbed
        targetUrl="https://example.com/article"
        isTargetLoaded
      />,
    );

    const targetFrame = screen.getByTitle('Embedded site');
    const frameContainer = targetFrame.parentElement as HTMLElement;
    expect(targetFrame).not.toHaveClass('bg-white');
    expect(frameContainer).toHaveStyle('background-color: Canvas');
    expect(frameContainer).toHaveStyle('color-scheme: normal');
    expect(targetFrame).toHaveStyle('color-scheme: normal');
  });

  it('notifies when the target frame reports DOM ready', () => {
    const onTargetDomReady = jest.fn();
    mockUseExtensionSiteEmbed.mockReturnValue({
      ...defaultEmbedState(),
      isTargetDomReady: true,
    });

    render(
      <ExtensionSiteEmbed
        targetUrl="https://example.com/article"
        onTargetDomReady={onTargetDomReady}
      />,
    );

    expect(onTargetDomReady).toHaveBeenCalledTimes(1);
  });

  it('uses the native iframe load event as a fallback UI signal', () => {
    const onTargetFrameLoad = jest.fn();
    render(
      <ExtensionSiteEmbed
        targetUrl="https://example.com/article"
        onTargetFrameLoad={onTargetFrameLoad}
      />,
    );

    const targetFrame = screen.getByTitle('Embedded site');
    const frameContainer = targetFrame.parentElement as HTMLElement;
    expect(frameContainer).toHaveStyle('background-color: transparent');

    fireEvent.load(targetFrame);

    expect(onTargetFrameLoad).toHaveBeenCalledTimes(1);
  });
});
