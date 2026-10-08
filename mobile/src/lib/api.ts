import { ApiError } from './errors';
import type {
  AuthResponse,
  DashboardStats,
  Project,
  Task,
  TaskInput,
  User,
} from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

interface Pagination {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

let token: string | null = null;
let unauthorizedHandler: ((message: string) => void) | null = null;

export function configureApi(
  nextToken: string | null,
  onUnauthorized?: (message: string) => void,
) {
  token = nextToken;
  if (onUnauthorized) unauthorizedHandler = onUnauthorized;
}

function unwrap<T>(value: T | { data: T }): T {
  return value && typeof value === 'object' && 'data' in value
    ? (value as { data: T }).data
    : (value as T);
}

function responseError(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const body = payload as {
    message?: string;
    error?: string | { code?: string; message?: string; details?: unknown };
  };
  if (typeof body.error === 'object') return body.error.message;
  return body.message || body.error;
}

async function requestPayload(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  if (!API_URL) throw new ApiError('EXPO_PUBLIC_API_URL is not configured.');

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('No network connection. Check your internet and try again.');
  }

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = text;
  }

  if (response.status === 401) {
    const hadSession = Boolean(token);
    if (hadSession) unauthorizedHandler?.('Your session expired. Please sign in again.');
    throw new ApiError(
      hadSession
        ? 'Your session expired. Please sign in again.'
        : responseError(payload) || 'Email or password is incorrect.',
      401,
      payload,
    );
  }
  if (!response.ok) {
    throw new ApiError(
      responseError(payload) || `Request failed (${response.status}).`,
      response.status,
      payload,
    );
  }
  return payload;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return unwrap((await requestPayload(path, options)) as T | { data: T });
}

async function requestAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const payload = (await requestPayload(
      `${path}${separator}page=${page}&limit=100`,
    )) as { data?: T[]; pagination?: Pagination };
    const pageItems = Array.isArray(payload) ? payload : payload.data;
    if (!pageItems) throw new ApiError('The server returned an invalid list response.');
    items.push(...pageItems);
    if (!payload.pagination?.hasNextPage) return items;
    page = payload.pagination.page + 1;
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (fullName: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<User>('/auth/me'),
  dashboard: () => request<DashboardStats>('/dashboard'),
  projects: () => requestAll<Project>('/projects'),
  project: (id: string) => request<Project>(`/projects/${encodeURIComponent(id)}`),
  tasks: (projectId: string) =>
    requestAll<Task>(`/tasks?projectId=${encodeURIComponent(projectId)}`),
  createTask: (input: TaskInput) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  updateTask: (id: string, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteTask: (id: string) =>
    request<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
