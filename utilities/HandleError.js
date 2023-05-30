class HandleError extends Error {
  // Class to handle operational Errors (Expected/Predicted - not unexpected)
  constructor(errorCode, errorMsg) {
    super(errorMsg); // Calls the parent constructor

    this.errorCode = errorCode;
    this.statusMsg = "";
    if (!`${errorCode}`.startsWith("4")) {
      this.statusMsg = "error";
    } else {
      this.statusMsg = "fail";
    }

    this.isExpectedError = true;

    // constructor function call when new Error created will NOT appear on the error STACK TRACE.
    Error.captureStackTrace(this, this.constructor); // <-- To make it appear
  }
}

module.exports = HandleError;
