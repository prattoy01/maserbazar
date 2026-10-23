# Activate Google and Facebook login

Google is configured for the testing website at `https://masher-bazar-testing.vercel.app` using the `Masher Bazar Website` web client in Google project `model-creek-511107-i1`. Its exact callback is `https://masher-bazar-testing.vercel.app/api/auth/social/google/callback`. `AUTH_ORIGIN`, `GOOGLE_CLIENT_ID`, and the sensitive `GOOGLE_CLIENT_SECRET` are stored in the existing Vercel project's Production environment. Do not create a duplicate client to repeat this setup. When moving to a purchased domain, add its exact callback to this client and update `AUTH_ORIGIN` before deploying.

Facebook remains unavailable until its separate configuration and required approvals are completed.

On 2026-10-09, the live Google account chooser, user consent, callback, account creation, and signed-in account page were verified on the testing website. The login flow requests only `openid email profile`.

Email login continues to work. Social buttons stay unavailable until the corresponding server settings are configured. Never put secrets in NEXT_PUBLIC variables or commit them.

1. Apply the new database migration with the existing `db:migrate` script against each intended database before enabling social login.
2. Set `AUTH_ORIGIN` to your exact website origin, without a trailing slash. For local testing use `http://127.0.0.1:5174`.
3. In Google Cloud, configure the OAuth consent screen and create a Web application OAuth client. Add this exact authorized redirect URI: `https://YOUR-DOMAIN/api/auth/social/google/callback`. For local testing add `http://127.0.0.1:5174/api/auth/social/google/callback`. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on the server. Configure test users while the application is in testing mode.
4. In the Meta developer dashboard, create/configure an app with Facebook Login for websites. Add `https://YOUR-DOMAIN/api/auth/social/facebook/callback` as a valid OAuth redirect URI. Configure your website domain, privacy policy, and user data deletion instructions as required by the dashboard. Set `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, and `FACEBOOK_GRAPH_VERSION` (the supported version shown by your dashboard, such as `vXX.0`). Complete the required dashboard steps for public access. Test using app-role accounts before going live.
5. Restart/redeploy after adding the settings. Check Google and Facebook sign-in, cancellation, logout, repeated sign-in, and linking to an existing email account.

New social accounts are identified by the provider's stable user ID. Existing accounts are never merged just because an email matches: log in with email first, then use the Google/Facebook link buttons in your account. Social-only accounts continue signing in with their provider. Facebook must return an email for new account creation; otherwise use email registration first and link Facebook after logging in.

Provider credentials and live account consent are required to verify real Google/Facebook logins. Automated local checks cannot substitute for that final test.

References: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Facebook login flow](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/).
