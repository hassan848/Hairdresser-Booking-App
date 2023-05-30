// const HandleError = require("./../utilities");

const dispatchError = function (error, req, res) {
  // API
  if (req.originalUrl.startsWith("/api")) {
    res.status(error.statusCode).json({
      err: error,
      status: error.status,
      message: error.message,
      stack: error.stack,
    });
  } else {
    res.status(error.statusCode).json({
      err: error,
      status: error.status,
      message: error.message,
      stack: error.stack,
    });
  }
};

// Implementing a GLOBAL ERROR HANDLING MIDDLEWARE FUNCTION
module.exports = (err, req, res, next) => {
  // Having four params & 'err' as one of them will immediately inform express that this is the GLOBAL ERROR HANDLING FUNCTION
  err.statusCode = err.errorCode || 500;
  err.errorCode = undefined;
  err.status = err.statusMsg || "error";
  err.statusMsg = undefined;

  dispatchError(err, req, res);
};
