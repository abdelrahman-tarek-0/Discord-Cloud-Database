class ErrorBuilder extends Error {
   constructor(message, errorObj) {
      super(message)
      this.error = errorObj
      Error.captureStackTrace(this, this.constructor)
   }
}

module.exports = ErrorBuilder
