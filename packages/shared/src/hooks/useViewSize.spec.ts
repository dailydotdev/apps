import { renderHook } from '@testing-library/react-hooks';
import { useViewSize, ViewSize } from './index';

const matchMedia = (value: string) => {
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes(value),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
};

it('return isMobileM value', async () => {
  // Negative eval, so should not work on 420 exactly
  matchMedia('420');
  const { result } = renderHook(() => useViewSize(ViewSize.MobileM));
  expect(result.current).toEqual(false);
});

it('return isMobileL value', async () => {
  // Negative eval, so should not work on 420 exactly
  matchMedia('656');
  const { result } = renderHook(() => useViewSize(ViewSize.MobileL));
  expect(result.current).toEqual(false);
});

it('return tablet value', async () => {
  matchMedia('656');
  const { result } = renderHook(() => useViewSize(ViewSize.Tablet));
  expect(result.current).toEqual(true);
});

it('return laptop value', async () => {
  matchMedia('1020');
  const { result } = renderHook(() => useViewSize(ViewSize.Laptop));
  expect(result.current).toEqual(true);
});

it('return laptopL value', async () => {
  matchMedia('1360');
  const { result } = renderHook(() => useViewSize(ViewSize.LaptopL));
  expect(result.current).toEqual(true);
});

it('return laptopXL value', async () => {
  matchMedia('1668');
  const { result } = renderHook(() => useViewSize(ViewSize.LaptopXL));
  expect(result.current).toEqual(true);
});

it('return desktop value', async () => {
  matchMedia('1976');
  const { result } = renderHook(() => useViewSize(ViewSize.Desktop));
  expect(result.current).toEqual(true);
});

it('return desktopL value', async () => {
  matchMedia('2156');
  const { result } = renderHook(() => useViewSize(ViewSize.DesktopL));
  expect(result.current).toEqual(true);
});
