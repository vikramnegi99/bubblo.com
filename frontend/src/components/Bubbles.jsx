import { useMemo } from 'react';

/** Decorative floating bubbles. Purely visual — respects reduced motion via CSS. */
export default function Bubbles({ count = 9 }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 14 + ((i * 37) % 46);
        return {
          left: `${(i * 100) / count + (i % 3) * 4}%`,
          size,
          duration: `${9 + (i % 5) * 2.5}s`,
          delay: `${(i % 6) * 1.1}s`,
        };
      }),
    [count]
  );

  return (
    <div className="bubbles" aria-hidden="true">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{ left: b.left, width: b.size, height: b.size, animationDuration: b.duration, animationDelay: b.delay }}
        />
      ))}
    </div>
  );
}
