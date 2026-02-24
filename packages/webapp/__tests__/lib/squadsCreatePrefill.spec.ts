import { WriteFormTab } from '@dailydotdev/shared/src/components/fields/form/common';
import {
  MAX_CREATE_POST_BODY_LENGTH,
  MAX_CREATE_POST_TITLE_LENGTH,
  getSquadsCreatePrefillState,
} from '../../lib/squadsCreatePrefill';

describe('getSquadsCreatePrefillState', () => {
  it('should default to share tab when link is provided', () => {
    const result = getSquadsCreatePrefillState({
      link: 'https://daily.dev',
      body: 'Read this',
    });

    expect(result.initialDisplay).toBe(WriteFormTab.Share);
    expect(result.initialShareUrl).toBe('https://daily.dev');
    expect(result.initialShareCommentary).toBe('Read this');
    expect(result.initialDraft).toEqual({});
  });

  it('should prefill new post draft when title/body are provided without link', () => {
    const result = getSquadsCreatePrefillState({
      title: 'Post title',
      body: 'Post body',
    });

    expect(result.initialDisplay).toBeNull();
    expect(result.initialDraft).toEqual({
      title: 'Post title',
      content: 'Post body',
    });
  });

  it('should not override non-empty draft fields', () => {
    const result = getSquadsCreatePrefillState(
      { title: 'query title', body: 'query body' },
      { title: 'draft title', content: 'draft content' },
    );

    expect(result.initialDraft).toEqual({});
  });

  it('should keep poll tab precedence over share prefill', () => {
    const result = getSquadsCreatePrefillState({
      poll: 'true',
      share: 'true',
      link: 'https://daily.dev',
    });

    expect(result.initialDisplay).toBe(WriteFormTab.Poll);
  });

  it('should fallback to title when body is missing for share commentary', () => {
    const result = getSquadsCreatePrefillState({
      link: 'https://daily.dev',
      title: 'Fallback title',
    });

    expect(result.initialShareCommentary).toBe('Fallback title');
  });

  it('should trim values and enforce max lengths', () => {
    const tooLongTitle = `  ${'t'.repeat(MAX_CREATE_POST_TITLE_LENGTH + 10)}  `;
    const tooLongBody = `  ${'b'.repeat(MAX_CREATE_POST_BODY_LENGTH + 50)}  `;

    const result = getSquadsCreatePrefillState({
      title: tooLongTitle,
      body: tooLongBody,
    });

    expect(result.initialDraft.title).toHaveLength(
      MAX_CREATE_POST_TITLE_LENGTH,
    );
    expect(result.initialDraft.content).toHaveLength(
      MAX_CREATE_POST_BODY_LENGTH,
    );
  });

  it('should ignore invalid links', () => {
    const result = getSquadsCreatePrefillState({
      link: 'notaurl',
      share: 'true',
      title: 'Title only',
    });

    expect(result.initialShareUrl).toBeUndefined();
    expect(result.initialDisplay).toBe(WriteFormTab.Share);
  });
});
