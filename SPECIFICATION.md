# LocateMe — Product & Technical Specification

## 1. Problem statement
People living with Alzheimer's or other dementias frequently wander, become disoriented, or lose track of their location. Family caregivers need a simple, low-friction way to:
- See where their relative is in real time.
- See what the relative is currently seeing (live camera feed) to help re-orient them or guide them home over the phone.
- Get alerted automatically if the relative leaves a safe area, the phone battery is critical, or the patient triggers an SOS.

Two user roles, two very different UI needs:
- **Patient app**: extremely simple, near zero-interaction, large text, minimal cognitive load, must survive being ignored for days.
- **Caregiver app**: map-first dashboard, multi-relative support, alert history, remote camera view.

## 2. Personas
| Persona | Needs | Constraints |
|---|---|---|
| Patient (person with Alzheimer's) | Feel safe, not surveilled-on-purpose, minimal steps | Forgets to charge phone, forgets app exists, may accidentally close app, poor fine motor control, may not consent to complex flows |
| Primary caregiver (adult child/spouse) | Real-time location, live camera, alert history, "call now" | Needs this to work even when not actively looking, wants push alerts not polling |
| Secondary caregivers (siblings, professional carer) | Shared visibility, no admin rights | Invited by primary caregiver, view-only by default |

## 3. Core features (MVP)
1. **Live location tracking** — background GPS with adjustable update frequency, shown on a map in the caregiver app.
2. **Location history / breadcrumb trail** — last 24-72h path, timestamped.
3. **Remote live camera ("see through their eyes")** — caregiver can request a live view from the patient's rear or front camera. Patient side requires zero interaction (auto-accept after a short grace period, or a single big "Share my view" button).
4. **Geofencing ("safe zones")** — caregiver defines one or more safe areas (home, daycare center); automatic push alert the moment the patient exits.
5. **SOS button** — one giant button on the patient app: alerts all caregivers with location + optionally opens a call.
6. **Two-way voice/video call** — one-tap call from caregiver to patient app, auto-answer option for patients who struggle to tap "accept."
7. **Battery / connectivity health alerts** — notify caregiver when patient's phone battery is low or the app has lost location/connectivity for X minutes.
8. **Caregiver circle management** — invite/remove secondary caregivers, permission levels (admin vs. view-only).
9. **Alert & activity log** — auditable history of geofence exits, SOS triggers, low battery events, for review with doctors/family.

### Phase 2 (post-MVP)
- Fall detection (accelerometer + on-device ML).
- Daily routine anomaly detection (e.g., "usually home by 6pm, still out at 8pm").
- Medication reminders synced to caregiver.
- Voice reassurance messages recorded by caregiver, played automatically when patient leaves a safe zone ("It's okay Mom, head back toward the blue door").
- Integration with wearables (Apple Watch / Wear OS) for patients who won't reliably carry a phone.

## 4. Non-functional requirements
- **Cross-platform**: single codebase targeting iOS and Android (see Section 6).
- **Accessibility**: WCAG-aligned, large tap targets (min 64dp), high contrast, adjustable font scale up to 200%, no multi-step flows on the patient side, voice-guided prompts optional.
- **Battery efficiency**: adaptive location sampling (dense while moving, sparse while stationary) — this is the single biggest driver of whether the patient's phone survives a full day. Do not implement a naive `setInterval` GPS poll.
- **Offline resilience**: patient app must queue location pings and reconnect automatically; must not require the patient to "log back in."
- **Privacy & consent**: this is a surveillance-adjacent product for a vulnerable population. Legal/ethical guardrails:
  - Explicit consent flow at onboarding, ideally captured with/by a legal guardian where the patient cannot meaningfully consent.
  - Data minimization: raw video from the camera feature should be transient (streamed, not stored) unless the caregiver explicitly saves a clip.
  - Location and health-adjacent data (battery, alerts) should be treated as sensitive personal data: encrypt in transit (TLS) and at rest (AES-256), and if you operate in the EU, this is GDPR "special category" territory (health data) requiring a lawful basis beyond simple consent (Article 9) — get a lawyer to sign off before launch, not after.
  - In the US, decide early whether you are in HIPAA scope (are caregivers/clinicians "covered entities"? Usually not for a direct-to-consumer app, but confirm with counsel — it changes your entire data architecture if yes).
- **Reliability of alerts**: geofence and SOS alerts must be push, not poll — use APNs (iOS) and FCM (Android) with high-priority/background delivery, and a server-side retry/escalation if the primary caregiver doesn't acknowledge within N minutes (escalate to secondary caregiver).

## 5. High-level architecture

```
┌─────────────────┐        ┌─────────────────┐
│  Patient App     │        │ Caregiver App    │
│ (React Native)   │        │ (React Native)   │
│ - bg location    │        │ - map view       │
│ - camera share   │        │ - live camera    │
│ - SOS button     │        │ - alerts inbox   │
└───────┬──────────┘        └───────┬──────────┘
        │ WebSocket/MQTT (location, presence)
        │ WebRTC (live camera/voice, peer-to-peer via SFU)
        ▼                           ▼
┌───────────────────────────────────────────────┐
│              Backend (API + Realtime)          │
│  - Auth & caregiver-circle service              │
│  - Location ingest + geofence evaluation        │
│  - Push notification dispatcher (APNs/FCM)      │
│  - WebRTC signaling server / SFU (LiveKit)      │
│  - Alert/audit log store                        │
└───────────────────────────────────────────────┘
        │                           │
        ▼                           ▼
   PostgreSQL + PostGIS        Object storage (optional
   (location, geofences,       clip storage, S3-compatible)
   users, alerts)
```

## 6. Recommended tech stack

### Mobile (one codebase, both platforms)
- **React Native** (with Expo bare/dev-client, or plain RN CLI) is the pragmatic default: one team, one codebase, mature ecosystem for exactly the pieces you need (background geolocation, WebRTC, push).
  - Flutter is a reasonable alternative with equally strong background-location and WebRTC plugins; choose it if your team already has Dart/Flutter experience. Otherwise React Native has a larger hiring pool and more prior art for this exact app category (see Section 8).
- **Background location**: [`react-native-background-geolocation`](https://github.com/transistorsoft/react-native-background-geolocation) (Transistorsoft) — native Swift/Kotlin under the hood, motion-aware (accelerometer-gated), documented ~70% battery savings vs. naive polling. This is the one paid dependency worth budgeting for; the free alternatives (`react-native-geolocation-service`, Expo Location) are fine for foreground tracking but weak for reliable Android background/killed-app behavior, which is exactly the scenario that matters for this app.
- **Live camera / video call**: [`react-native-webrtc`](https://github.com/react-native-webrtc/react-native-webrtc) for the peer connection, plus a hosted SFU rather than rolling your own signaling/TURN infrastructure:
  - **LiveKit** (open source, self-hostable, has an official React Native SDK) — best fit if you want to self-host and control cost.
  - **Twilio Video** or **Agora** — best fit if you want a managed service and are willing to pay per minute early on.
- **Maps**: Mapbox (better custom styling, geofence drawing tools) or Google Maps SDK (cheaper at low volume, more familiar to users).
- **Push**: Firebase Cloud Messaging for Android, APNs for iOS (usually both wrapped behind FCM, or via a service like OneSignal to avoid maintaining two push pipelines).

### Backend
- **Node.js (NestJS or Express) or Go** for the API + realtime layer — either is fine; NestJS if your team wants structure/DI, Go if you want raw performance for the location-ingest hot path.
- **PostgreSQL + PostGIS** for geofence math (point-in-polygon, distance queries) — don't reinvent this in application code.
- **Redis** for presence/ephemeral state (who's currently online, current in-flight camera sessions).
- **WebSocket or MQTT** for location streaming (MQTT is more battery/bandwidth-friendly for a mobile client that reconnects often — consider it over raw WebSockets if you outgrow the simplest approach).

## 7. Similar / reference open-source repositories
None of these are production-ready for this use case out of the box, but each covers a meaningful slice you can learn from or fork pieces of:

- [SanahSidhu/DementiaCare](https://github.com/SanahSidhu/DementiaCare) — closest thing to a direct precedent: React Native + Django app for early-stage dementia patients (reminders, caregiver sync). **Inactive since ~2022** (4 stars, no live-location feature ever shipped) — useful for UX ideas, not as a codebase to build on.
- [vikrantnegi/react-native-location-tracking](https://github.com/vikrantnegi/react-native-location-tracking) and [vikrantnegi/tracker-app](https://github.com/vikrantnegi/tracker-app) — small, readable examples of real-time location tracking + path drawing in React Native. Good for learning the pattern, too small for production.
- [anchetaWern/locSharer](https://github.com/anchetaWern/locSharer) — minimal React Native location-sharing app, good starter reference for the sharing/permissions model.
- [AnuradhaIyer/Location-Tracker](https://github.com/AnuradhaIyer/Location-Tracker) — family/kids location tracker using Firebase Firestore; relevant for the caregiver-circle data model even though the audience differs.
- [navtrack/navtrack](https://github.com/navtrack/navtrack) — full GPS tracking platform (.NET + React), more mature/production-grade architecture reference for the backend/dashboard side even though it targets vehicle/asset tracking, not people.
- **WebRTC layer**: [react-native-webrtc/react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) and [LiveKit's repos](https://github.com/livekit) for the live-camera and calling feature — these are production-grade and safe to build directly on top of, unlike the location-tracker demos above.
- **Background geolocation**: [transistorsoft/react-native-background-geolocation](https://github.com/transistorsoft/react-native-background-geolocation) — production-grade, actively maintained (releases within days as of this writing), this is the one to actually depend on rather than take inspiration from.

**Bottom line**: there is no single repo to fork and rebrand. The realistic path is (a) build the mobile shell yourselves, (b) depend directly on the two production-grade libraries above for background location and WebRTC, and (c) use the small demo repos only as UX/pattern references.

## 8. Tools to visualize UI and backend in parallel
Since two different people/tracks (product UI and backend architecture) can move at once:

- **UI/UX prototyping**: **Figma** for screens and a clickable prototype of both the patient app (should be reviewable by a non-technical caregiver focus group before you write code, given how easy it is to over-design for this audience) and the caregiver dashboard. Pair it with **Figma's dev mode** to hand off spacing/assets directly to the RN team.
- **Architecture diagrams**: **Excalidraw** (fast, informal, great for the sketch in Section 5 above) for early architecture discussions, or **Mermaid** (renders directly in Markdown/GitHub, and in Claude artifacts) if you want the diagram to live in version control next to this spec rather than in a separate design tool.
- **API design in parallel with UI**: define the REST/WebSocket contracts early with **Swagger/OpenAPI** (or **Postman** collections) so the mobile team can build against a mocked API (e.g., Postman Mock Server or `msw`) while the backend is still being implemented — this is the key trick for letting frontend and backend move genuinely in parallel instead of frontend waiting on backend.
- **Realtime/whiteboard collaboration**: if the caregiver and patient flows need to be whiteboarded live with a team, **FigJam** or **Excalidraw+** (multiplayer) covers that.
- **End-to-end app builders** (optional, faster but less control): tools like RapidNative or CatDoes can generate a working React Native scaffold directly from Figma designs or prompts — worth a look for a throwaway clickable demo to show investors/family test users early, but expect to replace the generated code before this handles real patient data.

## 9. Suggested phased roadmap
1. **Weeks 1-3**: Spec sign-off (this doc), Figma prototype of both apps, legal/privacy review of the consent flow, choose managed WebRTC provider.
2. **Weeks 4-8**: MVP build — auth, caregiver-circle invite flow, background location + map, geofencing, push alerts, SOS button.
3. **Weeks 9-11**: Live camera/video call feature, alert escalation logic, battery/connectivity health alerts.
4. **Weeks 12+**: Closed pilot with a small number of real families, iterate on the patient-side UX specifically (this is where most of these products succeed or fail), then Phase 2 features.

## 10. Open questions to resolve before build
- Does the patient need their *own* Apple ID/Google account, or is this fully managed by the caregiver (device provisioning as a "family member" device)?
- What is the fallback when the patient's phone has no signal or is off — do you support a dedicated wearable/tracker hardware integration (e.g., a GPS pendant) as a companion, given phones are frequently left behind?
- Who is liable if the app fails to alert in time and the patient comes to harm? This should shape both the escalation design (Section 4) and your terms of service, and should get input from your lawyer.
