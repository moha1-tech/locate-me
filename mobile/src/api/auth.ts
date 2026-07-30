import { apiClient } from './client';
import { AuthUser, Role } from '../types';

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export function register(email: string, password: string, name: string, role: Role) {
  return apiClient
    .post<AuthResponse>('/auth/register', { email, password, name, role })
    .then((res) => res.data);
}

export function login(email: string, password: string) {
  return apiClient.post<AuthResponse>('/auth/login', { email, password }).then((res) => res.data);
}
