import { useMemo, useState } from 'react';
import {
  addDays,
  endOfYear,
  startOfTomorrow,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { useViewSize, ViewSize } from '../useViewSize';

const BASE_YEAR = 2018;
const currentYear = new Date().getFullYear();
const dropdownOptions = [
  'Last year',
  ...Array.from(new Array(currentYear - BASE_YEAR + 1), (_, i) =>
    (currentYear - i).toString(),
  ),
];

type UseActivityTimeFilterRet = {
  selectedHistoryYear: number;
  setSelectedHistoryYear: (year: number) => void;
  before: Date;
  after: Date;
  yearOptions: string[];
  fullHistory: boolean;
};

export function useActivityTimeFilter(): UseActivityTimeFilterRet {
  const fullHistory = useViewSize(ViewSize.Laptop);
  const [selectedHistoryYear, setSelectedHistoryYear] = useState(0);
  const [before, after] = useMemo<[Date, Date]>(() => {
    if (!fullHistory) {
      const start = startOfTomorrow();
      return [start, subMonths(subDays(start, 2), 6)];
    }
    if (!selectedHistoryYear) {
      const start = startOfTomorrow();
      return [start, subYears(subDays(start, 2), 1)];
    }
    const selected = parseInt(dropdownOptions[selectedHistoryYear], 10);
    const startYear = new Date(selected, 0, 1);

    return [addDays(endOfYear(startYear), 1), startYear];
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHistoryYear]);

  return {
    selectedHistoryYear,
    setSelectedHistoryYear,
    before,
    after,
    yearOptions: dropdownOptions,
    fullHistory,
  };
}
