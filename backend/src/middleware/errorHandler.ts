import type { NextFunction, Request, Response } from "express";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("❌ Error Handling:", err.stack || err.message);

  // 1️⃣ Prefer a status supplied by the error itself
  const errorStatus = err.status ?? err.statusCode;

  // 2️⃣ If no error status, keep any status already set on the response (but only if it isn’t the default 200)
  const responseStatus = res.statusCode !== 200 ? res.statusCode : undefined;

  // 3️⃣ Default to 500 when nothing else is available
  const statusCode = errorStatus ?? responseStatus ?? 500;

  // Send a consistent JSON payload
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message,
  });
};

export default errorHandler;
