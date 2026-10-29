/** The API issues 64-character alphanumeric unsubscribe tokens. */
export const isValidUnsubscribeToken = (token) => typeof token === 'string' && /^[A-Za-z0-9]{64}$/.test(token);
