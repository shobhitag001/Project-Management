import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Project, ProjectInput } from "../types";
import { Button, Input, Select, Textarea } from "./ui";

const schema = z
  .object({
    name: z.string().trim().min(1, "Project name is required.").max(120),
    description: z.string().trim().min(1, "Description is required.").max(2000),
    status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  });

export function ProjectForm({
  project,
  busy,
  onCancel,
  onSubmit,
}: {
  project?: Project;
  busy: boolean;
  onCancel(): void;
  onSubmit(input: ProjectInput): Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(schema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.startDate.slice(0, 10),
          endDate: project.endDate.slice(0, 10),
        }
      : {
          name: "",
          description: "",
          status: "NOT_STARTED",
          startDate: "",
          endDate: "",
        },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Project name"
        placeholder="Website redesign"
        error={errors.name?.message}
        {...register("name")}
      />
      <Textarea
        label="Description"
        rows={4}
        placeholder="What does success look like?"
        error={errors.description?.message}
        {...register("description")}
      />
      <Select label="Status" {...register("status")}>
        <option value="NOT_STARTED">Not started</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="COMPLETED">Completed</option>
      </Select>
      <div className="form-row">
        <Input
          label="Start date"
          type="date"
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <Input
          label="End date"
          type="date"
          error={errors.endDate?.message}
          {...register("endDate")}
        />
      </div>
      <div className="modal-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={busy}>
          {busy ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
