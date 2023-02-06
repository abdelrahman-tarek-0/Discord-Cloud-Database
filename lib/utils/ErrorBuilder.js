class ErrorBulder extends Error {
  constructor(message,errorObj) {
    super(message);
    this.isOperational = true;
    this.error = errorObj
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorBulder