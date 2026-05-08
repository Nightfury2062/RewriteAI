const errorHandler = (err, req, res, next) => {
  // Log internal error to server console (avoiding stack traces in response)
  console.error('Error caught by global handler:', err);

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: 'Something went wrong'
  });
};

module.exports = errorHandler;
