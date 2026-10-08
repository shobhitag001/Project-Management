import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TaskForm } from "../components/TaskForm";
import { TaskTable } from "../components/TaskTable";
import { Button, Select, Spinner } from "../components/ui";
import { ApiError, api } from "../lib/api";
import type { Project, Task, TaskInput } from "../types";

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextTasks, nextProjects] = await Promise.all([
        api.tasks({ search, status: status || undefined, priority: priority || undefined }),
        api.projects(),
      ]);
      setTasks(nextTasks);
      setProjects(nextProjects);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [priority, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(input: TaskInput) {
    setBusy(true);
    setError("");
    try {
      if (editing) await api.updateTask(editing.id, input);
      else await api.createTask(input);
      setEditing(undefined);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to save task.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteTask(deleting.id);
      setDeleting(null);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to delete task.");
    } finally {
      setBusy(false);
    }
  }

  async function complete(task: Task) {
    setError("");
    try {
      await api.updateTask(task.id, { status: "COMPLETED" });
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to update task.");
    }
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Tasks</h1>
          <p className="muted">Find and manage work across every project.</p>
        </div>
        <Button onClick={() => setEditing(null)} disabled={!projects.length}>
          <Plus size={18} /> New task
        </Button>
      </header>
      <div className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Search tasks"
            placeholder="Search tasks…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <Select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        <Select
          label="Priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <Spinner label="Loading tasks" />
      ) : (
        <section className="panel table-panel">
          <TaskTable
            tasks={tasks}
            showProject
            onEdit={setEditing}
            onDelete={setDeleting}
            onComplete={(task) => void complete(task)}
          />
        </section>
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
            <h2>{editing ? "Edit task" : "Create task"}</h2>
            <p className="muted">Keep the next action clear and easy to own.</p>
            <TaskForm
              task={editing ?? undefined}
              projects={projects}
              busy={busy}
              onCancel={() => setEditing(undefined)}
              onSubmit={save}
            />
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete task?"
        message={`“${deleting?.name ?? ""}” will be permanently deleted.`}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
