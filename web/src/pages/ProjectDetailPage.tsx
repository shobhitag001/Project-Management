import { ArrowLeft, Edit3, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ProjectForm } from "../components/ProjectForm";
import { TaskForm } from "../components/TaskForm";
import { TaskTable } from "../components/TaskTable";
import { Badge, Button, Spinner } from "../components/ui";
import { ApiError, api } from "../lib/api";
import type { Project, ProjectInput, Task, TaskInput } from "../types";

export function ProjectDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [taskEditing, setTaskEditing] = useState<Task | null | undefined>(undefined);
  const [projectEditing, setProjectEditing] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteProject, setDeleteProject] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [nextProject, nextTasks] = await Promise.all([
        api.project(id),
        api.tasks({ projectId: id }),
      ]);
      setProject(nextProject);
      setTasks(nextTasks);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to load project.");
    }
  }, [id]);

  useEffect(() => void load(), [load]);

  async function saveProject(input: ProjectInput) {
    setBusy(true);
    try {
      await api.updateProject(id, input);
      setProjectEditing(false);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to save project.");
    } finally {
      setBusy(false);
    }
  }

  async function saveTask(input: TaskInput) {
    setBusy(true);
    try {
      if (taskEditing) await api.updateTask(taskEditing.id, input);
      else await api.createTask(input);
      setTaskEditing(undefined);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to save task.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTask() {
    if (!deletingTask) return;
    setBusy(true);
    try {
      await api.deleteTask(deletingTask.id);
      setDeletingTask(null);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to delete task.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProject() {
    setBusy(true);
    try {
      await api.deleteProject(id);
      navigate("/projects");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to delete project.");
      setBusy(false);
    }
  }

  async function complete(task: Task) {
    try {
      await api.updateTask(task.id, { status: "COMPLETED" });
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to update task.");
    }
  }

  if (!project && !error) return <Spinner label="Loading project" />;

  return (
    <div>
      <Link className="back-link" to="/projects">
        <ArrowLeft size={17} /> Back to projects
      </Link>
      {error && <div className="alert error">{error}</div>}
      {project && (
        <>
          <header className="detail-header">
            <div>
              <Badge value={project.status} />
              <h1>{project.name}</h1>
              <p>{project.description}</p>
              <div className="date-pair">
                <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="header-actions">
              <Button variant="secondary" onClick={() => setProjectEditing(true)}>
                <Edit3 size={17} /> Edit
              </Button>
              <Button variant="danger" onClick={() => setDeleteProject(true)}>
                <Trash2 size={17} /> Delete
              </Button>
            </div>
          </header>
          <section className="panel table-panel">
            <div className="panel-header padded">
              <div>
                <h2>Project tasks</h2>
                <p>{tasks.length} task{tasks.length === 1 ? "" : "s"} in this project</p>
              </div>
              <Button onClick={() => setTaskEditing(null)}>
                <Plus size={17} /> Add task
              </Button>
            </div>
            <TaskTable
              tasks={tasks}
              onEdit={setTaskEditing}
              onDelete={setDeletingTask}
              onComplete={(task) => void complete(task)}
            />
          </section>
        </>
      )}
      {projectEditing && project && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setProjectEditing(false)}>
          <div className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <h2>Edit project</h2>
            <ProjectForm
              project={project}
              busy={busy}
              onCancel={() => setProjectEditing(false)}
              onSubmit={saveProject}
            />
          </div>
        </div>
      )}
      {taskEditing !== undefined && project && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setTaskEditing(undefined)}>
          <div className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <h2>{taskEditing ? "Edit task" : "Create task"}</h2>
            <TaskForm
              task={taskEditing ?? undefined}
              projects={[project]}
              defaultProjectId={project.id}
              lockProject
              busy={busy}
              onCancel={() => setTaskEditing(undefined)}
              onSubmit={saveTask}
            />
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete task?"
        message={`“${deletingTask?.name ?? ""}” will be permanently deleted.`}
        busy={busy}
        onCancel={() => setDeletingTask(null)}
        onConfirm={() => void removeTask()}
      />
      <ConfirmDialog
        open={deleteProject}
        title="Delete project?"
        message={`This will permanently delete “${project?.name ?? ""}” and all its tasks.`}
        busy={busy}
        onCancel={() => setDeleteProject(false)}
        onConfirm={() => void removeProject()}
      />
    </div>
  );
}
