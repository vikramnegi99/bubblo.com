import { useEffect, useState } from 'react';

/**
 * Countdown to a real end date. The parent only renders this when the API has
 * confirmed the campaign is active AND an end date exists. We never invent a
 * deadline — if `endsAt` is missing or in the past this renders nothing.
 */
export default function Countdown({ endsAt, accent }) {
  const target = endsAt ? new Date(endsAt).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(target)) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (Number.isNaN(target) || target <= now) return null;

  const diff = target - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const cell = (v, l) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 800, fontSize: '1.3rem', color: accent || 'var(--plum)' }}>{String(v).padStart(2, '0')}</div>
      <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }} aria-label="Offer ends in">
      {cell(days, 'Days')}
      {cell(hours, 'Hrs')}
      {cell(mins, 'Min')}
      {cell(secs, 'Sec')}
    </div>
  );
}
