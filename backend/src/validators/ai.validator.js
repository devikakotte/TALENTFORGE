const { body, param } = require('express-validator');

const jobIdValidator = [param('jobId').isMongoId().withMessage('Invalid job id')];

const skillParamValidator = [
  param('skill').trim().isLength({ min: 1, max: 60 }).withMessage('Invalid skill'),
];

const submitQuizValidator = [
  param('quizId').isMongoId().withMessage('Invalid quiz id'),
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*').isInt({ min: 0 }).withMessage('Each answer must be an option index'),
];

module.exports = { jobIdValidator, skillParamValidator, submitQuizValidator };
