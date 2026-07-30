import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/**
 * localhost only resolves on the same machine as Metro. On a physical device or
 * simulator/emulator, override this (e.g. via `extra.apiBaseUrl` in app.json) with
 * your computer's LAN IP, e.g. http://192.168.1.20:3000.
 */
export const API_BASE_URL = (extra.apiBaseUrl as string) ?? 'http://localhost:3010';
export const SOCKET_URL = (extra.socketUrl as string) ?? 'http://localhost:3010/realtime';

/** Video/voice calling (LiveKit) is a future paid tier; off until that backend is deployed. */
export const LIVE_VIEW_ENABLED = Boolean(extra.liveViewEnabled);
