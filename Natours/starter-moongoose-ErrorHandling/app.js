const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.body.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/*******************************************************
 * ERROR HANDLING STEP: 1
 * *****************************************************
 *
 * -----------------------------------------------------
 * This is to handle all the route which are not handled till now
 * If request handle before this then it will already sent response back and
 * will never come to this position
 * In short: This will only hit if the url is not hit in above routes
 *
 * If some route not handled then express automatically sends some html results if not handled
 * -----------------------------------------------------
 *
 * -----------------------------------------------------
 * app.all -> handle all get, post, patch, delete etc
 * (*) is for all tupe of url
 * -> Send back response in json format
 * ${req.originalUrl} -> This will take the original URL requested
 * -----------------------------------------------------
 */
app.all('*', (req, res, next) => {
  // STEP: 1
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can'r find ${req.originalUrl} on this server!`,
  // });

  // To support STEP: 2
  // const err = new Error(`Can'r find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err);

  // To support STEP: 3
  next(new AppError(`Can'r find ${req.originalUrl} on this server!`, 404));
});

/*******************************************************
 * ERROR HANDLING STEP: 2
 * *****************************************************
 * -----------------------------------------------------
 * Define global error handling middleware
 * This will get called directly if some error occurs
 * If some error occurs all the other middleware will get skipped aprat from this
 * >>> Should mention err as the first parameter to make global error handling middleware
 * -----------------------------------------------------
 *
 * >>>> Same code to throw an error with statusCode and status and message
 * >>>> If next receive any argument then it will be considered as an error
 *
 * const err = new Error(`Can'r find ${req.originalUrl} on this server!`);
 * err.statusCode = 404;
 * err.status = 'fail';
 * next(err);
 */
// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

/*******************************************************
 * ERROR HANDLING STEP: 4 -> Just refactoring of STEP: 2
 * *****************************************************
 * As this is sending response back or we can say it is an handler
 * then we can create a controller for this
 */

app.use(globalErrorHandler);

module.exports = app;
