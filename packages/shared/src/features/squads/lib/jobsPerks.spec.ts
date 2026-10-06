import {
  chunkSquadPerkCodes,
  fromPerkEndDateInput,
  getLinkHost,
  getSquadJobMeta,
  getSquadPerkEndsLabel,
  parseSquadPerkCodes,
  SQUAD_PERK_CODES_BATCH,
  toPerkEndDateInput,
} from './jobsPerks';
import {
  SquadJobEmploymentType,
  SquadJobWorkplace,
} from '../../../graphql/squadJobsPerks';

describe('getSquadJobMeta', () => {
  it('should join the location and the employment type', () => {
    expect(
      getSquadJobMeta({
        location: 'Remote (EU)',
        workplace: SquadJobWorkplace.Remote,
        employmentType: SquadJobEmploymentType.FullTime,
      }),
    ).toEqual('Remote (EU) · Full-time');
  });

  it('should say when a role is hybrid', () => {
    expect(
      getSquadJobMeta({
        location: 'London',
        workplace: SquadJobWorkplace.Hybrid,
        employmentType: SquadJobEmploymentType.Contract,
      }),
    ).toEqual('London (hybrid) · Contract');
  });
});

describe('getSquadPerkEndsLabel', () => {
  it('should show the end date', () => {
    expect(
      getSquadPerkEndsLabel({ endsAt: '2026-12-31T12:00:00.000Z' }),
    ).toEqual('Ends Dec 31');
  });

  it('should say when there is no end date', () => {
    expect(getSquadPerkEndsLabel({ endsAt: null })).toEqual('No end date');
  });
});

describe('parseSquadPerkCodes', () => {
  it('should split lines and commas, trim and drop repeats', () => {
    expect(parseSquadPerkCodes(' A-1\nA-2, A-3\n\nA-1;A-4 ')).toEqual([
      'A-1',
      'A-2',
      'A-3',
      'A-4',
    ]);
  });
});

describe('getLinkHost', () => {
  it('should return the host without www', () => {
    expect(getLinkHost('https://www.coderabbit.ai/careers/1')).toEqual(
      'coderabbit.ai',
    );
  });

  it('should return null for something that is not a link', () => {
    expect(getLinkHost('not a link')).toBeNull();
  });
});

describe('perk end date input', () => {
  it('should round-trip the picked day', () => {
    const stored = fromPerkEndDateInput('2026-12-31');

    expect(stored).toEqual('2026-12-31T23:59:59.999Z');
    expect(toPerkEndDateInput(stored)).toEqual('2026-12-31');
    expect(toPerkEndDateInput(fromPerkEndDateInput('2026-12-31'))).toEqual(
      '2026-12-31',
    );
  });

  it('should leave an empty date empty', () => {
    expect(fromPerkEndDateInput('')).toBeNull();
    expect(toPerkEndDateInput(null)).toEqual('');
  });
});

describe('chunkSquadPerkCodes', () => {
  it('should split codes into batches the API takes', () => {
    const codes = Array.from(
      { length: SQUAD_PERK_CODES_BATCH + 2 },
      (_, i) => `C-${i}`,
    );

    expect(chunkSquadPerkCodes(codes).map((batch) => batch.length)).toEqual([
      SQUAD_PERK_CODES_BATCH,
      2,
    ]);
  });
});
