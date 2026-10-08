import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { authRateLimit } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { signAccessToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export const authRouter = Router();

const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  createdAt: true,
  updatedAt: true
} as const;

authRouter.post(
  "/register",
  authRateLimit,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const input = req.validated!.body as {
      fullName: string;
      email: string;
      password: string;
    };

    const existing = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true }
    });
    if (existing) {
      throw new ApiError(409, "Email is already registered", "EMAIL_IN_USE");
    }

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash: await hashPassword(input.password)
      },
      select: publicUserSelect
    });
    const token = signAccessToken(user);

    res.status(201).json({ data: { token, user } });
  })
);

authRouter.post(
  "/login",
  authRateLimit,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const input = req.validated!.body as { email: string; password: string };
    const userWithPassword = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (
      !userWithPassword ||
      !(await verifyPassword(input.password, userWithPassword.passwordHash))
    ) {
      throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const { passwordHash: _passwordHash, ...user } = userWithPassword;
    res.json({ data: { token: signAccessToken(user), user } });
  })
);

authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const auth = req.auth!;
    await prisma.revokedToken.upsert({
      where: { jti: auth.jti },
      create: {
        jti: auth.jti,
        userId: auth.sub,
        expiresAt: new Date(auth.exp * 1000)
      },
      update: {}
    });
    res.status(204).send();
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.sub },
      select: publicUserSelect
    });
    if (!user) throw new ApiError(404, "User not found", "NOT_FOUND");
    res.json({ data: user });
  })
);
