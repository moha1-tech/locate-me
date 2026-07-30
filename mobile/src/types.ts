export type Role = 'PATIENT' | 'CAREGIVER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface CircleMember {
  id: string;
  caregiverId: string;
  permission: 'ADMIN' | 'VIEW_ONLY';
  status: 'PENDING' | 'ACCEPTED';
  caregiver: AuthUser;
}

export interface Circle {
  id: string;
  patientId: string;
  patient?: AuthUser;
  members: CircleMember[];
}

export interface PendingInvite {
  circleId: string;
  permission: 'ADMIN' | 'VIEW_ONLY';
  patient: AuthUser;
}

export interface LocationPing {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  batteryLevel?: number;
  recordedAt: string;
}

export interface Geofence {
  id: string;
  circleId: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}

export type AlertType = 'SOS' | 'GEOFENCE_EXIT' | 'LOW_BATTERY' | 'CONNECTIVITY_LOST';

export interface AppAlert {
  id: string;
  circleId: string;
  type: AlertType;
  message: string;
  latitude?: number;
  longitude?: number;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}
