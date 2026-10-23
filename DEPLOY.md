# Free testing deployment

Update, 8 October 2026: published the mobile category expand/collapse control (eight initial categories) and Google/Facebook/email login interface to the testing production address. Hosted homepage and login returned HTTP 200; hosted HTML confirmed eight category tiles and the expand button. Local browser checks passed 8 → 20 → 8 tiles, and email authentication and social identity/linking checks passed. Migration `0005_social_login.sql` is applied to the testing database. Social login is pending Google/Meta credentials; see `SOCIAL-LOGIN.md` for activation. Vercel deployment protection remains enabled.

This is a separate Next.js copy of মাসের বাজার for Vercel. The original `buyzon-mart` project and its existing Sites deployment are unchanged.

The production build and four local functional suites pass. Vercel project `prattoys-projects/masher-bazar-testing` is linked on the active Hobby plan. Its Production and Preview environments are connected to `masher-bazar-test-db` on Turso Starter ($0/month), with all five schema migrations applied. Functions and database are both configured for Mumbai (`bom1`). Do not use the existing Sites database or upload the original `.env`, `.wrangler`, or local test database.

Testing website: https://masher-bazar-testing.vercel.app/ . Admin: https://masher-bazar-testing.vercel.app/admin . Vercel Authentication remains enabled, so sign in with the owning Vercel account before using the website.

Hosted verification passed on 6 October 2026: homepage, login/admin pages, catalog/database, unauthorized access rejection, registration, secure HttpOnly session cookies, logout/login, cart, delivery choices, preview checkout, order persistence, photo upload/readback and admin reports. One clearly named synthetic testing account, order and tiny image remain in this new testing database. The local verification script is excluded from deployment uploads.

The mobile category/location update is also published at this address. The hosted homepage renders all 20 department tiles and its catalog returns successfully. Local UI checks verified four columns at 320/390 pixels, desktop arrow scrolling at 1440 pixels, department filtering, GPS timeout/manual fallback, address persistence across reload and the selected address/area prefilling checkout. The live mobile layout was visually inspected after deployment. Exact GPS coordinates are not sent to the backend; the city check is approximate and customers confirm the delivery area and street address.

## Services

- Vercel Hobby: web pages and Node.js API routes. Use this deployment for personal, non-commercial testing only; check Vercel's plan rules before operating a real business.
- Turso Free: durable libSQL database for accounts, carts, products, orders, addresses, wishlist and product photos. Use a database scoped to this testing deployment.
- Product photos are stored in the testing database, avoiding a separate storage subscription. JPEG, PNG and WebP uploads are limited to **3 MB** because Vercel Functions have a 4.5 MB request/response limit. Base64 photo data consumes about 33% more database space than the image file.
- Email/password login, recovery codes, admin access, checkout and all seven added shopping/admin features are retained. Payments and courier dispatch remain previews.

## Current database connection

The Vercel Marketplace integration supplies `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` directly to the Production and Preview environments. Its terms were accepted through the Vercel browser flow. The ignored `.env.vercel-preview` file holds the pulled connection for schema administration; do not print or commit it.

The separate testing admin key is in ignored `.env.deploy`. With explicit user approval, it has been configured as a sensitive server environment variable in both Production and Preview. It differs from the local development admin key.

## Set up a different database

1. Sign in to https://app.turso.tech/ and create a free **libSQL** database for this project. The libSQL driver is deliberately used to preserve the SQLite SQL and transactional order/stock updates.
2. Obtain its database URL and database-scoped read/write auth token. Do not share tokens in chat or source control.
3. Create an ignored `.env.deploy` file in this folder:

```dotenv
TURSO_DATABASE_URL=libsql://your-test-database.turso.io
TURSO_AUTH_TOKEN=your-database-token
ADMIN_KEY=your-separate-long-random-admin-key
```

4. Apply migrations to that **new** remote database explicitly:

```powershell
node --env-file=.env.deploy scripts/migrate.mjs
```

This runs each migration once in a transaction and rejects changes to already-applied migration files. It does not import local test accounts or orders. Sample products are seeded when the catalog is first requested.

## Deploy

Sign in with the official Vercel CLI, create/link a new testing project, and add the three variables above to the project's Preview environment. Keep `TURSO_AUTH_TOKEN` and `ADMIN_KEY` marked as secrets. Use stdin for CLI secret values rather than shell arguments.

```powershell
vercel login
vercel link --yes --project masher-bazar-testing
vercel deploy --yes
```

For the already-linked copy, use `vercel deploy --prod --yes` to update the main testing address, or `vercel deploy --target preview --yes` to create a preview. Both environments must have all three variables configured.

Framework: **Next.js**. Install command: `npm ci`. Build command: `npm run build`. No custom output directory is required. Vercel assigned the first deployment to Production automatically; this separate project is still used only for testing. Retain Vercel Authentication while testing. This provider's access settings are separate from Sites' owner/Tamp allowlist.

After deployment, verify `/`, `/login`, `/admin`, `/api/catalog`, and `/api/delivery`, then create a synthetic account and preview order. Confirm photo upload/readback and admin reports. Do not run the mutation-heavy local QA scripts against hosted customer data.

## Local use

Node 22.13 or newer is required. Dependencies are already installed in this checkout. The ignored `.env` uses a separate local file database and a generated local admin key.

```powershell
npm run db:migrate
npm run dev
```

Local URL: http://127.0.0.1:5174/ . Administrator URL: http://127.0.0.1:5174/admin . Local changes do not update either hosted project.

## References

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/functions/limitations
- https://vercel.com/docs/headers/request-headers
- https://docs.turso.tech/integrations/vercel
- https://docs.turso.tech/sdk/ts/reference
- https://turso.tech/pricing
