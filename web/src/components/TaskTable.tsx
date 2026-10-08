import { Check, Edit3, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { Badge, Button, EmptyState } from "./ui";

export function TaskTable({
  tasks,
  showProject = false,
  onEdit,
  onDelete,
  onComplete,
}: {
  tasks: Task[];
  showProject?: boolean;
  onEdit(task: Task): void;
  onDelete(task: Task): void;
  onComplete(task: Task): void;
}) {
  if (!tasks.length) {
    return (
      <EmptyState title="No tasks found">
        Add a task or adjust the current search and filters.
      </EmptyState>
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            {showProject && <th>Project</th>}
            <th>Priority</th>
            <th>Status</th>
            <th>Due date</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <strong>{task.name}</strong>
                <small>{task.description}</small>
              </td>
              {showProject && <td>{task.project?.name ?? "Project"}</td>}
              <td><Badge value={task.priority} /></td>
              <td><Badge value={task.status} /></td>
              <td>
                {new Intl.DateTimeFormat(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(task.dueDate))}
              </td>
              <td>
                <div className="card-actions">
                  {task.status !== "COMPLETED" && (
                    <Button
                      variant="ghost"
                      aria-label={`Complete ${task.name}`}
                      title="Mark completed"
                      onClick={() => onComplete(task)}
                    >
                      <Check size={17} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    aria-label={`Edit ${task.name}`}
                    onClick={() => onEdit(task)}
                  >
                    <Edit3 size={17} />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Delete ${task.name}`}
                    onClick={() => onDelete(task)}
                  >
                    <Trash2 size={17} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
