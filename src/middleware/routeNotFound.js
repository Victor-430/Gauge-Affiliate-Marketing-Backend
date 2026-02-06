const routeNotFound = (res, req) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
};
