import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ProjectForm } from "../components/ProjectForm";
import { Badge, Button, EmptyState, Select, Spinner } from "../components/ui";
import { ApiError, api } from "../lib/api";
import type { Project, ProjectInput } from "../types";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProjects(await api.projects(search, status));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(input: ProjectInput) {
    setBusy(true);
    setError("");
    try {
      if (editing) await api.updateProject(editing.id, input);
      else await api.createProject(input);
      setEditing(undefined);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to save project.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteProject(deleting.id);
      setDeleting(null);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to delete project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Projects</h1>
          <p className="muted">Plan the work and keep every goal in view.</p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus size={18} /> New project
        </Button>
      </header>
      <div className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Search projects"
            placeholder="Search projects…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <Select
          label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="NOT_STARTED">Not started</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <Spinner label="Loading projects" />
      ) : projects.length ? (
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="card-top">
                <Badge value={project.status} />
                <div className="card-actions">
                  <Button
                    variant="ghost"
                    aria-label={`Edit ${project.name}`}
                    onClick={() => setEditing(project)}
                  >
                    <Edit3 size={17} />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Delete ${project.name}`}
                    onClick={() => setDeleting(project)}
                  >
                    <Trash2 size={17} />
                  </Button>
                </div>
              </div>
              <Link to={`/projects/${project.id}`}>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
              </Link>
              <footer>
                <span>{project._count?.tasks ?? 0} tasks</span>
                <span>
                  {new Intl.DateTimeFormat(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(project.endDate))}
                </span>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={search || status ? "No matching projects" : "Start your first project"}>
          {search || status
            ? "Try changing the search or status filter."
            : "Create a project to organize tasks and track progress."}
        </EmptyState>
      )}
      {editing !== undefined && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setEditing(undefined)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2>{editing ? "Edit project" : "Create project"}</h2>
            <p className="muted">Dates and status help everyone understand progress.</p>
            <ProjectForm
              project={editing ?? undefined}
              busy={busy}
              onCancel={() => setEditing(undefined)}
              onSubmit={save}
            />
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete project?"
        message={`This will permanently delete “${deleting?.name ?? ""}” and every task inside it.`}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
