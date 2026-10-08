import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamsSchema } from "../schemas/common.js";
import {
  createProjectSchema,
  projectQuerySchema,
  type CreateProjectInput,
  type ProjectQuery,
  type UpdateProjectInput,
  updateProjectSchema
} from "../schemas/project.schemas.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { paginationArgs, paginationMeta } from "../utils/pagination.js";

export const projectRouter = Router();
projectRouter.use(requireAuth);

const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { tasks: true } }
} as const;

projectRouter.get(
  "/",
  validate({ query: projectQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = req.validated!.query as ProjectQuery;
    const where: Prisma.ProjectWhereInput = {
      ownerId: req.auth!.sub,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { description: { contains: query.search } }
            ]
          }
        : {})
    };

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        select: projectSelect,
        orderBy: { [query.sortBy]: query.sortOrder },
        ...paginationArgs(query)
      }),
      prisma.project.count({ where })
    ]);

    res.json({ data: projects, pagination: paginationMeta(total, query) });
  })
);

projectRouter.post(
  "/",
  validate({ body: createProjectSchema }),
  asyncHandler(async (req, res) => {
    const input = req.validated!.body as CreateProjectInput;
    const project = await prisma.project.create({
      data: { ...input, ownerId: req.auth!.sub },
      select: projectSelect
    });
    res.status(201).json({ data: project });
  })
);

projectRouter.get(
  "/:id",
  validate({ params: idParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.validated!.params as { id: string };
    const project = await prisma.project.findFirst({
      where: { id, ownerId: req.auth!.sub },
      select: projectSelect
    });
    if (!project) throw new ApiError(404, "Project not found", "NOT_FOUND");
    res.json({ data: project });
  })
);

const updateProject = asyncHandler(async (req, res) => {
    const { id } = req.validated!.params as { id: string };
    const input = req.validated!.body as UpdateProjectInput;
    const existing = await prisma.project.findFirst({
      where: { id, ownerId: req.auth!.sub },
      select: { startDate: true, endDate: true }
    });
    if (!existing) throw new ApiError(404, "Project not found", "NOT_FOUND");

    const startDate =
      "startDate" in input ? input.startDate ?? null : existing.startDate;
    const endDate = "endDate" in input ? input.endDate ?? null : existing.endDate;
    if (startDate && endDate && endDate < startDate) {
      throw new ApiError(
        400,
        "endDate must be on or after startDate",
        "VALIDATION_ERROR"
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: input,
      select: projectSelect
    });
    res.json({ data: project });
  });

const validateProjectUpdate = validate({
  params: idParamsSchema,
  body: updateProjectSchema
});
projectRouter.patch("/:id", validateProjectUpdate, updateProject);
projectRouter.put("/:id", validateProjectUpdate, updateProject);

projectRouter.delete(
  "/:id",
  validate({ params: idParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.validated!.params as { id: string };
    const result = await prisma.project.deleteMany({
      where: { id, ownerId: req.auth!.sub }
    });
    if (result.count === 0) {
      throw new ApiError(404, "Project not found", "NOT_FOUND");
    }
    res.status(204).send();
  })
);
