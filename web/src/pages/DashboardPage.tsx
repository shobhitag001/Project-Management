import {
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  FolderKanban,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Badge, Button, EmptyState, Spinner } from "../components/ui";
import { ApiError, api } from "../lib/api";
import type { DashboardStats, Project, Task } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.dashboard(), api.projects(), api.tasks({})])
      .then(([nextStats, nextProjects, nextTasks]) => {
        setStats(nextStats);
        setProjects(nextProjects.slice(0, 4));
        setTasks(
          [...nextTasks]
            .filter((task) => task.status !== "COMPLETED")
            .sort(
              (a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
            )
            .slice(0, 5),
        );
      })
      .catch((caught) =>
        setError(caught instanceof ApiError ? caught.message : "Unable to load dashboard."),
      );
  }, []);

  if (!stats && !error) return <Spinner label="Loading dashboard" />;

  const cards = stats
    ? [
        ["Total projects", stats.totalProjects, FolderKanban, "violet"],
        ["Total tasks", stats.totalTasks, ClipboardList, "blue"],
        ["Completed tasks", stats.completedTasks, CheckCircle2, "green"],
        ["Pending tasks", stats.pendingTasks, CircleDashed, "amber"],
        ["Projects in progress", stats.projectsInProgress, TrendingUp, "pink"],
      ] as const
    : [];

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Good to see you, {user?.fullName.split(" ")[0]}</h1>
          <p className="muted">Here’s what’s moving across your workspace.</p>
        </div>
        <Link to="/projects">
          <Button>View projects</Button>
        </Link>
      </header>
      {error && <div className="alert error">{error}</div>}
      <section className="stats-grid">
        {cards.map(([label, value, Icon, color]) => (
          <article className="stat-card" key={label}>
            <span className={`icon-box ${color}`}>
              <Icon size={21} />
            </span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent projects</h2>
              <p>Quickly jump back into your work.</p>
            </div>
            <Link to="/projects">View all</Link>
          </div>
          {projects.length ? (
            <div className="project-list compact-list">
              {projects.map((project) => (
                <Link to={`/projects/${project.id}`} key={project.id}>
                  <div>
                    <strong>{project.name}</strong>
                    <span>{project._count?.tasks ?? 0} tasks</span>
                  </div>
                  <Badge value={project.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No projects yet">
              Create your first project to see activity here.
            </EmptyState>
          )}
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Upcoming tasks</h2>
              <p>Your nearest active deadlines.</p>
            </div>
            <Link to="/tasks">View all</Link>
          </div>
          {tasks.length ? (
            <div className="task-list compact-list">
              {tasks.map((task) => (
                <Link to={`/projects/${task.projectId}`} key={task.id}>
                  <div>
                    <strong>{task.name}</strong>
                    <span>
                      Due{" "}
                      {new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(task.dueDate))}
                    </span>
                  </div>
                  <Badge value={task.priority} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="All clear">
              You have no active tasks with upcoming deadlines.
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}
