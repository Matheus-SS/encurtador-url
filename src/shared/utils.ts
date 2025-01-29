import { DateTime } from 'luxon';

export function getCurrentDate() {
  const dt = DateTime.fromObject({}, { zone: 'America/Sao_Paulo' });
  const formattedDate = dt.toFormat('yyyy-MM-dd HH:mm:ss.SSS');
  return formattedDate;
}
