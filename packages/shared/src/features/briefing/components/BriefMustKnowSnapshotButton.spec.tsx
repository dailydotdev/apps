import React, { useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { BriefMustKnowSnapshotButton } from './BriefMustKnowSnapshotButton';
import type { Post } from '../../../graphql/posts';
import { captureShareImage } from '../../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../../lib/imageShare/copyShareImage';
import { LogEvent, Origin } from '../../../lib/log';
import { ShareProvider } from '../../../lib/share';
import { briefContentHtmlWithoutMustKnow } from '../../../../__tests__/fixture/brief';

jest.mock('../../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: jest.fn(),
}));
jest.mock('../../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: jest.fn(),
}));

const NAME = 'Snapshot: Must know';

const BODY = `
  <h2>Must know</h2>
  <ul>
    <li><strong>Agents are eating dev tools</strong>: The shift is accelerating.</li>
    <li><strong>Postgres keeps eating specialists</strong>: One engine, every workload.</li>
  </ul>
  <h2>Worth a look</h2>
  <p>A paragraph under the second heading.</p>
`;

const post = {
  id: 'brief-1',
  title: 'Presidential briefing',
  commentsPermalink: 'https://app.daily.dev/posts/brief-1',
} as Post;

const logEvent = jest.fn();

const Harness = ({ html }: { html: string }) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div ref={bodyRef} dangerouslySetInnerHTML={{ __html: html }} />
      <BriefMustKnowSnapshotButton containerRef={bodyRef} post={post} />
    </>
  );
};

const renderComponent = (html: string) => {
  const client = new QueryClient();
  const withProviders = (body: string) => (
    <TestBootProvider client={client} log={{ logEvent }}>
      <Harness html={body} />
    </TestBootProvider>
  );
  const { rerender } = render(withProviders(html));

  return { setBody: (next: string) => rerender(withProviders(next)) };
};

beforeEach(() => {
  jest.clearAllMocks();
  (captureShareImage as jest.Mock).mockResolvedValue(new Blob());
  (copyShareImage as jest.Mock).mockResolvedValue(true);
});

describe('BriefMustKnowSnapshotButton', () => {
  it('finds the heading when the body renders after it mounts', async () => {
    // Markdown sanitizes the body a render late, so the section is not there
    // yet when this component's effect first runs.
    const { setBody } = renderComponent('');

    expect(
      screen.queryByRole('button', { name: NAME }),
    ).not.toBeInTheDocument();

    setBody(BODY);

    const button = await screen.findByRole('button', { name: NAME });
    expect(button.closest('h2')).toHaveTextContent('Must know');
  });

  it('stays away from a brief without the section', () => {
    renderComponent(briefContentHtmlWithoutMustKnow);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    // Nothing is left behind on the headings that are there.
    expect(
      document.querySelector('[data-brief-section-snapshot]'),
    ).not.toBeInTheDocument();
  });

  it('mounts the card only once the button is reached for', async () => {
    renderComponent(BODY);

    const button = await screen.findByRole('button', { name: NAME });
    expect(screen.getAllByText('Agents are eating dev tools')).toHaveLength(1);

    fireEvent.pointerEnter(button);

    // The claims, without the evidence behind them or the other section.
    expect(screen.getAllByText('Agents are eating dev tools')).toHaveLength(2);
    expect(
      screen.getAllByText('Postgres keeps eating specialists'),
    ).toHaveLength(2);
    expect(screen.queryAllByText('The shift is accelerating.')).toHaveLength(0);
    expect(
      screen.getAllByText('A paragraph under the second heading.'),
    ).toHaveLength(1);
  });

  it('logs the snapshot under the Must know origin', async () => {
    renderComponent(BODY);

    const button = await screen.findByRole('button', { name: NAME });
    fireEvent.pointerEnter(button);
    fireEvent.click(button);

    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.SharePost }),
      ),
    );
    const [event] = logEvent.mock.calls
      .map(([call]) => call)
      .filter((call) => call.event_name === LogEvent.SharePost);

    expect(JSON.parse(event.extra)).toEqual(
      expect.objectContaining({
        provider: ShareProvider.Snapshot,
        origin: Origin.BriefMustKnow,
        result: 'clipboard',
      }),
    );
  });
});
