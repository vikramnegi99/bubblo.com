# Going live

## 1. The storefront (already live)
GitHub Pages serves `index.html` from the `main` branch:

**https://vikramnegi99.github.io/bubblo.com/**

Customers can browse all three products, add to cart, checkout with COD, get an order ID and
track it. Orders placed here are saved in the visitor's browser (and shown in the on-page
Admin). To also receive those orders by email, see section 3.

## 2. The backend (real database + admin + owner email)
Deploy the `backend/` folder to any Node host. On Render:

1. Push this repo (done).
2. On render.com choose **New → Blueprint** and point it at this repo (it reads `render.yaml`).
3. Set the secret env vars it asks for: `JWT_SECRET` (auto), `ADMIN_PASSWORD`, and — to actually
   receive email — `EMAIL_PROVIDER` + `EMAIL_PROVIDER_API_KEY` (see section 3).
4. After deploy, the API is live at e.g. `https://bubblo-backend.onrender.com`.

Then build and host the React `frontend/` (Vercel/Netlify) with `VITE_API_URL` set to that API URL.

> Render's free plan has an ephemeral disk, so the SQLite file resets on redeploy. For a real
> store, attach a persistent disk or switch to Postgres.

## 3. Owner email on every COD order
The backend already sends the owner an email for each new order (order id, customer name, phone,
email, full address, items, totals, COD, status). It never blocks the order. Choose a provider:

- **Easiest, no server needed:** open https://web3forms.com, enter `mrvickybusines@gmail.com`, copy
  the free Access Key, and paste it into `index.html`:
  `window.BUBBLO_CONFIG={web3formsKey:"YOUR_KEY",orderWebhook:""};`
  Now every order placed on the live site is emailed to the owner.
- **Full backend:** set `EMAIL_PROVIDER` to `resend` or `sendgrid` (or `smtp`) and provide the key /
  SMTP credentials in the backend environment. `console` (default) just logs server-side.

Never put a secret API key in `index.html` — only the Web3Forms Access Key is designed to be public.
