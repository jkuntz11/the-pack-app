# The Pack Version 1.2 - Reward Engine

## Added
- Admin tab renamed from Journal Stickers to Rewards.
- Create Reward workflow with artwork, journal collection, description, visibility, and unlock method.
- Unlock methods: Staff Code, QR Code, Event Attendance, Brewery Check-In, Beer Purchase, Food Purchase, Challenge Completion, Admin Award, Seasonal/Timed, and Coming Soon.
- Fully functional Staff Code rewards.
- Fully functional QR rewards: auto-generated token, QR preview, copyable unlock link, downloadable PNG, and URL-based redemption.
- Award Now action for testing and manually granted rewards.
- Reward analytics counter for unlocks.
- Existing stickers automatically migrate to Staff Code rewards.
- Mobile admin fix: smaller artwork preview, scrollable form, and sticky Create Reward button.
- Existing Events and Feed Updates admin tools retained.

## Demo limitations
- Data remains in browser localStorage until Supabase wiring is completed.
- Event, GPS/check-in, purchase, challenge, and timed automation are represented in the admin UI but require the production backend/integrations. They can be tested with Award Now.
- QR rendering uses the qrcode browser library from jsDelivr.
