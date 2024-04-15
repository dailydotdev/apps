import { shuffle } from './func';

describe('shuffle function', () => {
  it('should shuffle the array', () => {
    const array = [1, 2, 3, 4, 5];
    const arrayCopy = [...array];
    shuffle(array);
    expect(array).not.toEqual(arrayCopy);
  });
});
