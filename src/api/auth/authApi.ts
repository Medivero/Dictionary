import { http } from '../http';

export type AuthUser = { id: string; username: string };
export type AuthResponse = { token: string; user: AuthUser };

export async function login(username: string, password: string) {
  const resp = await http.post<AuthResponse>('api/auth/login', {
    username,
    password,
  });
  return resp.data;
}

export async function register(username: string, password: string) {
  const resp = await http.post<AuthResponse>('api/auth/register', {
    username,
    password,
  });
  return resp.data;
}

export async function me() {
  const resp = await http.get<{ user: AuthUser }>('api/auth/me');
  return resp.data;
}

export async function logout() {
  const resp = await http.post<{ success: true }>('api/auth/logout');
  return resp.data;
}

