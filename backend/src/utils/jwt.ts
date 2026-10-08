import { randomUUID } from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
  email: string;
  exp: number;
}

export const signAccessToken = (user: {
  id: string;
  email: string;
}): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    subject: user.id,
    jwtid: randomUUID()
  };
  return jwt.sign({ email: user.email }, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });

  if (
    typeof payload === "string" ||
    !payload.sub ||
    !payload.jti ||
    !payload.exp ||
    typeof payload.email !== "string"
  ) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }

  return payload as AuthTokenPayload;
};
