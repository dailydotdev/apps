/**
 * jsdom has no object URLs, which every image preview needs. Stubs them for
 * each test in the calling scope and puts jsdom's back once it is done.
 */
export const mockObjectUrls = (url = 'blob:snapshot'): void => {
  const { createObjectURL, revokeObjectURL } = URL;

  beforeEach(() => {
    URL.createObjectURL = jest.fn().mockReturnValue(url);
    URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });
};
