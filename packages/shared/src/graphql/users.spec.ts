import { TOP_READER_BADGE, TOP_READER_BADGE_BY_ID } from './users';

describe('top reader badge queries', () => {
  it('includes the badge owner in the list query', () => {
    expect(TOP_READER_BADGE).toContain(
      'topReaderBadge(limit: $limit, userId: $userId)',
    );
    expect(TOP_READER_BADGE).toContain('user {');
    expect(TOP_READER_BADGE).toContain('name');
    expect(TOP_READER_BADGE).toContain('username');
    expect(TOP_READER_BADGE).toContain('image');
  });

  it('includes the badge owner in the by-id query', () => {
    expect(TOP_READER_BADGE_BY_ID).toContain('topReaderBadgeById(id: $id)');
    expect(TOP_READER_BADGE_BY_ID).toContain('user {');
    expect(TOP_READER_BADGE_BY_ID).toContain('name');
    expect(TOP_READER_BADGE_BY_ID).toContain('username');
    expect(TOP_READER_BADGE_BY_ID).toContain('image');
  });
});
