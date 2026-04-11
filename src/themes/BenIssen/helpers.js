import { useEffect } from 'react';
import { formatMonthYear, isPresent, isArchived } from '../../utils/cvHelpers';

export const COLORS = ['#FFFFFF', '#FF5D0D', '#7A64FF'];

export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

export const C = {
  bg: 'rgb(28, 28, 28)',
  card: 'rgb(54, 54, 54)',
  inset: 'rgb(46, 46, 46)',
  inset2: 'rgb(38, 38, 38)',
  tabActive: 'rgb(71, 71, 71)',
  border: 'rgba(117, 117, 117, 0.5)',
  borderHard: 'rgb(97, 97, 97)',
  borderSoft: 'rgb(82, 82, 82)',
  text: 'rgb(224, 224, 224)',
  textMid: 'rgb(189, 189, 189)',
  textMuted: 'rgb(153, 153, 153)',
  pulse: 'rgb(255, 51, 51)',
  white: '#ffffff',
};

export function useFontLink(href) {
  useEffect(() => {
    if (document.querySelector('link[data-benissen-font="1"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.benissenFont = '1';
    document.head.appendChild(link);
  }, [href]);
}

export function statusFor(item) {
  if (isArchived(item)) return 'Archived';
  if (item?.end_date && isPresent(item.end_date)) return 'Live';
  if (!item?.end_date) return 'Live';
  return 'Past';
}

export function safeFmt(d) {
  if (d == null || d === '') return '';
  return formatMonthYear(String(d));
}

export function fmtRange(start, end) {
  const s = safeFmt(start);
  const e = safeFmt(end);
  if (!s && !e) return '';
  if (!e) return s;
  return `${s} — ${e}`;
}

export function getInitials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || 'A'
  );
}

export function flatSkills(skills = []) {
  const out = [];
  skills.forEach((s) => {
    if (typeof s === 'string') out.push(s);
    else if (s?.label && s?.details) {
      String(s.details).split(/[;,]/).map((t) => t.trim()).filter(Boolean).forEach((t) => out.push(t));
    } else if (s?.name) out.push(s.name);
  });
  return out;
}
