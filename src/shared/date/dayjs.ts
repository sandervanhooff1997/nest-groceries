import dayjs from 'dayjs';
import 'dayjs/locale/nl';

const DEFAULT_LOCALE = 'nl-NL';

function normalizeLocale(locale: string): string {
  const normalizedLocale = locale.toLowerCase();

  if (normalizedLocale === 'nl-nl') {
    return 'nl';
  }

  return normalizedLocale;
}

export function configureDayjs(locale = DEFAULT_LOCALE): typeof dayjs {
  dayjs.locale(normalizeLocale(locale));

  return dayjs;
}

configureDayjs();

export function formatTimestamp(date: Date): string {
  return dayjs(date).format('dddd D MMMM YYYY HH:mm:ss');
}

export { dayjs };
