import { formatReadTime } from './common';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('function formatReadTime', () => {
  it('should return 1h 30m when passed 90', () => {
    expect(formatReadTime(90)).toEqual('1h 30m');
  });
  it('should return 2h 3m when passed 123', () => {
    expect(formatReadTime(123)).toEqual('2h 3m');
  });
  it('should return 1h 0m when passed 60', () => {
    expect(formatReadTime(60)).toEqual('1h 0m');
  });
  it('should return 30m when passed 30', () => {
    expect(formatReadTime(30)).toEqual('30m');
  });
  it('should not return 0h 30m when passed 30', () => {
    expect(formatReadTime(30)).not.toContain('0h ');
    expect(formatReadTime(30)).toEqual('30m');
  });
});
