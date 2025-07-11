import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { MostReadTag } from '../../graphql/users';
import { ReadingTagProgress } from './ReadingTagProgress';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultTopTag: MostReadTag = {
  value: 'javascript',
  count: 4,
  percentage: 0.8,
  total: 5,
};

const renderComponent = (tag: MostReadTag = defaultTopTag) => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ReadingTagProgress tag={tag} />
    </TestBootProvider>,
  );
};

describe('ProfileTooltipContent component', () => {
  it('should show tag', async () => {
    renderComponent();
    await screen.findByText(`#${defaultTopTag.value}`);
  });

  it('should show the percentage', async () => {
    renderComponent();
    const percentage = (defaultTopTag.percentage * 100).toFixed(0);
    const value = `${percentage}%`;
    await screen.findByText(value);
    const progress = await screen.findByTestId('tagProgress');
    expect(progress.style.width).toEqual(value);
  });

  it('should show default tooltip', async () => {
    renderComponent();
    const { count, total } = defaultTopTag;
    await screen.findByLabelText(`${count}/${total} reading days`);
  });
});
