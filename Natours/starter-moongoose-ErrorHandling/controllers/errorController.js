const AppError = require('../utils/appError');

/*******************************************************
 * ERROR HANDLING STEP: 4 -> Just refactoring of STEP: 2
 * *****************************************************
 * This is just a common error handler which we use in a middleware to handle all errors
 *
 */
// module.exports = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// };

/*******************************************************
 * ERROR HANDLING STEP: 7 -> Distinguish Dev and Production errors
 * *****************************************************
 * In production we want to leak the little information to the client as possible
 * -> Nice user friendly message
 * -> We want to send to operational error to production created by us only to client
 * -> Otherwise send some generic messages
 *
 * In development we want to log as much information as possible.
 * ->
 */

const handleCastErrorDB = err => {
  /* Details:
  * "err": {
     "stringValue": "\"ffffff\"",
     "valueType": "string",
     "kind": "ObjectId",
     "value": "ffffff",
     "path": "_id",
     "reason": {},
     "name": "CastError",
     "message": "Cast to ObjectId failed for value \"ffffff\" (type string) at path \"_id\" for model \"Tour\""
   },
  */

  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  /* Details:
   "err": {
        "errorResponse": {
            "index": 0,
            "code": 11000,
            "errmsg": "E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: \"The PANKY Hiker1\" }",
            "keyPattern": {
                "name": 1
            },
            "keyValue": {
                "name": "The PANKY Hiker1"
            }
        },
        "index": 0,
        "code": 11000,
        "keyPattern": {
            "name": 1
        },
        "keyValue": {
            "name": "The PANKY Hiker1"
        },
        "statusCode": 500,
        "status": "error"
    },
  */

  const message = `Duplicate field value ${err.keyValue.name}: should use another value`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  /* Details:
   "err": {
        "errors": {
            "name": {
                "name": "ValidatorError",
                "message": "A tour name should be more than or equal to 10 character",
                "properties": {
                    "message": "A tour name should be more than or equal to 10 character",
                    "type": "minlength",
                    "minlength": 10,
                    "path": "name",
                    "fullPath": "name",
                    "value": "short"
                },
                "kind": "minlength",
                "path": "name",
                "value": "short"
            },
            "difficulty": {
                "name": "ValidatorError",
                "message": "Difficulty is either: easy, medium and difficult",
                "properties": {
                    "message": "Difficulty is either: easy, medium and difficult",
                    "type": "enum",
                    "enumValues": [
                        "easy",
                        "medium",
                        "difficult"
                    ],
                    "path": "difficulty",
                    "fullPath": "difficulty",
                    "value": "whatever"
                },
                "kind": "enum",
                "path": "difficulty",
                "value": "whatever"
            },
            "ratingsAverage": {
                "name": "ValidatorError",
                "message": "Rating must be below 5.0",
                "properties": {
                    "message": "Rating must be below 5.0",
                    "type": "max",
                    "max": 5,
                    "path": "ratingsAverage",
                    "fullPath": "ratingsAverage",
                    "value": 50
                },
                "kind": "max",
                "path": "ratingsAverage",
                "value": 50
            }
        },
        "_message": "Validation failed",
        "statusCode": 500,
        "status": "error",
        "name": "ValidationError",
        "message": "Validation failed: name: A tour name should be more than or equal to 10 character, difficulty: Difficulty is either: easy, medium and difficult, ratingsAverage: Rating must be below 5.0"
    },
  */
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming and some unknown errors: don't leak error details
  else {
    // log error
    console.error('Error', err);

    // send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    /*******************************************************
     * ERROR HANDLING STEP: 8 -> Handle other mongoose errors
     * Invalid Database IDs
     * Duplication database fields
     * Mongoose validation errors
     * *****************************************************
     * They should comes under isOperational category as we know these can happen and known to us
     * To handle such error we take some details from complete err object
     *
     * ---------------------------------------------------
     * Invalid Database IDs
     *
     * -> castError: when you give completely different id than expected
     * for example: expected: 127.0.0.1:3000/api/v1/tours/67450359f6ff3f5f169a1b28
     *              provided: 127.0.0.1:3000/api/v1/tours/wwwwwwww
     * In this case err.name = castError
     * ---------------------------------------------------
     *
     * Duplication database fields
     *
     * In this case err.code = 11000
     * ---------------------------------------------------
     *
     * Mongoose validation error
     * query:
     * 
     * {
            "ratingsAverage": 50,   // limit is from 1-5
            "difficulty": "whatever" // enum expectation only with 3 values
            "name": "short"         // minLength is 10
        }
     */

    /*
      The spread syntax only copies own enumerable properties of the object. 
      If err.name is an inherited property or a non-enumerable property, 
      it won't be copied into the error object.

      solutions:
      const error = { ...err, name: err.name };
      const error = Object.assign({}, err);


      for debugging:
      console.log(Object.getOwnPropertyDescriptors(err));
    */
    // console.log(Object.getOwnPropertyDescriptors(err));
    // console.log(err.name);
    let error = { ...err, name: err.name };

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    // console.log(error.name);

    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }

    sendErrorProd(error, res);
  }
};
