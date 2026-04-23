import React from 'react';
import { act, render, screen } from '@testing-library/react';
import {
  matchesBlockedHost,
  normalizeHost,
  useFocusBlocklist,
} from './focusBlocklist.store';

const Probe = (): JSX.Element => {
  const { blocklist, addHost, removeHost, setEnabled } = useFocusBlocklist();
  return (
    <div>
      <span data-testid="enabled">{String(blocklist.enabled)}</span>
      <span data-testid="hosts">{blocklist.hosts.join(',')}</span>
      <button type="button" onClick={() => addHost('https://twitter.com/home')}>
        add-twitter
      </button>
      <button type="button" onClick={() => addHost('www.reddit.com')}>
        add-reddit
      </button>
      <button type="button" onClick={() => addHost('   ')}>
        add-blank
      </button>
      <button type="button" onClick={() => removeHost('twitter.com')}>
        remove-twitter
      </button>
      <button type="button" onClick={() => setEnabled(true)}>
        enable
      </button>
    </div>
  );
};

describe('focusBlocklist.store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('normalizeHost', () => {
    it('strips protocols, paths, and www.', () => {
      expect(normalizeHost('https://www.twitter.com/home')).toBe('twitter.com');
      expect(normalizeHost('reddit.com')).toBe('reddit.com');
    });

    it('rejects empty or malformed input', () => {
      expect(normalizeHost('')).toBeNull();
      expect(normalizeHost('   ')).toBeNull();
      expect(normalizeHost('://nope')).toBeNull();
    });
  });

  describe('matchesBlockedHost', () => {
    it('matches exact host and any subdomain', () => {
      expect(matchesBlockedHost('twitter.com', ['twitter.com'])).toBe(true);
      expect(matchesBlockedHost('m.twitter.com', ['twitter.com'])).toBe(true);
      expect(matchesBlockedHost('twitter.com.evil', ['twitter.com'])).toBe(
        false,
      );
    });
  });

  it('starts disabled with no hosts', () => {
    render(<Probe />);
    expect(screen.getByTestId('enabled')).toHaveTextContent('false');
    expect(screen.getByTestId('hosts')).toHaveTextContent('');
  });

  it('adds, deduplicates, and removes hosts', () => {
    render(<Probe />);
    act(() => {
      screen.getByText('add-twitter').click();
      screen.getByText('add-twitter').click();
      screen.getByText('add-reddit').click();
      screen.getByText('add-blank').click();
    });
    expect(screen.getByTestId('hosts')).toHaveTextContent(
      'twitter.com,reddit.com',
    );

    act(() => {
      screen.getByText('remove-twitter').click();
    });
    expect(screen.getByTestId('hosts')).toHaveTextContent('reddit.com');
  });

  it('can toggle enabled', () => {
    render(<Probe />);
    act(() => {
      screen.getByText('enable').click();
    });
    expect(screen.getByTestId('enabled')).toHaveTextContent('true');
  });
});
