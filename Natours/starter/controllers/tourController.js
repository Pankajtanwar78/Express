const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

module.exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

module.exports.checkId = (req, res, next, val) => {
  const id = req.params.id * 1;
  if (id < 0 || id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'tour is not valid',
    });
  }
  // console.log(`Tour id is ${val}`);
  next();
};

module.exports.getAllTours = (req, res) => {
  // console.log(req.body.requestTime);
  res.status(200).json({
    status: 'success',
    numberOfTours: tours.length,
    requestTime: req.body.requestTime,
    data: {
      tours,
    },
  });
};

module.exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

module.exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

module.exports.updateTour = (req, res) => {
  const newtours = [...tours];
  const id = req.params.id * 1;

  newtours.map(el => {
    if (el.id === id) {
      el.duration = req.body.duration;
    }
    return el;
  });

  const tour = newtours.find(el => el.id === id);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(newtours),
    err => {
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    }
  );
};

module.exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const newtours = tours.filter(el => el.id !== id);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(newtours),
    err => {
      res.status(200).json({
        status: 'success',
      });
    }
  );
};
