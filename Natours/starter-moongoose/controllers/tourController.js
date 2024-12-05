// const fs = require('fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');

module.exports.top5Cheap = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,ratingsAverage,price,difficulty,duration,summary';
  req.query.limit = '5';
  next();
};

module.exports.createTour = async (req, res) => {
  // This method is to create an instance of Tour model to create a document
  // newTour is refers to a document which needs to be save.
  // Save returns promise and so on.
  // ....................................
  // const newTour = new Tour({});
  // newTour.save().then().catch();
  // ....................................
  // We can do the things directly on TOur model via create api and no need to save explicitly
  // And also it returns a promise
  // And instead of using this lets use async await
  // ....................................
  // Tour.create({}).then().catch();
  // ....................................
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: 'Invalid data sent!',
    });
  }
};

module.exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

// module.exports.getAllTours = async (req, res) => {
//   try {
//     console.log(req.query);

//     // 127.0.0.1:3000/api/v1/tours?difficulty=easy&duration[gte]=5&page=2&sort=true&limit=5
//     // results: {
//     //   difficulty: 'easy',
//     //   duration: { gte: '5' }, // notice $ sign not available
//     //   page: '2',
//     //   sort: 'true',
//     //   limit: '5'
//     // }

//     // BUILD QUERY
//     // Filtering
//     const queryObj = { ...req.query };
//     const excludeFields = ['page', 'sort', 'limit', 'fields'];
//     excludeFields.forEach(el => delete queryObj[el]);

//     // Advance filtering
//     let queryStr = JSON.stringify(queryObj); // As replace works on strings need stringify
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

//     let query = Tour.find(JSON.parse(queryStr));

//     // SORTING
//     if (req.query.sort) {
//       // multiple field in sorting
//       const sortBy = req.query.sort.split(',').join(' ');
//       console.log(sortBy);

//       query = query.sort(sortBy);
//     } else {
//       query = query.sort('-createdAt');
//     }

//     // FIELD LIMITING
//     if (req.query.fields) {
//       const fields = req.query.fields.split(',').join(' ');
//       query = query.select(fields);
//     } else {
//       query = query.select('-__v');
//     }

//     // PAGINATION
//     // page=2&limit=10 => page1: 1-10, page2: 11-20 and so on

//     // query = query.skip(10).limit(10); // TO show the data from 2nd page we need to skip 10

//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 10;
//     const skip = (page - 1) * limit;
//     query = query.skip(skip).limit(limit);

//     // Handle page validation
//     if (req.query.page) {
//       const numTours = await Tour.countDocuments();
//       if (skip >= numTours) {
//         throw new Error('This page does not exist');
//       }
//     }

//     // 127.0.0.1:3000/api/v1/tours?difficulty=easy&duration[gte]=5&page=2&sort=true&limit=5
//     // results: { difficulty: 'easy', duration: { gte: '5' } } // $ sign not there
//     console.log(queryObj);
//     console.log(JSON.parse(queryStr));

//     // This is one mongoDB way
//     // const tours = await Tour.find({
//     //   duration: 5,
//     //   difficulty: 'easy',
//     // });

//     // This is very simple
//     // (but it will create problem when we have filters like page for pagination in query)
//     // In this way we can't chain the query (for page, limit etc )if we use await, so we need to save queryObj out of it
//     // const tours = await Tour.find(queryObj);

//     // use where to filter in mongoose
//     // **IMPORTANT** : Tour.find(queryObj) return query object then we can chain (only if we not use await)
//     // const tours = await Tour.find()
//     //   .where('duration')
//     //   .equals(5)
//     //   .where('difficulty')
//     //   .equals('easy');

//     // with respect to query variable below (don't await)
//     // const query = Tour.find()
//     //   .where('duration')
//     //   .equals(5)
//     //   .where('difficulty')
//     //   .equals('easy');

//     // EXECUTE QUERY
//     const tours = await query;

//     // SEND RESPONSE
//     res.status(200).json({
//       status: 'Success',
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'Fail',
//       message: 'Bad request to get the post',
//     });
//   }
// };

module.exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

module.exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    });
    res.status(200).json({
      status: 'success',
      tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

module.exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

module.exports.getTourStats = async (req, res) => {
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

  try {
    res.status(200).json({
      status: 'Successss',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

module.exports.getMonthlyPlan = async (req, res) => {
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

  try {
    res.status(200).json({
      status: 'Successss',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// module.exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// module.exports.checkId = (req, res, next, val) => {
//   const id = req.params.id * 1;
//   if (id < 0 || id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'tour is not valid',
//     });
//   }
//   // console.log(`Tour id is ${val}`);
//   next();
// };

// module.exports.getAllTours = (req, res) => {
//   // console.log(req.body.requestTime);
//   res.status(200).json({
//     status: 'success',
//   });
//   // res.status(200).json({
//   //   status: 'success',
//   //   numberOfTours: tours.length,
//   //   requestTime: req.body.requestTime,
//   //   data: {
//   //     tours,
//   //   },
//   // });
// };

// module.exports.getTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//   });

//   // const id = req.params.id * 1;
//   // const tour = tours.find(el => el.id === id);

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour,
//   //   },
//   // });
// };

// module.exports.createTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//   });

//   // const newId = tours[tours.length - 1].id + 1;
//   // // eslint-disable-next-line node/no-unsupported-features/es-syntax
//   // const newTour = { id: newId, ...req.body };
//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/../dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   err => {
//   //     res.status(201).json({
//   //       status: 'success',
//   //       data: {
//   //         tour: newTour,
//   //       },
//   //     });
//   //   }
//   // );
// };

// module.exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//   });

//   // const newtours = [...tours];
//   // const id = req.params.id * 1;

//   // newtours.map(el => {
//   //   if (el.id === id) {
//   //     el.duration = req.body.duration;
//   //   }
//   //   return el;
//   // });

//   // const tour = newtours.find(el => el.id === id);

//   // fs.writeFile(
//   //   `${__dirname}/../dev-data/data/tours-simple.json`,
//   //   JSON.stringify(newtours),
//   //   err => {
//   //     res.status(200).json({
//   //       status: 'success',
//   //       data: {
//   //         tour,
//   //       },
//   //     });
//   //   }
//   // );
// };

// module.exports.deleteTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//   });

//   // const id = req.params.id * 1;
//   // const newtours = tours.filter(el => el.id !== id);

//   // fs.writeFile(
//   //   `${__dirname}/../dev-data/data/tours-simple.json`,
//   //   JSON.stringify(newtours),
//   //   err => {
//   //     res.status(200).json({
//   //       status: 'success',
//   //     });
//   //   }
//   // );
// };
