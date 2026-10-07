# Benj Fitness

Personal fitness journal prepared for `https://fitness.benedictjan.com`. No user account or paid AI API is required.

## Run locally

Use Node.js 22 or newer. Install dependencies with `npm install`, build local Three.js and Lucide assets with `npm run build`, then run `npm start`. Open `http://127.0.0.1:4173`. On Windows, use `npm.cmd` if PowerShell blocks npm scripts. Built assets are already included, so the server itself requires no npm dependencies.

Your journal is saved in IndexedDB in that browser. Use the same browser and file location each time. Export backups from Profile & backup, especially before changing browsers or moving the app. Private browsing and clearing browser storage can remove the journal.

## Daily schedule

Daily targets: 10,000 steps and 1,800 kcal of food intake. Existing profiles adopt these targets once on reopening; later manual changes in Profile are respected.

- Cardio window: 5:30 AM to 7:00 AM. Start with 5 minutes easy movement, 20 to 40 minutes comfortable cardio, and 5 minutes cooling down.
- Resistance window: 5:00 PM to 6:00 PM. Monday, Wednesday, and Friday have different routines; other evenings are recovery or gentle mobility.
- Monday, legs & chest: goblet squat, dumbbell bench press, cable lat pulldown, curl or hammer curl, dead bug.
- Wednesday, back & shoulders: dumbbell Romanian deadlift, supported row, seated shoulder press, lateral raise or rear-delt fly, glute bridge, plank.
- Friday, full body & carry: reverse lunge, dumbbell bench press, cable lat pulldown, bird dog or side plank, farmer carry.

Selected accessories rotate every two weeks. Add or remove exercises before saving a session; existing saved routines stay unchanged. Log holds and carries in seconds, other movements in reps. The library contains 23 exercises across chest, back, legs, shoulders, arms, core, and carries, using your dumbbells, bench, compatible cable attachments, and mat.

Track food calories and macros, steps, cardio duration and distance, resistance sets/reps/weights, body weight, sleep, water, and notes. Use Profile to replace the placeholder targets and enter your starting weight.

The Fitness tab includes Three.js demonstrations for all 23 resistance exercises, marching, and a gentle overhead reach. Limbs use two-bone inverse kinematics with fixed lengths. Pause, slow down, scrub through the movement, and choose side/front/angle views. The same scenes appear in resistance "How to" dialogs. Reduced-motion preferences pause the illustrations initially. A 2D illustration remains as a WebGL fallback. These are simplified guides, not a professional form assessment.

On phones, the app uses a fixed bottom navigation bar, larger touch controls, a compact exercise picker, and scrollable weekly/history views. Cardio and resistance forms show live calorie previews using your latest recorded weight. Leave the calorie override field empty to keep automatic calculation, including when editing an estimated resistance session. Logging does not happen automatically: enter your activity duration and save the session.

## Private server storage

Set `FITNESS_ACCESS_KEY` to a long random secret and `FITNESS_DATA_DIR` to a private directory outside the public website, such as `/var/lib/benj-fitness`. The server saves `journal.json` atomically and keeps the seven previous revisions as backups. Static routes use an explicit allowlist; the data, source server, and access key are not downloadable. Revision checks prevent one device from silently overwriting another device's work.

In Profile & backup, enter your access key and connect. If the server has a journal, the app asks before replacing local data. If the server is empty, it asks before uploading your local journal. After connecting, local changes save automatically to the VPS; offline changes remain local and can retry when online. Use Download latest to resolve a revision conflict, exporting your local changes first. Remembering the key is optional and specific to each device. Export/import a backup when moving your original local-file journal to the hosted URL.

## Deploy to Hostinger VPS

For Easypanel with a private GitHub repository, use [the Easypanel deployment guide](deploy/easypanel.md) and the root Dockerfile instead of the manual systemd/Nginx steps below.

1. Point the DNS A record for `fitness.benedictjan.com` at your VPS IPv4 address. Add AAAA only if your VPS IPv6 is configured.
2. Copy the project to `/opt/benj-fitness`, including `exercise-library.js`, `assets/vendor.js`, and `assets/gym.jpg`. Do not upload test data, `qa`, or `node_modules`.
3. Create a dedicated `benj-fitness` system user and `/var/lib/benj-fitness` owned by that user. Give the data directory mode 700.
4. Copy `.env.example` to `/etc/benj-fitness.env`. Generate a real key on the VPS with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, set the data directory and `PUBLIC_ORIGIN`, and protect the env file with mode 600. Do not commit or paste the real key into public source.
5. Install `deploy/benj-fitness.service` into systemd, reload the daemon, and enable/start the service. Adjust the Node executable path if needed.
6. Add the dedicated server block from `deploy/nginx.conf` to your existing Nginx configuration. Test the configuration before reloading. Leave the existing main domain configuration intact.
7. Configure HTTPS using your existing certificate tooling before connecting the private journal. Keep Node bound to 127.0.0.1 behind Nginx.

This project has not been deployed to the VPS. No VPS access or DNS connection has been provided in this session. Back up `/var/lib/benj-fitness` outside the VPS too; rolling revisions are not disaster-recovery backups.

Activity energy uses approximate MET values minus resting energy. It does not represent total daily calorie expenditure. Steps are not added to activity calories. Food photo estimates are entered through a manual ChatGPT JSON workflow; the app does not connect to or automate a ChatGPT account.

General activity guidance: https://www.cdc.gov/physical-activity-basics/guidelines/adults.html

Exercise reference cues: https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/weight-training/art-20045842

Run `npm test` for journal, API, authentication, revision, and kinematics checks. Install a Playwright Chromium browser with `npx playwright install chromium`, then run `npm run test:browser` for desktop and 390/320px layouts, all 25 nonblank scenes, playback controls, custom session editing, IndexedDB persistence, and server sync across two browser contexts. Screenshots are saved to `qa`.
