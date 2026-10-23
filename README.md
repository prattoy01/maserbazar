# মাসের বাজার — Vercel testing copy

Next.js grocery storefront with email/password login, account-owned carts and preview orders, product management, configurable monthly bundles, Buy again, saved addresses, delivery windows, wishlist, stock alerts and sales dashboard.

The storefront includes a desktop category carousel and a four-column phone grid with 20 illustrated departments. Department choices also appear in the admin product form. Legacy sample products are mapped into relevant departments without changing stored order data; departments without inventory show an empty state.

The mobile delivery selector opens on the first visit and offers GPS or manual entry. GPS requires a customer action and browser permission, then performs a broad Sylhet city check on the device. It does not reverse-geocode a street address or determine delivery eligibility. Exact coordinates are not stored or transmitted. Customers confirm a supported neighbourhood and can enter a street address; that address is stored in browser storage and prefills checkout. Permission denial, timeout, poor accuracy and unavailable location all leave manual entry available.

The original Cloudflare/Sites project remains in `../buyzon-mart`. This copy uses Turso/libSQL for durable data and a small database-backed image store for testing. No customer data or original deployment secrets were copied.

See [DEPLOY.md](DEPLOY.md) for the free hosting setup, environment variables, migrations, limits and local commands.

## Validation

Production build: `npm run build`. Local functional checks are in `scripts/verify-auth.mjs`, `scripts/verify-commerce.mjs`, `scripts/verify-features.mjs`, and `scripts/verify-products.mjs`. They create synthetic accounts, products and orders and must only run against the disposable local preview on port 5174. Their changes are not included in source deployments.

`node scripts/verify-browse-location.mjs` checks department compatibility/filtering, GPS result classification, validated browser-location data and exclusion of coordinates from stored location data. Mobile layouts were inspected at 320 and 390 pixels, desktop carousel at 1440 pixels, plus manual entry and the actual GPS timeout fallback. Geolocation API behavior follows https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition .

## Authentication

Passwords use bcrypt cost 12, at least 15 characters and no more than 72 UTF-8 bytes. Sessions are random tokens stored as hashes with HttpOnly, SameSite=Lax cookies; cookies are always Secure on Vercel. Logout revokes a session. Password changes and one-use recovery codes revoke existing sessions. Account/IP limits and origin checks protect authentication. On Vercel, request rate limiting uses the platform's forwarded client IP header.

Admin API routes require `ADMIN_KEY` and fail closed when it is absent. Customer data queries are scoped to the authenticated account. Transactional libSQL batches preserve stock updates, cart actions, and order idempotency. Saved order prices remain immutable.

Email verification, SMS OTP, email notifications, real payment collection and courier dispatch are not connected. Recovery codes must be saved privately when shown; they are not emailed.

## Testing data

The catalog contains sample prices/stock and externally hosted reference product images. Replace them with confirmed business data and licensed photos before real commerce. Uploads support JPEG/PNG/WebP up to 3 MB in this Vercel copy. Delivered-order totals are order-status reports, not payment collection records.
# maserbazar
