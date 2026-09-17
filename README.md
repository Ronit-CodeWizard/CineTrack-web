# CineTrack-web

Secure frontend account pages for Cinetrack.

No Supabase API key is stored in this repository. The website communicates with the Cloudflare Worker:

`https://cinetrack-tmdb.official-ronit-codewizard.workers.dev`

## Routes

- `/reset-password/`
- `/confirm-email/`
- `/magic-link/`

## Supabase setup

Add your deployed reset page to **Authentication → URL Configuration → Redirect URLs**.

Example:

`https://YOUR-GITHUB-USERNAME.github.io/CineTrack-web/reset-password/`

When requesting a password reset from the app, set `redirectTo` to that same URL.

The Worker must proxy the Supabase Auth `/user` endpoint and allow the method used by the reset page.
