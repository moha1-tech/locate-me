# LocateMe

Cross-platform (iOS + Android) location, geofencing, and SOS app for people with Alzheimer's/dementia and their caregivers. See [SPECIFICATION.md](SPECIFICATION.md) for the full product spec.

## Layout

```
backend/     NestJS + Prisma + PostgreSQL API, realtime (Socket.io), geofencing logic
mobile/      Expo (React Native, TypeScript) app — one codebase, two experiences (patient vs caregiver)
reference/   Cloned reference repos (UX inspiration only, not dependencies — see below)
SPECIFICATION.md
```

## What's implemented and verified working

**Backend** (tested end-to-end with real HTTP requests against a real Postgres instance):
- Auth (register/login, JWT) for both `PATIENT` and `CAREGIVER` roles
- Caregiver circles: a patient account auto-creates a circle; caregivers are invited by email and accept
- Location ping ingestion, latest/history queries
- Geofencing (circular zones, Haversine-based) — automatically fires a `GEOFENCE_EXIT` alert the first time a ping lands outside a zone, with a 15-minute cooldown to avoid alert spam
- Low-battery alerts (≤15%, 1-hour cooldown) and SOS alerts
- Realtime push of location updates and alerts to caregivers over Socket.io, scoped per-circle
- **LiveKit access-token generation** (`GET /circles/:circleId/live-token`), verified end-to-end against a self-hosted LiveKit dev server (see below)
- **Push notification dispatch**: every alert also fans out to each accepted caregiver's registered Expo push token via `expo-server-sdk` (`PATCH /users/me/push-token` to register one)

**Mobile app** (type-checks clean, Expo config validated):
- Shared auth flow (Welcome/Login/Register), role-aware routing to either the patient or caregiver experience
- **Patient app**: large-text, low-interaction UI. One-tap SOS button, automatic location sharing on launch, a "share my view" screen that **really streams live camera + mic to caregivers** over LiveKit/WebRTC
- **Caregiver app**: live map with the patient's marker and safe-zone overlays, a **live view** screen that plays the patient's real live video/audio stream, alerts feed (with acknowledge), safe-zone management (add a zone at your current location), circle management (invite/list members)
- **Offline-tolerant location pings**: if a ping fails to send (no connectivity), it's queued in `AsyncStorage` and retried opportunistically before every subsequent ping, capped at 500 queued pings
- **Push notification registration**: caregivers register for push on login; requires an EAS project ID to actually receive a token (see below)

### Live video/audio streaming (LiveKit)

Self-hosted, not a cloud dependency: `docker-compose.yml` runs `livekit/livekit-server --dev` on `localhost:7880-7882` with built-in placeholder credentials (`devkey`/`secret`) — no external account needed for local dev. The backend mints a per-circle, per-user access token; the patient's `ShareViewScreen` publishes camera+mic into a room named `circle-{circleId}`, and the caregiver's `LiveViewScreen` subscribes to it. **Requires a custom dev client, not Expo Go** (native WebRTC module). For production you'd either keep self-hosting LiveKit on a real server or switch to LiveKit Cloud/Twilio/Agora — nothing else in the code needs to change, just the `LIVEKIT_URL`/`LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` env vars.

## What's stubbed / not yet wired up

Being upfront about this so nothing here is mistaken for production-ready:

1. **Push notifications need an EAS project ID.** The code path (register token → backend saves it → every alert pushes to it) is fully wired, but `Notifications.getExpoPushTokenAsync()` needs a real EAS project ID (`app.json` → `extra.eas.projectId`) to return a usable token. Run `eas init` in `mobile/` to get one — no Firebase/Apple account needed to generate it, though production push credentials still route through EAS.
2. **Background location tracking uses `expo-location` + TaskManager**, not the commercial `react-native-background-geolocation` (Transistorsoft) library recommended in the spec for production-grade battery efficiency. It works, but expect noticeably worse battery life and less reliable "killed app" behavior on Android than the paid library would give you. This one genuinely needs a purchased license to close — nothing to build around that.
3. **Geofences are circles only** (center + radius), not arbitrary polygons. Fine for "home", "daycare", etc.; revisit if you need irregular boundaries.
4. **LiveKit's `--dev` mode is explicitly documented as insecure for production** (placeholder credentials, single node, no TURN/TLS setup) — fine for local dev and testing, but swap in real credentials and a proper deployment before real patients use this.

## Running it locally

### Backend
```
cd backend
cp .env.example .env      # already done in this checkout; regenerate JWT_SECRET for anything beyond local dev
docker compose up -d      # Postgres on :5433, Redis on :6380, LiveKit on :7880-7882
npm install
npx prisma migrate dev
npm run start:dev         # http://localhost:3010
```
Ports 3000/5432/6379 were already taken by other local projects on this machine, so this project uses 3010/5433/6380 instead (LiveKit's 7880-7892 range was free) — adjust freely if that's not the case for you.

### Mobile
```
cd mobile
npm install                # already done in this checkout
npx expo start
```
- Runs fine in **Expo Go** for UI/navigation/API work.
- **Background location, live camera streaming, and push notifications all require a custom dev client**, not Expo Go (`npx expo run:android` / `npx expo run:ios`, or an EAS development build) — this is an Expo SDK 57 platform requirement for these native modules, not a bug.
- On a physical device, `mobile/app.json`'s `extra.apiBaseUrl` / `extra.socketUrl` (currently `http://localhost:3010`) must point at your computer's LAN IP instead of `localhost`, since `localhost` on the phone means the phone itself. Same applies to the LiveKit `url` returned by `/live-token` if you test on a physical device — the backend currently returns `ws://localhost:7880`, which only resolves on the same machine.

## What you need to provide before this goes further

- **An EAS project ID** (`eas init` in `mobile/`, needs a free Expo account) — the one remaining piece for push notifications to actually deliver a token.
- **Google Maps API key (Android only)** — `react-native-maps` uses Apple Maps on iOS for free, but Android requires a Google Maps API key added to `mobile/app.json` under `android.config.googleMaps.apiKey`. Get one from the Google Cloud Console.
- **Apple Developer Program account** ($99/yr) and **Google Play Console account** ($25 one-time) when you're ready to build and publish real device/store builds — also needed for production push credentials (APNs) and to move off LiveKit's insecure `--dev` mode.
- **A decision on hosting** for the backend + Postgres + LiveKit (Railway/Render/Fly.io are the low-effort options; AWS/GCP if you want more control, or LiveKit Cloud specifically for the streaming piece) — everything above only runs locally right now.
- **Legal/privacy sign-off** on the consent flow before onboarding a real patient — see SPECIFICATION.md §4 for why (GDPR "special category" data, HIPAA scoping question).

## Reference repo

`reference/DementiaCare` is cloned locally purely for UX inspiration (its reminder/calendar screens) — it's inactive since 2022 and has none of this app's core features (location, geofencing, camera, SOS), so nothing here depends on it. See `reference/DementiaCare/LICENSE` before reusing any of its actual code, not just its UI ideas.
