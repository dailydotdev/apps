import { useContext, useMemo, useState } from 'react';
import {
  addDays,
  endOfYear,
  startOfTomorrow,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { useViewSize, ViewSize } from '../useViewSize';
import SettingsContext from '../../contexts/SettingsContext';

const BASE_YEAR = 2018;

type UseActivityTimeFilterRet = {
  selectedHistoryYear: number;
  setSelectedHistoryYear: (year: number) => void;
  before: Date;
  after: Date;
  yearOptions: string[];
  fullHistory: boolean;
};

export function useActivityTimeFilter(): UseActivityTimeFilterRet {
  const dropdownOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const optionsLength = Math.max(currentYear - BASE_YEAR + 1, 0);

    return [
      'Last year',
      ...Array.from(new Array(optionsLength), (_, i) =>
        (currentYear - i).toString(),
      ),
    ];
  }, []);

  const laptop = useViewSize(ViewSize.Laptop);
  const laptopL = useViewSize(ViewSize.LaptopL);
  const { sidebarExpanded } = useContext(SettingsContext);
  const fullHistory = (laptop && !sidebarExpanded) || laptopL;
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
  }, [fullHistory, selectedHistoryYear, dropdownOptions]);

  return {
    selectedHistoryYear,
    setSelectedHistoryYear,
    before,
    after,
    yearOptions: dropdownOptions,
    fullHistory,
  };
}
