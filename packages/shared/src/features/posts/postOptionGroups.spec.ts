import type { MenuItemProps } from '../../components/dropdown/common';
import { groupPostOptions } from './postOptionGroups';

const option = (id: string): MenuItemProps => ({ id, label: id });

describe('groupPostOptions', () => {
  it('puts the first-level rows in their order and, on a post you own, Hide behind Not interested', () => {
    const groups = groupPostOptions(
      [
        'analytics',
        'hide',
        'report',
        'boost',
        'downvote',
        'later',
        'translate',
        'follow-source',
        'notify-source',
        'follow-author',
        'block-source',
        'block-author',
        'content-type',
        'block-tag',
        'edit',
        'delete',
        'pin',
        'share',
      ].map(option),
    );

    expect(groups.primary.map((o) => o.id)).toEqual([
      'share',
      'follow-source',
      'follow-author',
      'later',
      'report',
    ]);
    expect(groups.notInterested.map((o) => o.id)).toEqual([
      'hide',
      'block-source',
      'block-author',
      'content-type',
      'block-tag',
    ]);
    expect(groups.owner.map((o) => o.id)).toEqual([
      'edit',
      'delete',
      'analytics',
      'boost',
      'pin',
    ]);
    expect(groups.more.map((o) => o.id)).toEqual([
      'downvote',
      'translate',
      'notify-source',
    ]);
  });

  it('puts Hide on the first level of a post you do not own', () => {
    const groups = groupPostOptions(
      ['hide', 'report', 'block-source', 'later', 'share'].map(option),
    );

    expect(groups.primary.map((o) => o.id)).toEqual([
      'share',
      'later',
      'hide',
      'report',
    ]);
    expect(groups.notInterested.map((o) => o.id)).toEqual(['block-source']);
  });

  it('keeps an option without an id in More', () => {
    const groups = groupPostOptions([
      { label: 'Something new' },
      option('share'),
    ]);

    expect(groups.more.map((o) => o.label)).toEqual(['Something new']);
  });
});
