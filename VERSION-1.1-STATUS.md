# The Pack Version 1.1

This package includes the working Version 1 app plus an Events manager in the Admin dashboard.

## Added in 1.1

- Admin dashboard tab for Events
- Create an event with title, date/time, location, details, and image
- New events immediately appear on the customer Events page
- Existing events can be deleted from the Admin dashboard
- Event image previews and mobile-friendly admin event cards
- Updated service worker cache version
- Service worker now ignores browser-extension and other cross-origin requests

## Current data behavior

Events, stickers, journal placements, and user data are stored in browser localStorage in this demo. They do not yet sync across devices. Supabase integration remains the next backend step.
