import type { AuthTokenPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
      token?: string;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
