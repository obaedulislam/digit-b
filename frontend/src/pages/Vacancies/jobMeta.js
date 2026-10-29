/** True when `value` (ISO date) is in the past. Kept out of components so renders stay pure. */
export function isPast(value) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return !Number.isNaN(time) && time < Date.now();
}

/** `404` from an axios error? */
export const isNotFound = (error) => error?.response?.status === 404;

/** "Dhaka, Bangladesh" — avoids repeating the country when `location` already ends with it. */
export function jobPlace(job) {
  const location = (job.location ?? '').trim();
  const country = (job.country ?? '').trim();
  if (!country) return location;
  if (!location) return country;
  return location.toLowerCase().endsWith(country.toLowerCase()) ? location : `${location}, ${country}`;
}
