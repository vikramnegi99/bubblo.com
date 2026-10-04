import { useState } from 'react';

/** Simple accessible accordion, used for product FAQs. */
export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  if (!items || !items.length) return null;
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className="acc" key={i}>
            <button
              className="acc__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span>{item.q}</span>
              <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="acc__a muted">{item.a}</div>}
          </div>
        );
      })}
    </div>
  );
}
