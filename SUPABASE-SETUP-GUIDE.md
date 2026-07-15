# The Pack — Supabase Setup Guide

This Version 1 package still runs locally using browser storage. The files in `/supabase` prepare the project for the production backend. Follow these steps before replacing local storage.

## 1. Create the project

1. Sign in at the Supabase dashboard.
2. Select **New project**.
3. Choose your organization, enter a project name such as `the-pack-production`, create a strong database password, and select the closest region.
4. Wait for the project to finish provisioning.

## 2. Create the database tables and security policies

1. In the Supabase dashboard, open **SQL Editor**.
2. Choose **New query**.
3. Open this project file: `supabase/schema.sql`.
4. Copy the entire file into the SQL Editor.
5. Select **Run**.
6. In **Table Editor**, confirm these tables exist:
   - `profiles`
   - `stickers`
   - `user_stickers`
   - `sticker_placements`
   - `friendships`
   - `checkins`

The SQL enables Row Level Security. Do not disable it.

## 3. Create the sticker image bucket

1. Open **Storage**.
2. Select **New bucket**.
3. Name it `sticker-art`.
4. Keep it **private** for the production build.
5. Add Storage policies that allow authenticated users to read sticker images and only admins/backend functions to upload, update, or delete them.

For an early closed test, you may temporarily use a public bucket, but private storage with signed URLs is the safer production choice.

## 4. Configure authentication

1. Open **Authentication > Providers**.
2. Enable **Email**.
3. Decide whether email confirmation is required during testing.
4. Under **URL Configuration**, add the final Netlify site URL as the Site URL.
5. Add local and Netlify redirect URLs you will use, for example:
   - `http://localhost:8888/**`
   - `https://YOUR-NETLIFY-SITE.netlify.app/**`

## 5. Copy the browser-safe project credentials

1. Open the project **Connect** dialog or API settings.
2. Copy the **Project URL**.
3. Copy the **publishable key** (or legacy anon key).
4. Copy `supabase/config.example.js` to `supabase/config.js`.
5. Paste the URL and publishable key into that file.

Never place the service-role or secret key in `app.js`, HTML, GitHub, or Netlify's public files. Those keys bypass Row Level Security.

## 6. Add the Supabase JavaScript client

This static app can load Supabase from a CDN. Add these scripts before `app.js` in `index.html` when the backend adapter is ready:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase/config.js"></script>
<script src="supabase/supabase-adapter.js"></script>
<script src="app.js"></script>
```

Then create the browser client:

```js
const supabase = window.supabase.createClient(
  window.THE_PACK_SUPABASE.url,
  window.THE_PACK_SUPABASE.publishableKey
);
```

## 7. Create the first admin user

1. Sign up through the app or create a test user in **Authentication > Users**.
2. Copy that user's UUID.
3. In **Table Editor > profiles**, create the matching profile row using the same UUID.
4. Set `is_admin` to `true` for your account.

Do not trust a browser-only `is_admin` check for protected writes. Sticker creation, code changes, and deletion should ultimately run through a protected Edge Function or server endpoint that verifies the admin claim/profile.

## 8. Upload sticker artwork

Recommended production flow:

1. Admin chooses a transparent PNG or WEBP in the app.
2. The protected admin function uploads the file to the `sticker-art` bucket.
3. Insert a row into `stickers` containing the name, section, storage path, active status, and unlock code.
4. The customer app reads active stickers but does not read unlock codes directly.

The unlock code must not be downloaded as part of the public sticker catalog. Use the included `redeem_sticker_code` database function (RPC) or an Edge Function to validate a code and return only the unlocked sticker.

## 9. Replace local-storage features in this order

1. **Authentication and profiles**
2. **Sticker catalog and image storage**
3. **Code redemption** using `redeem_sticker_code`
4. **Unlocked stickers** from `user_stickers`
5. **Sticker placements** from `sticker_placements`
6. **Check-ins and friends**
7. **Admin uploads and code management** through a protected backend function

Keep local storage only as an offline cache after Supabase becomes the source of truth.

## 10. Deploy to Netlify

1. Zip the contents of `the-pack-real-app-v1` or drag the folder into Netlify Deploys.
2. Confirm the site loads over HTTPS.
3. Add the Netlify URL to Supabase Authentication redirect URLs.
4. Test sign-up, sign-in, sticker redemption, placement, logout, and a second user account.
5. Test the app in a private browser window to confirm one user cannot view or change another user's data.

## Production warning

The current app is a functional front-end demo. Uploading it to Netlify does not automatically make the local demo data multi-user. Supabase integration requires replacing the local-storage functions in `app.js` with authenticated database and Storage calls. The included schema and guide establish the correct structure, but credentials are intentionally not embedded.
