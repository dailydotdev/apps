import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { MostReadTag } from '../../graphql/users';
import { ReadingTagProgress } from './ReadingTagProgress';

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
  return render(<ReadingTagProgress tag={tag} />);
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
