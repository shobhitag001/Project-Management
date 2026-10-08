export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TaskInput {
  name: string;
  description?: string | null;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  projectId: string;
}
