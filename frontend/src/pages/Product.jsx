import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { storeApi } from '../lib/api';
import { inr } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import Accordion from '../components/Accordion';
import ProductCard from '../components/ProductCard';
import ReviewsSection from '../components/home/ReviewsSection';
import QuickView from '../components/QuickView';
import { useSeo, productJsonLd, faqJsonLd } from '../lib/seo';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const toast = useToast();
  const { products, settings } = useStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [quick, setQuick] = useState(null);
  const touchX = useRef(null);

  useEffect(() => {
    let live = true;
    setLoading(true); setNotFound(false); setActive(0); setQty(1);
    storeApi.product(slug)
      .then((r) => { if (live) { setData(r); setLoading(false); } })
      .catch(() => { if (live) { setNotFound(true); setLoading(false); } });
    return () => { live = false; };
  }, [slug]);

  const product = data?.product;
  const gallery = useMemo(
    () => (product?.gallery?.length ? product.gallery : product?.hero ? [product.hero] : []),
    [product]
  );
  const current = gallery[active] || product?.hero;

  useSeo({
    title: product ? `${product.name} | BUBBLO` : 'BUBBLO',
    description: product?.shortDescription,
    canonical: `/products/${slug}`,
    image: product?.hero?.url,
    jsonLd: product ? [productJsonLd(product), faqJsonLd(product.faqs)] : null,
  });

  if (loading) return <div className="container section"><p>Loading…</p></div>;
  if (notFound || !product) {
    return (
      <div className="container section center">
        <h2>Product not found</h2>
        <p className="muted">This product may no longer be available.</p>
        <Link to="/#shop" className="btn btn--primary">Back to shop</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40 && gallery.length > 1) {
      setActive((i) => (dx < 0 ? (i + 1) % gallery.length : (i - 1 + gallery.length) % gallery.length));
    }
    touchX.current = null;
  };

  const buyNow = () => { add(product, qty); navigate('/checkout'); };

  return (
    <>
      <div className="container" style={{ paddingTop: 18 }}>
        <nav className="muted" style={{ fontSize: '0.85rem' }}>
          <Link to="/">Home</Link> / <Link to="/#shop">Shop</Link> / <span>{product.name}</span>
        </nav>
      </div>

      <section className="section section--tight">
        <div className="container pdp">
          {/* Gallery */}
          <div>
            <div className="gallery__main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {current && (
                <img src={current.url} srcSet={current.srcset} sizes="(max-width: 900px) 100vw, 560px" alt={product.name} width="800" height="800" />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="gallery__rail" role="tablist" aria-label="Product images">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === active}
                    className={`gallery__thumb ${i === active ? 'gallery__thumb--active' : ''}`}
                    onClick={() => setActive(i)}
                  >
                    <img src={g.thumb || g.url} alt={`${product.name} view ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.tag && <span className="chip">{product.tag}</span>}
            <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', marginTop: 10 }}>{product.name}</h1>
            <p>{product.shortDescription}</p>

            <div className="pcard__price" style={{ fontSize: '1.2rem' }}>
              <span className="price-now" style={{ fontSize: '1.7rem' }}>{inr(product.price)}</span>
              {product.showDiscount && (
                <>
                  <span className="price-mrp">{inr(product.mrp)}</span>
                  <span className="chip chip--discount">{product.discount}% OFF</span>
                </>
              )}
            </div>
            <p className="hint">
              {settings.codEnabled
                ? 'Cash on Delivery available · confirmed by a quick phone call'
                : 'Cash on Delivery is currently unavailable.'}
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '18px 0' }}>
              <span style={{ fontWeight: 700 }}>Quantity</span>
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
              <button className="btn btn--primary btn--block" onClick={buyNow}>Buy Now</button>
              <button className="btn btn--ghost btn--block" onClick={() => { add(product, qty); toast(`${product.name} added to cart`); }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {product.benefits?.length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <div className="grid grid--cards">
              {product.benefits.map((b, i) => (
                <div className="benefit" key={i}>
                  <h4>{b.title}</h4>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Details + lifestyle */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container grid grid--2" style={{ alignItems: 'center' }}>
          <div>
            <h2>Product Details</h2>
            <p>{product.description}</p>
          </div>
          {product.lifestyle && (
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <img src={product.lifestyle.url} srcSet={product.lifestyle.srcset} sizes="(max-width: 820px) 100vw, 560px" alt={`${product.name} in use`} loading="lazy" />
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      {product.howItWorks?.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="center">How It Works</h2>
            <div className="steps">
              {product.howItWorks.map((s) => (
                <div className="step" key={s.step}>
                  <div className="step__n">{s.step}</div>
                  <p style={{ margin: 0 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What's included + gift */}
      <section className="section section--tight">
        <div className="container grid grid--2">
          <div className="panel">
            <h3>What&rsquo;s Included</h3>
            <ul style={{ paddingLeft: 18, color: 'var(--ink-soft)', lineHeight: 1.9 }}>
              {product.whatsIncluded?.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
          <div className="panel" style={{ background: 'var(--grad-soft)' }}>
            <h3>Gift It Forward</h3>
            <p>Beautiful to look at, easy to use — a gift that gets an instant reaction.</p>
            <button className="btn btn--primary" onClick={() => { add(product, qty); toast(`${product.name} added to cart`); }}>
              GIFT THE FUN
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {product.faqs?.length > 0 && (
        <section className="section" style={{ background: '#fff' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 className="center">FAQ</h2>
            <Accordion items={product.faqs} />
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewsSection
        productSlug={product.slug}
        reviews={data.reviews}
        summary={data.reviewSummary}
        onSubmitted={() => storeApi.product(slug).then(setData)}
      />

      {/* Related */}
      {related.length > 0 && (
        <section className="section" style={{ background: 'var(--off-white)' }}>
          <div className="container">
            <h2 className="center">You May Also Like</h2>
            <div className="grid grid--products">
              {related.map((p) => <ProductCard key={p.slug} product={p} onQuickView={setQuick} />)}
            </div>
          </div>
        </section>
      )}

      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </>
  );
}
