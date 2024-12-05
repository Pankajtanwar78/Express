/*******************************************************
 * ERROR HANDLING STEP: 5 -> Catching errors in async functions
 * *****************************************************
 * create catchAsync Api
 * -> Via using this we can get rid of using try catch in async functions
 * -> This will receive a complete async function as an argument
 * -> Very important this also require next so that it can throw error to our global error handler mw
 * -> Add next parameter to all the async function which will call this catchAsyn Api
 *
 *
 */

/* If we use this call directly then it throw error like
 * fn(req, res, next).catch(err => next(err));
 *     ^
 * ReferenceError: req is not defined
 * And similar error for res and next
 * -> THis is happening because we didn't ass req, res and next as parameter
 *    instead we pass complete async function as parameter
 *
 * Also with this line below we are directly calling the function
 * --> So we are calling catchAsyn Api directly when wrapping it
 *     and here we are directly calling all the data in this function
 *     we can say it should use a callback
 *
 * In short we can say we are not waiting for express to call it and calling it directly by our own
 */

const catchAsync = fn => {
  // fn(req, res, next).catch(err => next(err));
  console.log('just to avoid eslint error');
  return (req, res, next) => {
    //fn(req, res, next).catch(err => next(err));
    // We can rewrite this line as next directly in catch block
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
