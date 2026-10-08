import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamsSchema } from "../schemas/common.js";
import {
  createTaskSchema,
  taskQuerySchema,
  type CreateTaskInput,
  type TaskQuery,
  type UpdateTaskInput,
  updateTaskSchema
} from "../schemas/task.schemas.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { paginationArgs, paginationMeta } from "../utils/pagination.js";

export const taskRouter = Router();
taskRouter.use(requireAuth);

const taskInclude = {
  project: { select: { id: true, name: true } }
} as const;

const ensureOwnedProject = async (projectId: string, ownerId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true }
  });
  if (!project) {
    throw new ApiError(404, "Project not found", "NOT_FOUND");
  }
};

taskRouter.get(
  "/",
  validate({ query: taskQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = req.validated!.query as TaskQuery;
    const where: Prisma.TaskWhereInput = {
      project: { ownerId: req.auth!.sub },
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { description: { contains: query.search } }
            ]
          }
        : {}),
      ...(query.dueFrom || query.dueTo
        ? {
            dueDate: {
              ...(query.dueFrom ? { gte: query.dueFrom } : {}),
              ...(query.dueTo ? { lte: query.dueTo } : {})
            }
          }
        : {})
    };

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { [query.sortBy]: query.sortOrder },
        ...paginationArgs(query)
      }),
      prisma.task.count({ where })
    ]);
    res.json({ data: tasks, pagination: paginationMeta(total, query) });
  })
);

taskRouter.post(
  "/",
  validate({ body: createTaskSchema }),
  asyncHandler(async (req, res) => {
    const input = req.validated!.body as CreateTaskInput;
    await ensureOwnedProject(input.projectId, req.auth!.sub);
    const task = await prisma.task.create({
      data: input,
      include: taskInclude
    });
    res.status(201).json({ data: task });
  })
);

taskRouter.get(
  "/:id",
  validate({ params: idParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.validated!.params as { id: string };
    const task = await prisma.task.findFirst({
      where: {
        id,
        project: { ownerId: req.auth!.sub }
      },
      include: taskInclude
    });
    if (!task) throw new ApiError(404, "Task not found", "NOT_FOUND");
    res.json({ data: task });
  })
);

const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.validated!.params as { id: string };
    const input = req.validated!.body as UpdateTaskInput;

    const existing = await prisma.task.findFirst({
      where: {
        id,
        project: { ownerId: req.auth!.sub }
      },
      select: { id: true }
    });
    if (!existing) throw new ApiError(404, "Task not found", "NOT_FOUND");
    if (input.projectId) {
      await ensureOwnedProject(input.projectId, req.auth!.sub);
    }

    const task = await prisma.task.update({
      where: { id },
      data: input,
      include: taskInclude
    });
    res.json({ data: task });
  });

const validateTaskUpdate = validate({
  params: idParamsSchema,
  body: updateTaskSchema
});
taskRouter.patch("/:id", validateTaskUpdate, updateTask);
taskRouter.put("/:id", validateTaskUpdate, updateTask);

taskRouter.delete(
  "/:id",
  validate({ params: idParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.validated!.params as { id: string };
    const result = await prisma.task.deleteMany({
      where: {
        id,
        project: { ownerId: req.auth!.sub }
      }
    });
    if (result.count === 0) throw new ApiError(404, "Task not found", "NOT_FOUND");
    res.status(204).send();
  })
);
