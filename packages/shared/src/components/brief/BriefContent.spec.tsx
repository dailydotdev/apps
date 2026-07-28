import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BriefContent } from './BriefContent';
import type { Post } from '../../graphql/posts';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ToastType } from '../../hooks/useToastNotification';

const mockDisplayToast = jest.fn();
const mockLogEvent = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  // Keep the real module's exports — the component imports `ToastType` from
  // here too, and a bare factory would leave it undefined.
  ...jest.requireActual('../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

// The real Markdown component sanitizes asynchronously and pulls in hover cards
// and the image lightbox; none of that is what these tests are about.
jest.mock('../Markdown', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: ({ content }: { content: string }) => (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={{ __html: content }} />
  ),
}));

const post = {
  id: 'brief-1',
  title: 'Presidential briefing',
  commentsPermalink: 'https://app.daily.dev/posts/brief-1',
} as Post;

const contentHtml = `
<h2>The npm supply chain took another hit</h2>
<p>Three packages shipped a malicious post-install script.</p>
<ul>
  <li>What happened: a maintainer account was taken over.</li>
  <li>What to do: rotate your CI credentials.</li>
</ul>
<h2>Rust 1.90 lands async closures</h2>
<p>The feature has been in nightly for two years.</p>
`;

const renderComponent = (showItemActions = true, html = contentHtml) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BriefContent
        post={post}
        origin={Origin.ArticlePage}
        contentHtml={html}
        showItemActions={showItemActions}
      />
    </QueryClientProvider>,
  );

// Locate a control by the element it belongs to rather than by index — the DOM
// order of headings, paragraphs and bullets interleaves.
const controlIn = (selector: string, contains: string): HTMLElement => {
  const host = Array.from(
    document.querySelectorAll<HTMLElement>(selector),
  ).find((element) => element.textContent?.includes(contains));

  if (!host) {
    throw new Error(`no ${selector} containing "${contains}"`);
  }

  return host.querySelector('button') as HTMLElement;
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

it('renders a copy control on every heading, bullet and paragraph', async () => {
  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy section')).toHaveLength(2),
  );
  // 2 bullets + 2 paragraphs.
  expect(screen.getAllByLabelText('Copy item')).toHaveLength(4);
});

it('copies a single bullet with the briefing link appended', async () => {
  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy item')).toHaveLength(4),
  );
  fireEvent.click(controlIn('li', 'What happened'));

  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith(
      `What happened: a maintainer account was taken over.\n\n${post.commentsPermalink}`,
    ),
  );
  expect(mockDisplayToast).toHaveBeenCalledWith(
    'Copied to clipboard',
    expect.objectContaining({ variant: ToastType.Success }),
  );
});

it('copies a standalone paragraph', async () => {
  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy item')).toHaveLength(4),
  );
  fireEvent.click(controlIn('p', 'Three packages'));

  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith(
      `Three packages shipped a malicious post-install script.\n\n${post.commentsPermalink}`,
    ),
  );
});

it('copies a section as its heading, prose and bullets, one bullet per line', async () => {
  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy section')).toHaveLength(2),
  );
  fireEvent.click(controlIn('h2', 'npm supply chain'));

  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith(
      [
        'The npm supply chain took another hit',
        '',
        'Three packages shipped a malicious post-install script.',
        '',
        '- What happened: a maintainer account was taken over.',
        '- What to do: rotate your CI credentials.',
        '',
        post.commentsPermalink,
      ].join('\n'),
    ),
  );
});

it('stops a section at the next heading', async () => {
  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy section')).toHaveLength(2),
  );
  fireEvent.click(controlIn('h2', 'Rust 1.90'));

  await waitFor(() => expect(writeText).toHaveBeenCalled());
  expect(writeText.mock.calls[0][0]).not.toContain('npm supply chain');
});

// The body is model-generated markdown: heading level and whether a section
// uses bullets or prose vary between briefings. Matching only h2/h3/li left
// briefs like this one with no controls at all.
it('attaches to other heading levels and to prose-only sections', async () => {
  renderComponent(
    true,
    `<h1>Top level</h1><p>Lead paragraph.</p><h4>Deep heading</h4><p>More prose.</p>`,
  );

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy section')).toHaveLength(2),
  );
  expect(screen.getAllByLabelText('Copy item')).toHaveLength(2);
});

it('does not double up on a paragraph nested inside a list item', async () => {
  renderComponent(true, `<ul><li><p>Wrapped bullet text.</p></li></ul>`);

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy item')).toHaveLength(1),
  );
});

it('logs the copy with a content discriminator per item kind', async () => {
  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy item')).toHaveLength(4),
  );
  fireEvent.click(controlIn('li', 'What happened'));

  expect(mockLogEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.SharePost,
      extra: expect.stringContaining(ShareProvider.CopyText),
    }),
  );
  expect(mockLogEvent.mock.calls[0][0].extra).toContain('brief_bullet');
});

it('confirms with a success checkmark on the control that was clicked', async () => {
  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByLabelText('Copy item')).toHaveLength(4),
  );
  const first = controlIn('li', 'What happened');
  const second = controlIn('li', 'What to do');
  fireEvent.click(first);

  // Only the clicked control confirms — the shared `useCopy` flag would have
  // lit every control on the page at once.
  await waitFor(() =>
    expect(first.querySelector('.text-status-success')).toBeInTheDocument(),
  );
  expect(second.querySelector('.text-status-success')).not.toBeInTheDocument();
});

it('clears the checkmark after the confirmation window', async () => {
  jest.useFakeTimers();

  try {
    renderComponent();

    await waitFor(() =>
      expect(screen.getAllByLabelText('Copy item')).toHaveLength(4),
    );
    const first = controlIn('li', 'What happened');

    act(() => {
      fireEvent.click(first);
    });
    expect(first.querySelector('.text-status-success')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(first.querySelector('.text-status-success')).not.toBeInTheDocument();
  } finally {
    jest.useRealTimers();
  }
});

it('renders no controls at all with the gate off', async () => {
  renderComponent(false);

  await waitFor(() =>
    expect(screen.getByText('Rust 1.90 lands async closures')).toBeVisible(),
  );
  expect(screen.queryByLabelText('Copy item')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Copy section')).not.toBeInTheDocument();
});
