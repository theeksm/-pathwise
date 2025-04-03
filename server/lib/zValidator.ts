import { Request, Response } from "express";
import { z } from "zod";

export function zValidator(type: "body" | "params" | "query", schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: Function) => {
    try {
      req[type] = schema.parse(req[type]);
      next();
    } catch (error) {
      return res.status(400).json({ message: "Validation failed", error });
    }
  };
}
