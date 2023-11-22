import { renderHook } from '@testing-library/react-hooks';
import { useViewSize } from './index';

it('return isMobile value', async () => {
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes('655'),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });

  const { result } = renderHook(() => useViewSize());
  expect(result.current).toEqual({
    isMobile: true,
    isTablet: false,
    isLaptop: false,
    isLaptopL: false,
  });
});

it('return isTablet value', async () => {
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes('656'),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });

  const { result } = renderHook(() => useViewSize());
  expect(result.current).toEqual({
    isMobile: false,
    isTablet: true,
    isLaptop: false,
    isLaptopL: false,
  });
});

it('return isLaptop value', async () => {
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes('1020'),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });

  const { result } = renderHook(() => useViewSize());
  expect(result.current).toEqual({
    isMobile: true, // True becuase the matching happens negative for mobile
    isTablet: false,
    isLaptop: true,
    isLaptopL: false,
  });
});

it('return isLaptopL value', async () => {
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes('1360'),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });

  const { result } = renderHook(() => useViewSize());
  expect(result.current).toEqual({
    isMobile: true, // True becuase the matching happens negative for mobile
    isTablet: false,
    isLaptop: false,
    isLaptopL: true,
  });
});
