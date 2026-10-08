export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  project?: Pick<Project, "id" | "name">;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

export interface ProjectInput {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

export interface TaskInput {
  projectId: string;
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}
