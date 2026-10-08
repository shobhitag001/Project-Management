import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Project, Task, TaskInput } from "../types";
import { Button, Input, Select, Textarea } from "./ui";

const schema = z.object({
  projectId: z.string().min(1, "Choose a project."),
  name: z.string().trim().min(1, "Task name is required.").max(120),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  dueDate: z.string().min(1, "Due date is required."),
});

export function TaskForm({
  task,
  projects,
  defaultProjectId,
  lockProject,
  busy,
  onCancel,
  onSubmit,
}: {
  task?: Task;
  projects: Project[];
  defaultProjectId?: string;
  lockProject?: boolean;
  busy: boolean;
  onCancel(): void;
  onSubmit(input: TaskInput): Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(schema),
    defaultValues: task
      ? {
          projectId: task.projectId,
          name: task.name,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate.slice(0, 10),
        }
      : {
          projectId: defaultProjectId ?? "",
          name: "",
          description: "",
          priority: "MEDIUM",
          status: "PENDING",
          dueDate: "",
        },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {lockProject ? (
        <label className="field">
          <span>Project</span>
          <input
            readOnly
            value={projects.find((project) => project.id === defaultProjectId)?.name ?? ""}
          />
          <input type="hidden" {...register("projectId")} />
        </label>
      ) : (
        <Select label="Project" {...register("projectId")}>
          <option value="">Choose a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      )}
      {errors.projectId && <small className="field-error">{errors.projectId.message}</small>}
      <Input
        label="Task name"
        placeholder="Review final designs"
        error={errors.name?.message}
        {...register("name")}
      />
      <Textarea
        label="Description"
        rows={3}
        placeholder="Add the details needed to finish this task."
        error={errors.description?.message}
        {...register("description")}
      />
      <div className="form-row">
        <Select label="Priority" {...register("priority")}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
        <Select label="Status" {...register("status")}>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </div>
      <Input
        label="Due date"
        type="date"
        error={errors.dueDate?.message}
        {...register("dueDate")}
      />
      <div className="modal-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={busy}>
          {busy ? "Saving…" : task ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
