# The Pack Version 1.2.1

- Reduced reward unlock methods to Staff Code and QR Code.
- Unified staff entry and QR scans around one unique unlock code per reward.
- Preserved a permanent reward ID independently from the editable unlock code and migrated existing local reward records without replacing their IDs.
- Prevented duplicate collection per user; repeated code entries and QR scans now show “Already Collected” without adding another unlock or incrementing totals.
- Kept reward collection separate from journal placement so unlocked rewards can remain in the collection tray until placed.
- Added Generate QR and Duplicate Reward actions to the Admin reward workflow. Duplicates receive a new permanent ID and unlock code and start paused.
- Preserved live category totals and collected counts in the Explorer’s Journal Table of Contents.
- Updated the Supabase reward schema and redemption function to enforce the two unlock methods and report duplicate redemption attempts.
- Replaced the PWA, home-screen, Apple touch, and browser icons with the embroidered The Pack Members Club artwork.
- Added 16, 32, 64, 180, 192, and 512 pixel icon assets.
- Updated the web manifest and HTML icon links.
- Bumped the service-worker cache version so installed testers receive the V1.2.1 reward engine and artwork.
- No animation was added.
