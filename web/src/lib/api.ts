import type {
  DashboardStats,
  Project,
  ProjectInput,
  Task,
  TaskInput,
  User,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type ApiErrorShape = { error?: { message?: string }; message?: string };

interface Pagination {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

interface ApiEnvelope<T> extends ApiErrorShape {
  data?: T;
  pagination?: Pagination;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function requestEnvelope<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const token = localStorage.getItem("pms_token");
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Unable to connect. Check your internet connection and try again.",
      0,
    );
  }

  if (response.status === 204) return {};
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem("pms_token");
      window.dispatchEvent(new CustomEvent("auth-expired"));
    }
    throw new ApiError(
      body.error?.message ?? body.message ?? "Something went wrong.",
      response.status,
    );
  }

  return body;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const body = await requestEnvelope<T>(path, options);
  return body.data as T;
}

async function requestAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await requestEnvelope<T[]>(
      `${path}${separator}page=${page}&limit=100`,
    );
    if (!response.data) {
      throw new ApiError("The server returned an invalid list response.", 500);
    }
    items.push(...response.data);
    if (!response.pagination?.hasNextPage) return items;
    page = response.pagination.page + 1;
  }
}

function queryString(values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

export const api = {
  register: (input: { fullName: string; email: string; password: string }) =>
    request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
  dashboard: () => request<DashboardStats>("/dashboard"),
  projects: (search = "", status = "") =>
    requestAll<Project>(
      `/projects${queryString({ search, status: status || undefined })}`,
    ),
  project: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (input: ProjectInput) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateProject: (id: string, input: ProjectInput) =>
    request<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }),
  tasks: (filters: {
    projectId?: string;
    search?: string;
    status?: string;
    priority?: string;
  }) => requestAll<Task>(`/tasks${queryString(filters)}`),
  task: (id: string) => request<Task>(`/tasks/${id}`),
  createTask: (input: TaskInput) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateTask: (id: string, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
