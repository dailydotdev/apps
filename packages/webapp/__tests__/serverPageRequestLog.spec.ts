/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { logServerPageRequest } from '../lib/serverPageRequestLog';

const fetchMock = jest.fn();

const getLoggedEventPage = async (path: string): Promise<string> => {
  await logServerPageRequest(
    new NextRequest(`https://app.daily.dev${path}`),
    'html',
  );
  const [event] = JSON.parse(fetchMock.mock.calls[0][1].body).events;

  return event.event_page;
};

describe('logServerPageRequest', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.daily.dev';
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
  });

  it.each([
    ['/reset-password?token=secret', '/reset-password?token=%5Bredacted%5D'],
    [
      '/callback?code=secret&state=secret',
      '/callback?code=%5Bredacted%5D&state=%5Bredacted%5D',
    ],
    [
      '/oauth/consent?sig=secret&state=secret&client_id=app',
      '/oauth/consent?sig=%5Bredacted%5D&state=%5Bredacted%5D&client_id=app',
    ],
    [
      '/posts/abc?jt=secret&utm_source=email',
      '/posts/abc?jt=%5Bredacted%5D&utm_source=email',
    ],
  ])('should redact sensitive query params in %s', async (path, expected) => {
    expect(await getLoggedEventPage(path)).toBe(expected);
  });

  it('should keep non-sensitive query params', async () => {
    expect(await getLoggedEventPage('/posts/abc?utm_source=x')).toBe(
      '/posts/abc?utm_source=x',
    );
  });

  it('should log the pathname alone when there is no query', async () => {
    expect(await getLoggedEventPage('/posts/abc')).toBe('/posts/abc');
  });
});
