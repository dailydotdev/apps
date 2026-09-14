import { preventFocusSteal } from './preventFocusSteal';

const originalFocus = HTMLElement.prototype.focus;

describe('preventFocusSteal', () => {
  let input: HTMLInputElement;
  let hasFocus: jest.SpyInstance<boolean, []>;
  let warn: jest.SpyInstance;

  beforeAll(() => {
    preventFocusSteal();
  });

  afterAll(() => {
    HTMLElement.prototype.focus = originalFocus;
  });

  beforeEach(() => {
    input = document.createElement('input');
    document.body.appendChild(input);
    hasFocus = jest.spyOn(document, 'hasFocus');
    // The guard warns outside production; the blocked cases expect it.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    input.remove();
    hasFocus.mockRestore();
    warn.mockRestore();
  });

  it('focuses normally while the page holds the keyboard', () => {
    hasFocus.mockReturnValue(true);

    input.focus();

    expect(input).toHaveFocus();
  });

  it('drops focus() while the keyboard belongs to browser chrome', () => {
    hasFocus.mockReturnValue(false);

    input.focus();

    expect(input).not.toHaveFocus();
  });

  it('stays a single layer when installed more than once', () => {
    preventFocusSteal();
    hasFocus.mockReturnValue(false);

    input.focus();
    expect(input).not.toHaveFocus();

    hasFocus.mockReturnValue(true);

    input.focus();
    expect(input).toHaveFocus();
  });
});
