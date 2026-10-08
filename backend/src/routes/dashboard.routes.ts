import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { projectStatuses } from "../schemas/project.schemas.js";
import { taskPriorities, taskStatuses } from "../schemas/task.schemas.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

const groupedCount = (
  group: { _count?: true | { _all?: number } } | undefined
) =>
  group && typeof group._count === "object" ? (group._count._all ?? 0) : 0;

dashboardRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const ownerId = req.auth!.sub;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      projectGroups,
      taskStatusGroups,
      taskPriorityGroups,
      overdueTasks,
      dueSoonTasks,
      recentProjects,
      recentTasks
    ] = await prisma.$transaction([
      prisma.project.groupBy({
        by: ["status"],
        where: { ownerId },
        orderBy: { status: "asc" },
        _count: { _all: true }
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: { project: { ownerId } },
        orderBy: { status: "asc" },
        _count: { _all: true }
      }),
      prisma.task.groupBy({
        by: ["priority"],
        where: { project: { ownerId } },
        orderBy: { priority: "asc" },
        _count: { _all: true }
      }),
      prisma.task.count({
        where: {
          project: { ownerId },
          dueDate: { lt: now },
          status: { not: "COMPLETED" }
        }
      }),
      prisma.task.count({
        where: {
          project: { ownerId },
          dueDate: { gte: now, lte: sevenDaysFromNow },
          status: { not: "COMPLETED" }
        }
      }),
      prisma.project.findMany({
        where: { ownerId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { tasks: true } }
        }
      }),
      prisma.task.findMany({
        where: { project: { ownerId } },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          project: { select: { id: true, name: true } }
        }
      })
    ]);

    const projectByStatus = Object.fromEntries(
      projectStatuses.map((status) => [
        status,
        groupedCount(projectGroups.find((group) => group.status === status))
      ])
    );
    const taskByStatus = Object.fromEntries(
      taskStatuses.map((status) => [
        status,
        groupedCount(taskStatusGroups.find((group) => group.status === status))
      ])
    );
    const taskByPriority = Object.fromEntries(
      taskPriorities.map((priority) => [
        priority,
        groupedCount(taskPriorityGroups.find((group) => group.priority === priority))
      ])
    );

    const totalProjects = Object.values(projectByStatus).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalTasks = Object.values(taskByStatus).reduce(
      (sum, count) => sum + count,
      0
    );

    res.json({
      data: {
        totalProjects,
        totalTasks,
        completedTasks: taskByStatus.COMPLETED,
        pendingTasks: taskByStatus.PENDING,
        projectsInProgress: projectByStatus.IN_PROGRESS,
        projects: {
          total: totalProjects,
          byStatus: projectByStatus
        },
        tasks: {
          total: totalTasks,
          byStatus: taskByStatus,
          byPriority: taskByPriority,
          overdue: overdueTasks,
          dueWithinSevenDays: dueSoonTasks
        },
        recentProjects,
        recentTasks
      }
    });
  })
);
