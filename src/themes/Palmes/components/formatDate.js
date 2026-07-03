import { parseDateParts, MONTHS_SHORT } from '../../../utils/cvHelpers';

/**
 * Shared date formatter for the Palmes theme, built on the shared CV helpers.
 *
 * Reproduces the output of the old per-component
 * `new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })`
 * formatters: "May 2023" for "2023-05" / "2023-05-04", "Jan 2023" for a bare
 * "2023" (Date defaults to January), and raw passthrough for unparseable
 * input — but without the `new Date('YYYY-MM')` UTC-shift bug.
 *
 * Pass `presentLabel` to map "present" to a label (Education, Experience and
 * Volunteer used "Present"); by default "present" passes through raw,
 * matching the components that had no present check.
 */
export default function formatDate(dateStr, { presentLabel = null } = {}) {
  if (!dateStr) return '';
  const parts = parseDateParts(dateStr);
  if (!parts) return dateStr;
  if (parts.present) return presentLabel ?? dateStr;
  return `${MONTHS_SHORT[(parts.month || 1) - 1]} ${parts.year}`;
}
