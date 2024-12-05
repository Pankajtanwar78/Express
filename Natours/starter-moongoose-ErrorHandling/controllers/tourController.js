const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

module.exports.top5Cheap = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,ratingsAverage,price,difficulty,duration,summary';
  req.query.limit = '5';
  next();
};

// To support ERROR HANDLING STEP: 5
// add next in the parameter and also wrap the async function to pass to catchAsync Api
// Remove try catch block -> It is not required as catch Asyn Api will catch the error
// and pass to glocal error handling middleware
module.exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });

  // try {
  //   const newTour = await Tour.create(req.body);
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: 'Invalid data sent!',
  //   });
  // }
});

// All code above is something equivalent to below
// module.exports.createTour = (req, res, next) => {
//   (async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   }).catch(err => next(err));
// };

module.exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new ApiFeatures(Tour.find(), req.query);
  features.filter().sort().fields().pagination();
  const tours = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      tours,
    },
  });

  // try {
  //   console.log(req.query);
  //   const features = new ApiFeatures(Tour.find(), req.query);
  //   features.filter().sort().fields().pagination();
  //   const tours = await features.query;
  //   // SEND RESPONSE
  //   res.status(200).json({
  //     status: 'Success',
  //     results: tours.length,
  //     data: {
  //       tours,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: err,
  //   });
  // }
});

module.exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  /*******************************************************
   * ERROR HANDLING STEP: 6
   * *****************************************************
   * This is the case when ID is somewhat similar to original but not correct
   * In that case result will be there with no catch
   * for example:
   * Actual _id: 67450359f6ff3f5f169a1b28
   * Queried _id: 67450359f6ff3f5f169a1b20
   * -----------------------------------------------------
   * If tour does not exist then simply use AppError class to throw error
   * which inturn call global error handling middleware via next call
   *
   * NOTE: this doesn't include cast error where id is not look like actual id
   * For ex:
   * Actual _id: 67450359f6ff3f5f169a1b28
   * Queried _id: fffffff
   * --> THis is the case of cast error
   */
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });

  // try {
  //   const tour = await Tour.findById(req.params.id);
  //   res.status(200).json({
  //     status: 'Success',
  //     data: {
  //       tour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'Fail',
  //     message: err,
  //   });
  // }
});

module.exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // ERROR HANDLING STEP: 6
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  console.log('Panks');

  res.status(200).json({
    status: 'success',
    tour,
  });

  // try {
  //   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
  //     new: true,
  //     runValidator: true,
  //   });
  //   res.status(200).json({
  //     status: 'success',
  //     tour,
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'Fail',
  //     message: err,
  //   });
  // }
});

module.exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  // ERROR HANDLING STEP: 6
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });

  // try {
  //   const tour = await Tour.findByIdAndDelete(req.params.id);
  //   res.status(200).json({
  //     status: 'Success',
  //     data: {
  //       tour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: err,
  //   });
  // }
});

module.exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numOfTours: { $sum: 1 },
        numOfRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    {
      $match: { _id: { $ne: 'DIFFICULT' } },
    },
  ]);

  res.status(200).json({
    status: 'Successss',
    data: {
      stats,
    },
  });

  // try {
  //   res.status(200).json({
  //     status: 'Successss',
  //     data: {
  //       stats,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: err,
  //   });
  // }
});

module.exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%B',
            date: '$startDates',
          },
        },
        totalTour: { $sum: 1 },
        names: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { totalTour: -1 },
    },
  ]);

  res.status(200).json({
    status: 'Successss',
    data: {
      plan,
    },
  });

  // try {
  //   res.status(200).json({
  //     status: 'Successss',
  //     data: {
  //       plan,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: err,
  //   });
  // }
});
