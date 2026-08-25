/* ============================================================================
   YAP — shared local-date helper
   Every streak/challenge date boundary uses the user's local calendar date,
   never the server's UTC date. This is the one place that computes it, both
   on the client (to send with a completion) and on the server (to validate
   it). Do not scatter `new Date()` arithmetic elsewhere.
   ========================================================================== */

/**
 * The IANA timezone the browser is running in, e.g. "Asia/Kolkata".
 * Client-only; falls back to the same default the schema uses.
 * @returns {string}
 */
export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch (e) {
    return "Asia/Kolkata";
  }
}

/**
 * Compute a `YYYY-MM-DD` local calendar date for `date` in IANA `timezone`.
 * Works on both client and server (Node's Intl has full ICU in this repo's
 * runtime). Never throws on a bad timezone — falls back to Asia/Kolkata.
 * @param {Date} [date]
 * @param {string} [timezone]
 * @returns {string}
 */
export function localDateInTimezone(date = new Date(), timezone = "Asia/Kolkata") {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // en-CA formats as YYYY-MM-DD
    return fmt.format(date);
  } catch (e) {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(date);
  }
}

/**
 * Today's local date string for the given timezone. Replacement for the old
 * client-only `todayKey()` — same YYYY-MM-DD convention, but timezone-aware
 * and reusable on the server.
 * @param {string} [timezone]
 * @returns {string}
 */
export function todayLocalDate(timezone = "Asia/Kolkata") {
  return localDateInTimezone(new Date(), timezone);
}

/**
 * Validate a client-supplied `local_date` (YYYY-MM-DD) against the server's
 * own computation for the stored timezone. Accepts the client value only if
 * it is within +/-1 day of the server's value (clock-skew tolerance);
 * otherwise returns the server-computed value. Never trusts the client blindly.
 * @param {string|null|undefined} clientLocalDate
 * @param {string} timezone
 * @returns {string}
 */
export function reconcileLocalDate(clientLocalDate, timezone) {
  const serverDate = todayLocalDate(timezone);
  if (!clientLocalDate || typeof clientLocalDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(clientLocalDate)) {
    return serverDate;
  }
  const server = new Date(serverDate + "T00:00:00Z").getTime();
  const client = new Date(clientLocalDate + "T00:00:00Z").getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (Math.abs(server - client) <= oneDayMs) {
    return clientLocalDate;
  }
  return serverDate;
}
