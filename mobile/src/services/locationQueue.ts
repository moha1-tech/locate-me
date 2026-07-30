import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLocationPing, LocationPingInput } from '../api/locations';

const QUEUE_KEY = 'locateme_pending_location_pings';
/** Caps the queue so a phone offline for days doesn't grow this unbounded; oldest pings are dropped first. */
const MAX_QUEUE_SIZE = 500;

async function readQueue(): Promise<LocationPingInput[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(queue: LocationPingInput[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)));
}

export async function enqueuePing(ping: LocationPingInput) {
  const queue = await readQueue();
  queue.push(ping);
  await writeQueue(queue);
}

/** Sends a ping immediately; if that fails (offline/server unreachable), queues it for later. */
export async function sendOrQueuePing(ping: LocationPingInput) {
  try {
    await flushQueuedPings();
    await sendLocationPing(ping);
  } catch {
    await enqueuePing(ping);
  }
}

export async function flushQueuedPings() {
  const queue = await readQueue();
  if (queue.length === 0) {
    return;
  }
  const remaining: LocationPingInput[] = [];
  for (const ping of queue) {
    try {
      await sendLocationPing(ping);
    } catch {
      remaining.push(ping);
    }
  }
  await writeQueue(remaining);
}

export async function getQueueLength() {
  return (await readQueue()).length;
}
