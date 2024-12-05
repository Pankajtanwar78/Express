const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour name is required'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name should be less than or equal to 40 character',
      ],
      minLength: [
        10,
        'A tour name should be more than or equal to 10 character',
      ],
      // validator 3rd party library
      // validate: [validator.isAlpha, 'Tour name Must only contain characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      //enum: ['easy', 'medium', 'difficult'],
      enum: {
        values: ['easy', 'medium', 'difficult'], // can work on strings not on number
        message: 'Difficulty is either: easy, medium and difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], // works with number and dates
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // To use this function otherwise can use arrow function
          // This only points to the current document
          return val < this.price; // true means no error
        },
        message: 'Discount price ({VALUE}) should be less than actual price',
      },
      // validator: function (val) {
      //   // To use this function otherwise can use arrow function
      //   return val < this.price;
      // },
    },
    slug: String,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // Permanently hide to show this field while querying
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// This durationWeeks cannot be used as a query as it is not the part of actual database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// not run before insert apis
tourSchema.pre('save', function (next) {
  console.log(this); // This contain the current document about to create in create command
  this.slug = slugify(this.name, { lower: true }); // SLugify a package just to change the name and remove special char etc.
  next();
});

tourSchema.post('save', (doc, next) => {
  console.log(doc); // This contain the current document after save and create
  next();
});

// THis is executed after actual query will execute (but before actual query, we already chained everythng like sort etc.)
// This below middleware will work just before: await query thing
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// We can see how much time does query take to execute in post : this is one of the basic example
tourSchema.post(/^find/, function (docs, next) {
  console.log(`elapsed time ${Date.now() - this.start} millisecond`);
  // console.log(docs);
  next();
});

//AGGREGATE MIDDLEWARE :  run before aggregarion can modify and see the pipeline required
// post is also valid for this
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 297,
// });

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => console.log(err));

module.exports = Tour;
