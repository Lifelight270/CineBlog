export const notFound = (req, res) =>
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || 'Something went wrong.';
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  }
  if (err.code === 11000) {
    status = 409;
    message = 'That value is already taken.';
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id.';
  }
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
