export const REGISTRATION_IS_OPEN: boolean = true;

export const REGISTRATION_NOTICE = {
  title: "Registration opens soon",
  message: "Registrations haven’t started yet. Please check back soon.",
} as const;

export const PRIZEPOOL_REVEAL_AT = Date.parse("2026-10-27T00:00:00+05:30");

const revealDate = new Date(PRIZEPOOL_REVEAL_AT);
const revealFormat = { timeZone: "Asia/Kolkata", day: "numeric" } as const;

export const PRIZEPOOL_REVEAL_DATE = new Intl.DateTimeFormat("en-GB", {
  ...revealFormat,
  month: "long",
}).format(revealDate);

export const PRIZEPOOL_REVEAL_FULL_DATE = new Intl.DateTimeFormat("en-GB", {
  ...revealFormat,
  month: "long",
  year: "numeric",
}).format(revealDate);

export const PRIZEPOOL_REVEAL_SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  ...revealFormat,
  month: "short",
})
  .format(revealDate)
  .toUpperCase();

export const PRIZEPOOL_REVEAL_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
}).format(revealDate);
