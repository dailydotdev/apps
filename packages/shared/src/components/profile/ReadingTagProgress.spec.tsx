import React from 'react';
import nock from 'nock';
import { getDayOfYear, getDaysInYear } from 'date-fns';
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
};

const renderComponent = (
  isFilterSameYear = false,
  tag: MostReadTag = defaultTopTag,
) => {
  return render(
    <ReadingTagProgress tag={tag} isFilterSameYear={isFilterSameYear} />,
  );
};

describe('ProfileTooltipContent component', () => {
  it('should show tag', async () => {
    renderComponent();
    await screen.findByText(`#${defaultTopTag.value}`);
  });

  it('should show the percentage', async () => {
    renderComponent();
    await screen.findByText(`${(defaultTopTag.percentage * 100).toFixed(0)}%`);
  });

  it('should show default tooltip', async () => {
    renderComponent();
    const days = getDaysInYear(new Date());
    await screen.findByLabelText(`${defaultTopTag.count}/${days} reading days`);
  });

  it('should show appropriate tooltip for format same year', async () => {
    renderComponent(true);
    const days = getDayOfYear(new Date());
    await screen.findByLabelText(`${defaultTopTag.count}/${days} reading days`);
  });
});
