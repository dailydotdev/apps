import type { MenuItemProps } from '../../components/dropdown/common';
import { groupPostOptions } from './postOptionGroups';

const option = (id: string): MenuItemProps => ({ id, label: id });

describe('groupPostOptions', () => {
  it('puts the five first-level rows in their order and the rest behind Not interested and More', () => {
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
      'later',
      'follow-source',
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
      'follow-author',
    ]);
  });

  it('keeps an option without an id in More', () => {
    const groups = groupPostOptions([
      { label: 'Something new' },
      option('share'),
    ]);

    expect(groups.more.map((o) => o.label)).toEqual(['Something new']);
  });
});
