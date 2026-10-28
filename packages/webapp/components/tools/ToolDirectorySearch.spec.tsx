import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMobileAppFooterContext } from '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext';
import { ToolDirectorySearch } from './ToolDirectorySearch';

jest.mock('@dailydotdev/shared/src/hooks/useViewSize', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks/useViewSize'),
  useIsPhone: jest.fn(() => true),
}));

jest.mock(
  '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext',
  () => ({ useMobileAppFooterContext: jest.fn() }),
);

const mockFooter = jest.mocked(useMobileAppFooterContext);

// jsdom has no Tailwind, so a `hidden` ancestor stands in for display:none
// below tablet.
const visibleSearchFields = () =>
  screen
    .queryAllByRole('searchbox')
    .concat(screen.queryAllByRole('textbox'))
    .filter((input) => !input.closest('.hidden'));

const renderComponent = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ToolDirectorySearch
        value=""
        onValueChange={jest.fn()}
        onQueryChange={jest.fn()}
      />
    </QueryClientProvider>,
  );

describe('ToolDirectorySearch on a phone', () => {
  it('keeps the in-page field when the app footer takes the bottom', () => {
    mockFooter.mockReturnValue({ title: 'See all posts' });
    renderComponent();

    const fields = visibleSearchFields();
    expect(fields).toHaveLength(1);
    expect(fields[0]).toHaveAttribute('aria-label', 'Search all tools');
  });

  it('hands search to the floating field when there is no app footer', () => {
    mockFooter.mockReturnValue({});
    renderComponent();

    const fields = visibleSearchFields();
    expect(fields).toHaveLength(1);
    expect(fields[0]).toHaveAttribute('aria-label', 'Search tools');
  });
});
