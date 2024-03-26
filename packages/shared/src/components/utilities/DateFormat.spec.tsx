import { render, RenderResult, screen } from '@testing-library/react';
import React from 'react';
import { DateFormat } from './index';
import { TimeFormatType } from '../../lib/dateFormat';

const renderComponent = ({
  date,
  type,
  className,
  prefix,
}: {
  date: string | number | Date;
  type: TimeFormatType;
  className?: string;
  prefix?: string;
}): RenderResult => {
  return render(
    <DateFormat
      date={date}
      type={type}
      className={className}
      prefix={prefix}
    />,
  );
};

const date = new Date(2024, 6, 6, 12, 30, 30);

beforeEach(() => {
  jest.useFakeTimers('modern').setSystemTime(date);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('date format post type', () => {
  it('should render post time format', async () => {
    renderComponent({
      date: '2021-08-01T00:00:00Z',
      type: TimeFormatType.Post,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Aug 01, 2021');
  });

  it('should render post time format as now', async () => {
    renderComponent({ date, type: TimeFormatType.Post });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Now');
  });

  it('should render post time format as today', async () => {
    renderComponent({
      date: date.setHours(date.getHours() - 2),
      type: TimeFormatType.Post,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Today');
  });

  it('should render post time format as yesterday', async () => {
    renderComponent({
      date: date.setDate(date.getDate() - 1),
      type: TimeFormatType.Post,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Yesterday');
  });
});

describe('date format comment type', () => {
  it('should render comment time format', async () => {
    renderComponent({
      date: '2021-08-01T00:00:00Z',
      type: TimeFormatType.Comment,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('3 years ago');
  });

  it('should render comment time format as now', async () => {
    renderComponent({
      date,
      type: TimeFormatType.Comment,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Now');
  });

  it('should render comment time format as minutes', async () => {
    renderComponent({
      date: date.setMinutes(date.getMinutes() - 2),
      type: TimeFormatType.Comment,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('2 minutes ago');
  });

  it('should render comment time format as hours', async () => {
    renderComponent({
      date: date.setHours(date.getHours() - 2),
      type: TimeFormatType.Comment,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('2 hours ago');
  });
});

describe('date format read history type', () => {
  it('should render comment time format', async () => {
    renderComponent({
      date: '2021-08-01T00:00:00Z',
      type: TimeFormatType.ReadHistory,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Sun, 1 Aug 2021');
  });

  it('should render comment time format as today', async () => {
    renderComponent({
      date: date.setMinutes(date.getMinutes() - 2),
      type: TimeFormatType.ReadHistory,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Today');
  });

  it('should render comment time format as yesterday', async () => {
    renderComponent({
      date: date.setDate(date.getDate() - 1),
      type: TimeFormatType.ReadHistory,
    });
    const element = screen.getByRole('time');
    expect(element).toHaveTextContent('Yesterday');
  });
});
