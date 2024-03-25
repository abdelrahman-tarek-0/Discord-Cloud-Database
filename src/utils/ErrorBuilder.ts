export default class ErrorBuilder extends Error {
    error: any

    constructor(message: string, errorObj: any) {
        super(message)
        this.error = errorObj

        // Error.captureStackTrace(this, this.constructor);
    }
}
