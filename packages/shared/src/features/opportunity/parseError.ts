const PARSE_OPPORTUNITY_ERROR_KEY = 'parse_opportunity_error';

export const setParseOpportunityError = (message: string): void => {
  try {
    sessionStorage.setItem(PARSE_OPPORTUNITY_ERROR_KEY, message);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to set parse opportunity error', e);
  }
};

export const consumeParseOpportunityError = (): string => {
  try {
    const message = sessionStorage.getItem(PARSE_OPPORTUNITY_ERROR_KEY);
    sessionStorage.removeItem(PARSE_OPPORTUNITY_ERROR_KEY);
    return message || '';
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to consume parse opportunity error', e);
    return '';
  }
};
