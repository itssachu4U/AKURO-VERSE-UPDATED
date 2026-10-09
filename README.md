# PRINCE BHAI — GitHub + Vercel

This is a plain HTML/CSS/JavaScript conversion of the supplied landing page. It does **not** require WordPress, PHP, React, or a build step.

## Files

- `index.html` — page structure + legal content
- `style.css` — all responsive styling and animations
- `script.js` — Telegram redirect, UTM capture, Meta Pixel events, legal modal, ripple and tilt
- `api/get-link.js` — Vercel serverless endpoint for the Telegram invite
- `api/event.js` — Vercel serverless endpoint that accepts view/join-click diagnostics
- `vercel.json` — Vercel configuration

## Telegram invite link

The page uses `https://t.me/+LWr2hcTQomQ4NmY1` if no invite is configured. To set a different invite, add this environment variable in Vercel → Project → Settings → Environment Variables:

`TELEGRAM_INVITE_LINK`

Value:

`https://t.me/your-invite-link`

The API only accepts HTTPS links on `t.me` or `telegram.me`; invalid values safely fall back to the included invite. Redeploy after changing the variable.

## Important

Vercel discovers serverless functions from the `api/` directory, so the Telegram endpoint is available at `/api/get-link` and the event endpoint at `/api/event`. The event endpoint accepts a page-view or Telegram-join-click diagnostic and writes a compact entry to Vercel function logs; it does not store events in a database or send events to Meta's Conversions API.

The Meta Pixel is initialized once in `index.html` with pixel ID `2784751055259253`. It sends `PageView` and `ViewContent`, and `script.js` sends the custom `TelegramJoinClick` event when someone clicks Join Now. That click measures intent to open Telegram, not a confirmed channel join.

## Deploy on GitHub + Vercel

1. Upload the contents of this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Select Framework Preset **Other** and leave Build Command and Output Directory empty.
4. Deploy. The `/api` functions are picked up automatically.

No WordPress database or plugin system is needed for this landing page.
