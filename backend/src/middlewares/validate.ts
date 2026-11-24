import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

declare module "express-serve-static-core" {
  interface Request {
    validated?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}

export function validate(schema: ZodType, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req[part]);

    if (!resultado.success) {
      next(resultado.error);
      return;
    }

    req.validated = {
      ...req.validated,
      [part]: resultado.data,
    };

    if (part === "body") {
      req.body = resultado.data;
    }

    next();
  };
}
