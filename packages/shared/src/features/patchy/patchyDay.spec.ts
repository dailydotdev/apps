import {
  addPatchyActivity,
  createPatchyDay,
  getPatchyQuip,
  parsePatchyDay,
  readPatchyDay,
  recordPatchyActivity,
} from './patchyDay';

const morning = new Date(2026, 10, 18, 9, 0);
const evening = new Date(2026, 10, 18, 21, 0);
const tomorrow = new Date(2026, 10, 19, 8, 0);

describe('patchy day', () => {
  beforeEach(() => localStorage.clear());

  it('counts what happened today', () => {
    let day = createPatchyDay(morning);
    day = addPatchyActivity(day, 'read', morning);
    day = addPatchyActivity(day, 'upvote', morning);
    day = addPatchyActivity(day, 'upvote', evening);
    day = addPatchyActivity(day, 'bookmark', evening);
    day = addPatchyActivity(day, 'treat', evening);

    expect(day).toMatchObject({
      reads: 1,
      upvotes: 2,
      bookmarks: 1,
      pets: 0,
      treatGiven: true,
    });
  });

  it('starts a fresh day when the date changes', () => {
    const today = addPatchyActivity(
      createPatchyDay(morning),
      'upvote',
      morning,
    );
    const next = addPatchyActivity(today, 'read', tomorrow);
    expect(next).toMatchObject({ reads: 1, upvotes: 0, treatGiven: false });
    expect(parsePatchyDay(JSON.stringify(today), tomorrow)).toEqual(
      createPatchyDay(tomorrow),
    );
  });

  it('survives broken storage', () => {
    expect(parsePatchyDay('{nope', morning)).toEqual(createPatchyDay(morning));
    expect(
      parsePatchyDay(
        JSON.stringify({
          day: createPatchyDay(morning).day,
          reads: -1,
          upvotes: 'two',
          pets: 3,
        }),
        morning,
      ),
    ).toMatchObject({
      reads: 0,
      upvotes: 0,
      pets: 3,
    });
  });

  it('stores per user', () => {
    recordPatchyActivity('u1', 'upvote', morning);
    recordPatchyActivity('u1', 'upvote', morning);
    recordPatchyActivity('u2', 'bookmark', morning);
    expect(readPatchyDay('u1', morning).upvotes).toBe(2);
    expect(readPatchyDay('u2', morning)).toMatchObject({
      upvotes: 0,
      bookmarks: 1,
    });
  });

  it('picks a quip for the day', () => {
    const quiet = { reads: 0, upvotes: 0, bookmarks: 0, pets: 0 };
    expect(getPatchyQuip(quiet, 0)).toMatch(/Quiet day/);
    expect(getPatchyQuip({ ...quiet, bookmarks: 4, reads: 1 }, 0)).toMatch(
      /4 saved for later, 1 read/,
    );
    expect(getPatchyQuip({ ...quiet, upvotes: 3 }, 0)).toMatch(/3 upvotes/);
    expect(getPatchyQuip({ ...quiet, reads: 6 }, 0)).toMatch(/6 posts/);
    expect(getPatchyQuip(quiet, 12)).toMatch(/12 days in a row/);
  });
});
