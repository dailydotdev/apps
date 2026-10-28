import { getBrandingErrorMessage } from './useSquadBranding';
import { labels } from '../../../lib/labels';

describe('getBrandingErrorMessage', () => {
  it('names the field the API rejected', () => {
    const error = {
      response: {
        errors: [
          {
            message: 'Zod validation error',
            extensions: {
              code: 'ZOD_VALIDATION_ERROR',
              issues: [{ path: ['button', 'label'], message: 'Too long' }],
            },
          },
        ],
      },
    };

    expect(getBrandingErrorMessage(error)).toBe('Button label: Too long');
  });

  it('passes other API messages through', () => {
    const error = {
      response: {
        errors: [
          {
            message: 'This feature is not enabled for the Squad',
            extensions: { code: 'FORBIDDEN' },
          },
        ],
      },
    };

    expect(getBrandingErrorMessage(error)).toBe(
      'This feature is not enabled for the Squad',
    );
  });

  it('falls back to the generic error', () => {
    expect(getBrandingErrorMessage(new Error('offline'))).toBe(
      labels.error.generic,
    );
  });
});
