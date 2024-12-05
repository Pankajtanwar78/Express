/*******************************************************
 * ERROR HANDLING STEP: 3
 * *****************************************************
 * -----------------------------------------------------
 * Create a class AppError which will set the statusCode and status and message etc.
 * It is extended from Error class which is automattically handle the message as default functionality
 * isOperational -> To handle only operational errors handled by us, not some crazy programming and other error
 *
 * -----------------------------------------------------
 * Error.captureStackTrace(this, this.constructor);
 * The captureStackTrace method customizes the stack trace so it starts from where you want it to.
 *
 * this: The current instance of AppError. The stack trace will be attached to this object.
 *
 * this.constructor: This tells the stack trace to skip showing the AppError constructor itself in the trace.
 *      The trace will start from the point where AppError was created.
 *
 * -----------------------------
 * If you don't use Error.captureStackTrace,
 * the stack trace might include unnecessary information about the AppError class itself:
 *
 * Error: Something went wrong
 *   at new AppError (path/to/AppError.js:12:15)
 *   at someFunction (path/to/file.js:24:9)
 *   at main (path/to/main.js:45:3)
 * -----------------------------
 *
 * With Error.captureStackTrace, the stack trace skips the AppError constructor:
 *
 * Error: Something went wrong
 *  at someFunction (path/to/file.js:24:9)
 *  at main (path/to/main.js:45:3)
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
