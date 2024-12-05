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
  // checkId,
  // checkBody,
} = require('../controllers/tourController');

const router = express.Router();

// router.param('id', checkId);
router.route('/top-5-cheap').get(top5Cheap, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plans/:year').get(getMonthlyPlan);
router.route('/').get(getAllTours).post(/*checkBody,*/ createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
