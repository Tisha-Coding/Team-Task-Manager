const errorHandler = (err, req, res, next) => {
  if (err.code === "28P01") {
    return res.status(500).json({
      success: false,
      message: "Database authentication failed - check server configuration",
      error: {
        code: err.code,
        detail: "Password authentication failed for user",
      },
    });
  }

  if (err.code === "3D000") {
    return res.status(500).json({
      success: false,
      message: "Database not found - schema may not be initialized",
      error: { code: err.code },
    });
  }

  if (err.code === "42P01") {
    return res.status(500).json({
      success: false,
      message: "Database table not found - run schema.sql",
      error: { code: err.code },
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? {
            code: err.code,
            message: err.message,
            detail: err.detail,
            hint: err.hint,
          }
        : {},
  });
};

module.exports = errorHandler;
