THE PACK — BLACK DOG BREWING COMPANY

OPEN THE DEMO
1. Open index.html in Chrome or Edge.
2. The app works locally and stores demo activity in the browser.
3. For installable PWA behavior, serve the folder with a local web server or host it.

WHAT IS INCLUDED
- Approved home hero at assets/heroes/home-hero.webp
- 20 consistent 512x512 SVG badges
- Home, Events, Passport, Journey, Profile, Packmates, Leaderboards, Check-ins, and Admin preview
- ASSET-LIBRARY.csv

PRODUCTION NOTE
This is a complete interactive front-end/PWA build. Real shared accounts, cloud content, image uploads, QR validation, and cross-device data require connecting the supplied interface to Black Dog's Supabase project. Do not place a Supabase service-role key in these files.

ADMIN UPDATE IMAGES
-------------------
Open Admin and use the Update image field when publishing a landing-page update.
Recommended source image: 1200 x 675 pixels or larger, 16:9 landscape, JPG/PNG/WEBP.
The local demo center-crops and compresses the image for browser storage. The live version will upload originals to Supabase Storage.


JOURNAL UPDATE
- Journey tab replaced with a working Explorer's Journal tab.
- Tap the cover to open the journal.
- Table of Contents includes a clickable Beer Collection chapter.
- Beer intro and two 10-slot collection spreads are included.
- Beer progress is displayed dynamically from the local demo profile (out of 20).
- Previous, Contents, and Next navigation is functional.

Journal navigation update:
- The former Passport bottom-navigation position is now the Explorer's Journal.
- The separate Journal tab and home-screen journal card were removed.
- Opening Journal switches the app to a full-screen, edge-to-edge reading mode while retaining bottom navigation.

JOURNAL V2 UPDATE
- The Journal now uses single portrait pages for mobile readability.
- Approved assets: cover, Explorer's Guide, Table of Contents, and Master Page.
- 29 blank sticker pages are included under assets/journal/blank-pages/:
  Beer 7, Events 5, Food 9, Challenges 5, Special Collections 3.
- Table of Contents progress numerators are live HTML elements and are not baked into the artwork.

JOURNAL PAGE FIX
- Every chapter page now loads the Master Page asset with three blank sticker areas overlaid by the app.
- Asset filenames now match the files in assets/journal/blank-pages (for example food-1.webp).
- Food & Pizza contains 9 pages; Beer 7; Events 5; Challenges 5; Special Collections 3.

JOURNAL STICKER ADMIN UPDATE
- Admin > Journal Stickers uploads sticker artwork and assigns it to a journal section.
- On journal collection pages, members tap any of the three blank areas and choose any unplaced sticker assigned to that section.
- Stickers are not permanently assigned to a numbered slot. Members choose where to place them.
- Tap a placed sticker to remove it and place it elsewhere.
- This standalone demo stores uploaded images and placements in browser localStorage. A production release should store them in Supabase Storage/database so all devices share the same sticker library and progress.
