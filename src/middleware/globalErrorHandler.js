const globalErrorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  const stack =
    process.env.NODE_ENV !== "development" ? "An error occurred" : err.stack;
  res.status(status).json({ error: message, success: false, stack });
};
