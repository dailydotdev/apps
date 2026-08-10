import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  laptopQuery,
  mockMatchMedia,
} from '../../../../__tests__/helpers/media';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { AgentProvider, useAgent } from '../AgentContext';
import { AgentWorkspace } from './AgentWorkspace';

jest.mock('../../../hooks/usePersistentContext');

const setViewport = mockMatchMedia;

// The store as it really behaves: what it hands back lags behind the writes.
const stubStore = (initial?: number) => {
  const writes: number[] = [];

  jest.mocked(usePersistentContext).mockImplementation(
    () =>
      [
        initial,
        (async (value: number) => {
          writes.push(value);
        }) as never,
        true,
        false,
      ] as never,
  );

  return writes;
};

type Agent = ReturnType<typeof useAgent>;

const renderWorkspace = () => {
  const agent: { current: Agent } = { current: undefined as never };

  const Probe = () => {
    agent.current = useAgent();

    return null;
  };

  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo initialMessages={[]}>
        <AgentWorkspace
          items={[]}
          postsCount={0}
          onDelete={jest.fn()}
          isDeleting={false}
        />
        <Probe />
      </AgentProvider>
    </TestBootProvider>,
  );

  return { agent };
};

const openPanel = async () => {
  fireEvent.click(screen.getByLabelText('Activity'));

  return screen.findByLabelText('Resize panel');
};

const panelWidth = () =>
  parseFloat(
    (
      screen.getByLabelText('Agent content panel') as HTMLElement
    ).style.width.replace('px', ''),
  );

// jsdom has no PointerEvent, and React's synthetic system keys on the type
// name, so a MouseEvent named `pointerdown` is enough.
const pointer = (type: string, clientX: number) =>
  new MouseEvent(type, { bubbles: true, cancelable: true, clientX });

const drag = (handle: HTMLElement, byX: number) => {
  const startX = 800;

  fireEvent(handle, pointer('pointerdown', startX));

  [0.25, 0.5, 0.75, 1].forEach((step) =>
    fireEvent(window, pointer('pointermove', startX + byX * step)),
  );

  fireEvent(window, pointer('pointerup', startX + byX));
};

beforeEach(() => {
  jest.clearAllMocks();
  setViewport((query) => query === laptopQuery);
  // jsdom lays nothing out, so without this every drag clamps to the minimum.
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1400);
});

afterEach(() => jest.restoreAllMocks());

describe('AgentWorkspace panel resize', () => {
  it('opens at the width the last session left behind', async () => {
    stubStore(700);
    renderWorkspace();
    await openPanel();

    await waitFor(() => expect(panelWidth()).toBe(700));
  });

  it('falls back to a sensible width before the store answers', async () => {
    stubStore(undefined);
    renderWorkspace();
    await openPanel();

    expect(panelWidth()).toBe(480);
  });

  it('widens as the handle is dragged left', async () => {
    stubStore(600);
    renderWorkspace();
    const handle = await openPanel();

    drag(handle, -120);

    expect(panelWidth()).toBe(720);
  });

  it('keeps each drag, one after another, instead of jumping back', async () => {
    const writes = stubStore(600);
    renderWorkspace();
    const handle = await openPanel();

    drag(handle, -100);
    expect(panelWidth()).toBe(700);

    drag(handle, -100);
    expect(panelWidth()).toBe(800);

    drag(handle, 150);
    expect(panelWidth()).toBe(650);

    drag(handle, -50);
    expect(panelWidth()).toBe(700);

    await waitFor(() => expect(writes).toEqual([700, 800, 650, 700]));
  });

  // The stub never updates, so rendering the width off the store fails here.
  it('holds the dragged width even when the store keeps answering stale', async () => {
    const writes = stubStore(600);
    renderWorkspace();
    const handle = await openPanel();

    drag(handle, -140);

    expect(panelWidth()).toBe(740);
    await waitFor(() => expect(writes).toEqual([740]));
    await waitFor(() => expect(panelWidth()).toBe(740));
  });

  it('writes once per drag, not once per pointer move', async () => {
    const writes = stubStore(600);
    renderWorkspace();
    const handle = await openPanel();

    drag(handle, -80);

    await waitFor(() => expect(writes).toHaveLength(1));
  });

  it('will not let either column be squeezed out of existence', async () => {
    stubStore(600);
    renderWorkspace();
    const handle = await openPanel();

    drag(handle, 4000);
    expect(panelWidth()).toBe(384);

    drag(handle, -4000);
    // The workspace is 1400 wide and the conversation keeps its own minimum.
    expect(panelWidth()).toBe(1016);
  });

  it('rounds to whole pixels, so the panel border never straddles two', async () => {
    stubStore(600);
    renderWorkspace();
    const handle = await openPanel();

    fireEvent(handle, pointer('pointerdown', 800));
    fireEvent(window, pointer('pointermove', 799.4));
    fireEvent(window, pointer('pointerup', 799.4));

    expect(Number.isInteger(panelWidth())).toBe(true);
  });

  it('stops listening once the pointer is up, so a stray move cannot resize it', async () => {
    stubStore(600);
    renderWorkspace();
    const handle = await openPanel();

    drag(handle, -100);
    fireEvent(window, pointer('pointermove', 200));

    expect(panelWidth()).toBe(700);
  });
});

describe('AgentWorkspace transcript', () => {
  const transcript = () =>
    document.querySelector('.agent-scroll') as HTMLElement;

  const scrollTo = (fromBottom: number) => {
    const element = transcript();

    Object.defineProperty(element, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(element, 'clientHeight', {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(element, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 2000 - 500 - fromBottom,
    });
    element.scrollTo = jest.fn();

    fireEvent.scroll(element);
  };

  const send = (agent: { current: Agent }) =>
    act(() => agent.current.runCommand({ text: 'raise the bar' }));

  it('offers no scroll-to-latest while the reader is already at the tail', () => {
    stubStore(600);
    const { agent } = renderWorkspace();
    scrollTo(0);
    send(agent);

    expect(screen.queryByLabelText('Scroll to latest')).not.toBeInTheDocument();
  });

  it('goes down to the tail when the reader sends from up the page', async () => {
    stubStore(600);
    const { agent } = renderWorkspace();
    scrollTo(600);

    expect(screen.getByLabelText('Scroll to latest')).toBeInTheDocument();

    send(agent);

    expect(screen.queryByLabelText('Scroll to latest')).not.toBeInTheDocument();
    // The appended row is not laid out on that commit, so the follow waits a
    // frame for `scrollHeight`.
    await waitFor(() => expect(transcript().scrollTop).toBe(2000));
  });

  it('announces a reply that lands while the reader is up the page', () => {
    jest.useFakeTimers();
    stubStore(600);
    const { agent } = renderWorkspace();
    send(agent);
    scrollTo(600);

    expect(screen.queryByText('New reply')).not.toBeInTheDocument();

    act(() => jest.runOnlyPendingTimers());

    expect(screen.getByText('New reply')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('takes the reader back down when they ask', () => {
    jest.useFakeTimers();
    stubStore(600);
    const { agent } = renderWorkspace();
    send(agent);
    scrollTo(600);
    act(() => jest.runOnlyPendingTimers());

    fireEvent.click(screen.getByLabelText('Scroll to latest'));

    expect(transcript().scrollTo).toHaveBeenCalledWith({
      top: 2000,
      behavior: 'smooth',
    });
    expect(screen.queryByText('New reply')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('drops the announcement once the reader scrolls back down themselves', () => {
    jest.useFakeTimers();
    stubStore(600);
    const { agent } = renderWorkspace();
    send(agent);
    scrollTo(600);
    act(() => jest.runOnlyPendingTimers());
    scrollTo(0);

    expect(screen.queryByLabelText('Scroll to latest')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});

describe('AgentWorkspace panel on a phone', () => {
  beforeEach(() => setViewport(() => false));

  it('has no resize handle to offer and no inline width', async () => {
    stubStore(600);
    renderWorkspace();
    fireEvent.click(screen.getByLabelText('Activity'));

    const panel = await screen.findByLabelText('Agent content panel');

    expect(panel).not.toHaveAttribute(
      'style',
      expect.stringContaining('width'),
    );
  });
});
