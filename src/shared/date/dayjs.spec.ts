import { configureDayjs, dayjs, formatTimestamp } from './dayjs';

describe('dayjs locale configuration', () => {
  it('should normalize nl-NL to the Dutch locale', () => {
    configureDayjs('nl-NL');

    expect(dayjs.locale()).toBe('nl');
  });

  it('should format timestamps in Dutch', () => {
    const formattedTimestamp = formatTimestamp(
      new Date(2026, 3, 18, 12, 34, 56),
    );

    expect(formattedTimestamp).toBe('zaterdag 18 april 2026 12:34:56');
  });
});
