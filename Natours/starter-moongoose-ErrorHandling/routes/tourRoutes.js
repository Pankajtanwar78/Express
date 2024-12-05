const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  top5Cheap,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router();

// router.param('id', checkId);
router.route('/top-5-cheap').get(top5Cheap, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plans/:year').get(getMonthlyPlan);

// To support ERROR HANDLING STEP: 5
// we can wrap here also the catch async like below
// router.route('/').get(catchAysnc(getAllTours)).post(/*checkBody,*/ createTour);
// But this is not a good [practive as
// we don't know exactly from here which is async fn and which is not]

router.route('/').get(getAllTours).post(/*checkBody,*/ createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
